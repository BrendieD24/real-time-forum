package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/models"

	"sync"

	"github.com/gorilla/websocket"
)

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

	// Garder la connexion ouverte
	for {
		if _, _, err := conn.NextReader(); err != nil {
			break // Déconnexion détectée
		}
	}

	userConnMutex.Lock()
	UserConnections[userID] = conn
	userConnMutex.Unlock()

	defer func() {
		userConnMutex.Lock()
		delete(UserConnections, userID)
		userConnMutex.Unlock()
	}()

}
