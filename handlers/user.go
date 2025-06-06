package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/models"
)

func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Query("SELECT id, nickname FROM users")
	if err != nil {
		http.Error(w, "Erreur récupération utilisateurs", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Nickname); err != nil {
			continue
		}
		users = append(users, u)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
