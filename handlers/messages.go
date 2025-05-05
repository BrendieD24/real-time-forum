package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/models"
	"real-time-forum/utils"
	"time"

	"github.com/google/uuid"
)

func CreateMessageHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID, err := utils.GetConnectedUserID(r)
	if err != nil {
		http.Error(w, "Non connecté", http.StatusUnauthorized)
		return
	}

	var msg models.Message
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		http.Error(w, "Format JSON invalide", http.StatusBadRequest)
		return
	}

	if msg.ReceiverID == "" || msg.Content == "" {
		http.Error(w, "Données manquantes", http.StatusBadRequest)
		return
	}

	msg.ID = uuid.New().String()
	msg.SenderID = userID
	msg.CreatedAt = time.Now().Format("2006-01-02 15:04:05")

	_, err = db.DB.Exec(`
		INSERT INTO messages (id, sender_id, receiver_id, content, created_at)
		VALUES (?, ?, ?, ?, ?)`,
		msg.ID, msg.SenderID, msg.ReceiverID, msg.Content, msg.CreatedAt)

	if err != nil {
		http.Error(w, "Erreur base de données", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Message envoyé"))
}
func GetMessagesHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.GetConnectedUserID(r)
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
		SELECT m.sender_id, m.receiver_id, m.content, m.created_at, u.nickname
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		WHERE (sender_id = ? AND receiver_id = ?)
		   OR (sender_id = ? AND receiver_id = ?)
		ORDER BY m.created_at ASC`,
		userID, otherID, otherID, userID)

	if err != nil {
		http.Error(w, "Erreur récupération messages", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var messages []models.MessageDisplay
	for rows.Next() {
		var msg models.MessageDisplay
		if err := rows.Scan(&msg.SenderID, &msg.ReceiverID, &msg.Content, &msg.CreatedAt, &msg.SenderName); err != nil {
			continue
		}
		messages = append(messages, msg)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}
