package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/models"
	"real-time-forum/utils"

	"time"

	"github.com/gorilla/websocket"
)

var ChatConnections = make(map[string]*websocket.Conn)

var chatUpgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Handler GET /messages
func GetMessagesHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := GetConnectedUserID(r)
	if err != nil {
		http.Error(w, "Non connecté", http.StatusUnauthorized)
		return
	}

	otherID := r.URL.Query().Get("user")
	if otherID == "" {
		http.Error(w, "ID de l'autre utilisateur manquant", http.StatusBadRequest)
		return
	}

	rows, err := db.DB.Query(`
		SELECT u1.nickname, u2.nickname, m.content, m.created_at
		FROM messages m
		JOIN users u1 ON u1.id = m.sender_id
		JOIN users u2 ON u2.id = m.receiver_id
		WHERE (sender_id = ? AND receiver_id = ?)
		   OR (sender_id = ? AND receiver_id = ?)
		ORDER BY created_at ASC
	`, userID, otherID, otherID, userID)

	if err != nil {
		http.Error(w, "Erreur DB", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var msgs []models.MessageDisplay
	for rows.Next() {
		var m models.MessageDisplay
		if err := rows.Scan(&m.SenderName, &m.ReceiverName, &m.Content, &m.CreatedAt); err != nil {
			continue
		}
		msgs = append(msgs, m)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msgs)
}

// Handler POST /messages (optionnel, fallback REST)
func SendMessageHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := GetConnectedUserID(r)
	if err != nil {
		http.Error(w, "Non connecté", http.StatusUnauthorized)
		return
	}

	var payload struct {
		ReceiverID string `json:"receiver_id"`
		Content    string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Payload invalide", http.StatusBadRequest)
		return
	}

	if payload.ReceiverID == "" || payload.Content == "" {
		http.Error(w, "Paramètres manquants", http.StatusBadRequest)
		return
	}

	createdAt := time.Now().Format("2006-01-02 15:04:05")

	stmt, err := db.DB.Prepare(`INSERT INTO messages (id, sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, ?, ?)`)
	if err != nil {
		http.Error(w, "Erreur DB", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec(utils.GenerateUUID(), userID, payload.ReceiverID, payload.Content, createdAt)
	if err != nil {
		http.Error(w, "Erreur insertion", http.StatusInternalServerError)
		return
	}

	// Envoie un refresh en WebSocket si le receiver est connecté
	if conn, ok := ChatConnections[payload.ReceiverID]; ok && conn != nil {
		conn.WriteMessage(websocket.TextMessage, []byte("new_message"))
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Message envoyé"))
}

// Handler WebSocket /ws/chat
func UserChatWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := chatUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Erreur upgrade WebSocket :", err)
		return
	}
	defer conn.Close()

	userID, err := GetConnectedUserID(r)
	if err != nil {
		return
	}

	log.Println("User connecté au chat :", userID)
	ChatConnections[userID] = conn
	defer delete(ChatConnections, userID)

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		// Parse JSON reçu
		var payload struct {
			ReceiverID string `json:"receiver_id"`
			Content    string `json:"content"`
		}

		if err := json.Unmarshal(msg, &payload); err != nil {
			continue
		}

		// Enregistre en base
		createdAt := time.Now().Format("2006-01-02 15:04:05")
		stmt, err := db.DB.Prepare(`INSERT INTO messages (id, sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, ?, ?)`)
		if err == nil {
			stmt.Exec(utils.GenerateUUID(), userID, payload.ReceiverID, payload.Content, createdAt)
			stmt.Close()
		}

		// Notifie le receiver s'il est connecté
		if connReceiver, ok := ChatConnections[payload.ReceiverID]; ok && connReceiver != nil {
			connReceiver.WriteMessage(websocket.TextMessage, []byte("new_message"))
		}
	}
}
