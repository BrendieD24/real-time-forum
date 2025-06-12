package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/models"
	"real-time-forum/utils"
	"time"

	"sync"

	"github.com/gorilla/websocket"
)

// Structure pour les messages reçus du client
type WebSocketMessage struct {
	Type       string `json:"type"`
	ReceiverID string `json:"receiver_id"`
	Content    string `json:"content"`
}

// 🗺️ Map userID → websocket.Conn
var UserConnections = make(map[string]*websocket.Conn)
var userConnMutex sync.Mutex

// ⚙️ Upgrader pour WebSocket
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// GET /users/status
func GetUserStatusHandler(w http.ResponseWriter, r *http.Request) {
	statuses := make([]models.UserStatus, 0)
	// Vérifier si l'utilisateur est connecté
	userID, err := GetConnectedUserID(r)
	if err != nil {
		http.Error(w, "Non connecté", http.StatusUnauthorized)
		return
	}

	// On récupère tous les users
	rows, err := db.DB.Query("SELECT id, nickname FROM users")
	if err != nil {
		http.Error(w, "Erreur récupération users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var id, nickname string
		rows.Scan(&id, &nickname)

		userConnMutex.Lock()
		online := UserConnections[id] != nil
		userConnMutex.Unlock()

		statuses = append(statuses, models.UserStatus{
			ID:       id,
			Nickname: nickname,
			Online:   online,
		})
	}

	//Récuperer l'heure du dernier message avec chaque utilisateur avec lequel l'utilisateur a interagi
	for i, status := range statuses {
		if status.ID == userID {
			// Ne pas inclure l'utilisateur lui-même dans les messages
			statuses[i].LastMessageTime = "N/A" // Pas de message avec soi-même
			continue
		}
		var lastMessageTime sql.NullString
		err := db.DB.QueryRow(`
			SELECT MAX(created_at)
			FROM messages
			WHERE (sender_id = ? AND receiver_id = ?)
			OR (sender_id = ? AND receiver_id = ?)
		`, userID, status.ID, status.ID, userID).Scan(&lastMessageTime)
		if err != nil {
			log.Printf("Erreur récupération dernier message pour %s: %v", status.ID, err)
			statuses[i].LastMessageTime = "N/A" // Pas de message trouvé
			continue
		}

		if lastMessageTime.Valid {
			statuses[i].LastMessageTime = lastMessageTime.String
		} else {
			statuses[i].LastMessageTime = "" // Aucun message trouvé
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(statuses)
}

// WebSocket /ws/status
func UserStatusWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	userID, err := GetConnectedUserID(r)
	if err != nil {
		return
	}

	// Marquer comme online
	userConnMutex.Lock()
	UserConnections[userID] = conn
	userConnMutex.Unlock()

	// Traiter les messages entrants
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			break // Déconnexion détectée
		}

		if messageType == websocket.TextMessage {
			var msg WebSocketMessage
			if err := json.Unmarshal(p, &msg); err == nil {
				// Si c'est un message de chat
				if msg.Type == "chat" {
					handleChatMessage(userID, msg.ReceiverID, msg.Content)
				}
			}
		}
	}

	// Nettoyer la connexion à la déconnexion
	userConnMutex.Lock()
	delete(UserConnections, userID)
	userConnMutex.Unlock()
}

// Gère un message de chat
func handleChatMessage(senderID string, receiverID string, content string) {
	// Générer un UUID pour le message
	messageID := utils.GenerateUUID()

	// Timestamp actuel
	createdAt := time.Now()

	// Enregistrer le message dans la base de données avec UUID et timestamp
	_, err := db.DB.Exec(
		"INSERT INTO messages (id, sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, ?, ?)",
		messageID, senderID, receiverID, content, createdAt,
	)

	if err != nil {
		log.Printf("Erreur d'enregistrement du message: %v", err)
		return
	}

	// Notifier le destinataire s'il est connecté
	userConnMutex.Lock()
	receiverConn, isOnline := UserConnections[receiverID]
	userConnMutex.Unlock()

	if isOnline {
		// Récupérer le nom de l'expéditeur
		var senderName string
		err := db.DB.QueryRow("SELECT nickname FROM users WHERE id = ?", senderID).Scan(&senderName)
		if err != nil {
			log.Printf("Erreur récupération nom expéditeur: %v", err)
			return
		}

		// Envoyer une notification au destinataire
		chatNotification := map[string]interface{}{
			"type":        "chat",
			"id":          messageID,
			"sender_id":   senderID,
			"sender_name": senderName,
			"content":     content,
			"created_at":  createdAt,
		}

		notifData, _ := json.Marshal(chatNotification)
		receiverConn.WriteMessage(websocket.TextMessage, notifData)
	}
}
