package main

import (
	"log"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/handlers"

	"github.com/gorilla/mux"
)

func main() {
	db.InitDB("forum.db")

	r := mux.NewRouter()

	// Routes API existantes
	r.HandleFunc("/register", handlers.RegisterHandler).Methods("POST")
	r.HandleFunc("/login", handlers.LoginHandler).Methods("POST")
	r.HandleFunc("/posts", handlers.CreatePostHandler).Methods("POST")
	r.HandleFunc("/posts/all", handlers.GetPostsHandler).Methods("GET")
	r.HandleFunc("/me", handlers.MeHandler).Methods("GET")
	r.HandleFunc("/logout", handlers.LogoutHandler).Methods("POST", "GET")
	r.HandleFunc("/comments", handlers.CreateCommentHandler).Methods("POST")
	r.HandleFunc("/comments/all", handlers.GetCommentsHandler).Methods("GET")
	r.HandleFunc("/users/all", handlers.GetAllUsersHandler).Methods("GET")

	// Route WebSocket chat
	r.HandleFunc("/ws/chat", handlers.ChatWebSocket)

	// Fichiers statiques
	fs := http.FileServer(http.Dir("./frontend"))
	r.PathPrefix("/").Handler(fs)

	log.Println("Serveur sur http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
