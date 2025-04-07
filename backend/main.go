package main

import (
	"log"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/handlers"
)

func main() {
	db.InitDB()

	http.HandleFunc("/register", handlers.RegisterHandler)
	http.HandleFunc("/login", handlers.LoginHandler)
	http.HandleFunc("/logout", handlers.LogoutHandler)
	http.HandleFunc("/home", handlers.HomeHandler)
	http.HandleFunc("/", handlers.WelcomeHandler) // à placer EN DERNIER

	log.Println("Serveur démarré sur http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
