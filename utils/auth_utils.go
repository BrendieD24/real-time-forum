package utils

import (
	"net/http"
)

// GetConnectedUserID récupère l'ID utilisateur à partir du cookie "session_id"
func GetConnectedUserID(r *http.Request) (string, error) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		return "", err // pas connecté ou cookie manquant
	}

	return cookie.Value, nil
}
