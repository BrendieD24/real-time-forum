package handlers

import (
	"net/http"
	"real-time-forum/db"
)

// Récupère l'utilisateur connecté (ou vide si non connecté)
func GetConnectedUserID(r *http.Request) (string, error) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		return "", err
	}

	// Vérifie que l'UUID existe dans la table users
	row := db.DB.QueryRow("SELECT id FROM users WHERE id = ?", cookie.Value)
	var id string
	if err := row.Scan(&id); err != nil {
		return "", err
	}

	return id, nil
}
