package service

import (
	"net/http"
	"real-time-forum/handlers"
)

func main() {
	http.HandleFunc("/ws/chat", handlers.ChatWebSocket)
	http.HandleFunc("/users/status", handlers.GetUsersStatusHandler)
	http.HandleFunc("/ws/status", handlers.UserStatusWebSocket)
	http.HandleFunc("/users/all", handlers.GetAllUsersHandler)
	http.HandleFunc("/register", handlers.RegisterHandler)
	http.HandleFunc("/login", handlers.LoginHandler)
	http.HandleFunc("/posts", handlers.CreatePostHandler)
	http.HandleFunc("/posts/all", handlers.GetPostsHandler)
	http.HandleFunc("/me", handlers.MeHandler)
	http.HandleFunc("/logout", handlers.LogoutHandler)
	http.HandleFunc("/comments", handlers.CreateCommentHandler)
	http.HandleFunc("/comments/all", handlers.GetCommentsHandler)

	// Sert les fichiers frontend statiques (index.html, .js, .css)
	http.Handle("/", http.FileServer(http.Dir("./frontend")))
}
