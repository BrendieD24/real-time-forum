package main

import (
	"log"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/handlers"
)

func main() {
	db.InitDB("forum.db")

	http.HandleFunc("/register", handlers.RegisterHandler)
	http.HandleFunc("/login", handlers.LoginHandler)

	// Sert les fichiers frontend statiques (index.html, .js, .css)
	http.Handle("/", http.FileServer(http.Dir("./frontend")))

	log.Println("Serveur sur http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
