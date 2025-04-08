package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/models"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
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

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	user.ID = uuid.New().String()
	user.Password = string(hashedPassword)

	stmt, err := db.DB.Prepare(`
	INSERT INTO users(id, nickname, firstname, lastname, age, gender, email, password)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		http.Error(w, "Erreur SQL", http.StatusInternalServerError)
		return
	}
	_, err = stmt.Exec(user.ID, user.Nickname, user.FirstName, user.LastName, user.Age, user.Gender, user.Email, user.Password)
	if err != nil {
		http.Error(w, "Erreur enregistrement", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Inscription réussie"))
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
	// Décodage du JSON de la requête
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Erreur JSON", http.StatusBadRequest)
		return
	}

	// Récupération de l'ID et du mot de passe hashé correspondant à l'identifiant (nickname ou email)
	row := db.DB.QueryRow("SELECT id, password FROM users WHERE nickname = ? OR email = ?", creds.Identifier, creds.Identifier)

	var id, hashed string
	if err := row.Scan(&id, &hashed); err != nil {
		http.Error(w, "Utilisateur introuvable", http.StatusUnauthorized)
		return
	}

	// Comparaison du mot de passe en clair avec le hash stocké
	if err := bcrypt.CompareHashAndPassword([]byte(hashed), []byte(creds.Password)); err != nil {
		http.Error(w, "Mot de passe incorrect", http.StatusUnauthorized)
		return
	}

	// Si tout est OK, définir le cookie avec l'ID de l'utilisateur
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    id,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // Mets true en production avec HTTPS
	})

	w.Write([]byte("Connexion réussie"))
}

func MeHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := GetConnectedUserID(r)
	if err != nil {
		http.Error(w, "Non connecté", http.StatusUnauthorized)
		return
	}

	// On récupère les infos de l'utilisateur
	row := db.DB.QueryRow("SELECT id, nickname, firstname, lastname, email FROM users WHERE id = ?", userID)
	var user struct {
		ID        string `json:"id"`
		Nickname  string `json:"nickname"`
		FirstName string `json:"firstname"`
		LastName  string `json:"lastname"`
		Email     string `json:"email"`
	}
	err = row.Scan(&user.ID, &user.Nickname, &user.FirstName, &user.LastName, &user.Email)
	if err != nil {
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
	w.Write([]byte("Déconnecté"))
}
