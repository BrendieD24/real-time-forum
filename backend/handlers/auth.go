package handlers

import (
	"database/sql"
	"html/template"
	"log"
	"net/http"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	_ "github.com/mattn/go-sqlite3"
)

var tmpl = template.Must(template.ParseGlob("templates/*.html"))

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("==> registerHandler called")

	if r.Method == http.MethodGet {
		err := tmpl.ExecuteTemplate(w, "register", nil)

		if err != nil {
			log.Println("Erreur affichage register:", err)
			http.Error(w, "Erreur lors de l'affichage de la page", http.StatusInternalServerError)
			return
		}
		return
	}

	pseudo := r.FormValue("pseudo")
	email := r.FormValue("email")
	password := r.FormValue("password")

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	id := uuid.New().String()

	db, _ := sql.Open("sqlite3", "./db/forum.db")
	defer db.Close()

	_, err := db.Exec("INSERT INTO users (id, pseudo, email, password) VALUES (?, ?, ?, ?)",
		id, pseudo, email, string(hashedPassword))

	if err != nil {
		http.Error(w, "Erreur lors de l'inscription", 500)
		return
	}

	http.Redirect(w, r, "/home", http.StatusSeeOther)
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("==> loginHandler called")

	if r.Method == http.MethodGet {
		err := tmpl.ExecuteTemplate(w, "login", nil)
		if err != nil {
			log.Println("Erreur affichage login:", err)
			http.Error(w, "Erreur lors de l'affichage de la page", http.StatusInternalServerError)
			return
		}
		return
	}

	identifiant := r.FormValue("identifiant")
	password := r.FormValue("password")

	db, _ := sql.Open("sqlite3", "./db/forum.db")
	defer db.Close()

	var storedHash string
	var id string

	row := db.QueryRow("SELECT id, password FROM users WHERE email = ? OR pseudo = ?", identifiant, identifiant)
	err := row.Scan(&id, &storedHash)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(password)) != nil {
		http.Error(w, "Identifiants invalides", 403)
		return
	}

	cookie := &http.Cookie{
		Name:  "session_id",
		Value: id,
		Path:  "/",
	}
	http.SetCookie(w, cookie)

	http.Redirect(w, r, "/home", http.StatusSeeOther)
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	cookie := &http.Cookie{
		Name:   "session_id",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	}
	http.SetCookie(w, cookie)
	http.Redirect(w, r, "/", http.StatusSeeOther)

}
func HomeHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil || cookie.Value == "" {
		http.Redirect(w, r, "/", http.StatusSeeOther) // maintenant, redirige vers accueil public
		return
	}

	db, _ := sql.Open("sqlite3", "./db/forum.db")
	defer db.Close()

	var pseudo string
	err = db.QueryRow("SELECT pseudo FROM users WHERE id = ?", cookie.Value).Scan(&pseudo)
	if err != nil {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	data := struct {
		Pseudo string
	}{
		Pseudo: pseudo,
	}

	tmpl.ExecuteTemplate(w, "index", data)
}

func WelcomeHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("==> welcomeHandler called")

	// Si déjà connecté → rediriger vers page principale
	cookie, err := r.Cookie("session_id")
	if err == nil && cookie.Value != "" {
		// Vérifie que l'utilisateur existe vraiment
		db, _ := sql.Open("sqlite3", "./db/forum.db")
		defer db.Close()

		var exists string
		err = db.QueryRow("SELECT id FROM users WHERE id = ?", cookie.Value).Scan(&exists)
		if err == nil {
			http.Redirect(w, r, "/home", http.StatusSeeOther)
			return
		}
	}

	err = tmpl.ExecuteTemplate(w, "welcome", nil)
	if err != nil {
		log.Println("Erreur affichage welcome:", err)
		http.Error(w, "Erreur lors de l'affichage de la page", http.StatusInternalServerError)
	}
}
