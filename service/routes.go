package service

import (
	"net/http"
	"real-time-forum/handlers"

	"github.com/gorilla/mux"
)

func SetupRoutes() *mux.Router {
	r := mux.NewRouter()

	// 🔒 Authentification
	r.HandleFunc("/register", handlers.RegisterHandler).Methods("POST")
	r.HandleFunc("/login", handlers.LoginHandler).Methods("POST")
	r.HandleFunc("/logout", handlers.LogoutHandler).Methods("GET")
	r.HandleFunc("/me", handlers.MeHandler).Methods("GET")

	// 📄 Posts
	r.HandleFunc("/posts", handlers.CreatePostHandler).Methods("POST")
	r.HandleFunc("/posts/all", handlers.GetPostsHandler).Methods("GET")

	// 💬 Commentaires
	r.HandleFunc("/comments", handlers.CreateCommentHandler).Methods("POST")
	r.HandleFunc("/comments/all", handlers.GetCommentsHandler).Methods("GET")

	// 👤 Utilisateurs
	r.HandleFunc("/users/all", handlers.GetAllUsersHandler).Methods("GET")
	r.HandleFunc("/users", handlers.GetUsersStatusHandler).Methods("GET")
	r.HandleFunc("/users/status", handlers.GetUserStatusHandler).Methods("GET")

	// 📬 Messages privés
	r.HandleFunc("/messages", handlers.CreateMessageHandler).Methods("POST")
	r.HandleFunc("/messages", handlers.GetMessagesHandler).Methods("GET")

	// 🔌 WebSockets
	r.HandleFunc("/ws/status", handlers.UserStatusWebSocket)
	r.HandleFunc("/ws/chat", handlers.ChatWebSocket)

	// 🌐 Fichiers statiques (HTML/CSS/JS)
	fs := http.FileServer(http.Dir("./static"))
	r.PathPrefix("/").Handler(fs)

	return r
}
