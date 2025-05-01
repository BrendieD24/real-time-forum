package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/db"
)

func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Query("SELECT id, nickname FROM users")
	if err != nil {
		http.Error(w, "Erreur récupération utilisateurs", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []struct {
		ID       string `json:"id"`
		Nickname string `json:"nickname"`
	}

	for rows.Next() {
		var u struct {
			ID       string `json:"id"`
			Nickname string `json:"nickname"`
		}
		if err := rows.Scan(&u.ID, &u.Nickname); err != nil {
			continue
		}
		users = append(users, u)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
func GetUsersStatusHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Query(`
	SELECT u.id, u.nickname,
	       CASE
	           WHEN s.last_seen IS NOT NULL AND datetime(s.last_seen) > datetime('now', '-1 minute')
	           THEN 1 ELSE 0
	       END AS online
	FROM users u
	LEFT JOIN sessions s ON s.user_id = u.id
	`)
	if err != nil {
		http.Error(w, "Erreur SQL", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []struct {
		ID       string `json:"id"`
		Nickname string `json:"nickname"`
		Online   bool   `json:"online"`
	}
	for rows.Next() {
		var u struct {
			ID       string `json:"id"`
			Nickname string `json:"nickname"`
			Online   bool   `json:"online"`
		}
		if err := rows.Scan(&u.ID, &u.Nickname, &u.Online); err != nil {
			continue
		}
		users = append(users, u)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
