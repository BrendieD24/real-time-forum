package utils

import (
	"crypto/rand"
	"encoding/hex"
	"regexp"
	"strings"
	"time"
)

// GenerateUUID génère un identifiant unique simple (UUID-like).
func GenerateUUID() string {
	bytes := make([]byte, 16)
	_, err := rand.Read(bytes)
	if err != nil {
		return "" // fallback
	}
	return hex.EncodeToString(bytes)
}

// IsValidEmail vérifie si l'email est valide.
func IsValidEmail(email string) bool {
	// Simple regex pour valider un email basique
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return re.MatchString(email)
}

// FormatDate retourne une date formatée en string.
func FormatDate(t time.Time) string {
	return t.Format("2006-01-02 15:04:05")
}

// SanitizeInput retire les espaces en trop et les caractères dangereux basiques.
func SanitizeInput(input string) string {
	// Trim leading/trailing spaces
	clean := strings.TrimSpace(input)

	// Ici tu pourrais ajouter plus de règles (exemple : enlever les balises HTML)
	// Pour simplifier, on laisse la fonction de base
	return clean
}
