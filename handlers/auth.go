package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/models"
	"real-time-forum/utils"

	"github.com/google/uuid"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Erreur JSON", http.StatusBadRequest)
		return
	}

	// Validation de l'email
	if !utils.IsValidEmail(user.Email) {
		http.Error(w, "Email invalide", http.StatusBadRequest)
		return
	}

	// Hash du mot de passe
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		http.Error(w, "Erreur hash mot de passe", http.StatusInternalServerError)
		return
	}

	user.ID = uuid.New().String()
	user.Password = hashedPassword

	// Insert en base
	stmt, err := db.DB.Prepare(`
	INSERT INTO users(id, nickname, firstname, lastname, age, gender, email, password)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		http.Error(w, "Erreur SQL", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec(user.ID, user.Nickname, user.FirstName, user.LastName, user.Age, user.Gender, user.Email, user.Password)
	if err != nil {
		http.Error(w, "Erreur enregistrement", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Inscription réussie"})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var creds struct {
		Identifier string
		Password   string
	}

	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Erreur JSON", http.StatusBadRequest)
		return
	}

	// Récupérer hash du user
	row := db.DB.QueryRow("SELECT id, password FROM users WHERE nickname = ? OR email = ?", creds.Identifier, creds.Identifier)

	var id, hashed string
	if err := row.Scan(&id, &hashed); err != nil {
		http.Error(w, "Utilisateur introuvable", http.StatusUnauthorized)
		return
	}

	// Vérifier le mot de passe
	if !utils.CheckPasswordHash(creds.Password, hashed) {
		http.Error(w, "Mot de passe incorrect", http.StatusUnauthorized)
		return
	}

	// Login OK → poser cookie session_id
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    id,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // true si HTTPS
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Connexion réussie"})
}

func MeHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := GetConnectedUserID(r)
	if err != nil {
		http.Error(w, "Non connecté", http.StatusUnauthorized)
		return
	}

	row := db.DB.QueryRow("SELECT id, nickname, firstname, lastname, email FROM users WHERE id = ?", userID)

	var user struct {
		ID        string `json:"id"`
		Nickname  string `json:"nickname"`
		FirstName string `json:"firstname"`
		LastName  string `json:"lastname"`
		Email     string `json:"email"`
	}

	if err := row.Scan(&user.ID, &user.Nickname, &user.FirstName, &user.LastName, &user.Email); err != nil {
		http.Error(w, "Utilisateur introuvable", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    "",
		Path:     "/",
		MaxAge:   -1, // supprime le cookie
		HttpOnly: true,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Déconnecté"})
}
