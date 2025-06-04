package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/models"
	"real-time-forum/utils"

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

// WebSocket pour mise à jour du statut
func UserStatusWebSocket(w http.ResponseWriter, r *http.Request) {
	var upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // ou une vérification de domaine en prod
		},
	}

	// Connexion WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	// Identifier l'utilisateur via son cookie/session
	userID, err := utils.GetConnectedUserID(r)
	if err != nil {
		return
	}

	// Marquer comme connecté
	models.UserConnections[userID] = conn
	defer delete(models.UserConnections, userID)

	// Garder la connexion ouverte
	for {
		if _, _, err := conn.NextReader(); err != nil {
			break // Déconnexion détectée
		}
	}

}
