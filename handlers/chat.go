package handlers

import (
	"net/http"
	"real-time-forum/db"
	"real-time-forum/models"
	"real-time-forum/utils"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var chatClients = make(map[*websocket.Conn]string)

var chatUpgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // à sécuriser en prod
	},
}

func ChatWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := chatUpgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	userID, err := utils.GetConnectedUserID(r)
	if err != nil {
		return
	}

	chatClients[conn] = userID
	defer func() {
		delete(chatClients, conn)
	}()

	for {
		var msg models.Message
		if err := conn.ReadJSON(&msg); err != nil {
			break
		}

		msg.ID = uuid.New().String()
		msg.SenderID = userID
		msg.CreatedAt = time.Now().Format("2006-01-02 15:04:05")

		// Enregistrement dans la base
		_, err := db.DB.Exec(`INSERT INTO messages(id, sender_id, receiver_id, content, created_at)
			VALUES (?, ?, ?, ?, ?)`, msg.ID, msg.SenderID, msg.ReceiverID, msg.Content, msg.CreatedAt)
		if err != nil {
			continue
		}

		// Envoi au destinataire
		sendToReceiver(msg.ReceiverID, msg)
	}
}

func sendToReceiver(receiverID string, msg models.Message) {
	for conn, uid := range chatClients {
		if uid == receiverID {
			conn.WriteJSON(msg)
		}
	}
}
