package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/models"
	"real-time-forum/utils"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // autorise tout le monde à se connecter (à sécuriser en prod)
	},
}

var (
	clients   = make(map[*websocket.Conn]string) // socket -> userID
	clientsMu sync.Mutex
)

// WebSocket pour suivre les connexions utilisateur
func UserStatusWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	userID, err := utils.GetConnectedUserID(r)
	if err != nil {
		return
	}

	clientsMu.Lock()
	clients[conn] = userID
	clientsMu.Unlock()

	broadcastUserStatuses()

	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			clientsMu.Lock()
			delete(clients, conn)
			clientsMu.Unlock()
			broadcastUserStatuses()
			break
		}
	}
}

func broadcastUserStatuses() {
	// Récupérer tous les utilisateurs de la BDD
	rows, err := db.DB.Query("SELECT id, nickname FROM users")
	if err != nil {
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Nickname); err == nil {
			u.Online = isUserOnline(u.ID)
			users = append(users, u)
		}
	}

	data, _ := json.Marshal(users)

	clientsMu.Lock()
	for conn := range clients {
		conn.WriteMessage(websocket.TextMessage, data)
	}
	clientsMu.Unlock()
}

func isUserOnline(userID string) bool {
	for _, uid := range clients {
		if uid == userID {
			return true
		}
	}
	return false
}
