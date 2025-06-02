package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/models"

	"github.com/gorilla/websocket"
)

func GetUserStatusHandler(w http.ResponseWriter, r *http.Request) {
	statuses := make([]models.UserStatus, 0)
	var UserConnections = map[string]*websocket.Conn{}

	for userID, conn := range UserConnections {
		statuses = append(statuses, models.UserStatus{
			ID:     userID,
			Online: conn != nil,
		})
	}

	// Remplace les IDs par les nicknames si tu veux
	for i := range statuses {
		row := db.DB.QueryRow("SELECT nickname FROM users WHERE id = ?", statuses[i].ID)
		row.Scan(&statuses[i].Nickname)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(statuses)
}
