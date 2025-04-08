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
	http.HandleFunc("/posts", handlers.CreatePostHandler)
	http.HandleFunc("/posts/all", handlers.GetPostsHandler)
	http.HandleFunc("/me", handlers.MeHandler)
	http.HandleFunc("/logout", handlers.LogoutHandler)

	// Sert les fichiers frontend statiques (index.html, .js, .css)
	http.Handle("/", http.FileServer(http.Dir("./frontend")))

	log.Println("Serveur sur http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
