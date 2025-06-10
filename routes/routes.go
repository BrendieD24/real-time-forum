package routes

import (
	"net/http"
	"real-time-forum/handlers"

	"github.com/gorilla/mux"
)

func SetupRouter() *mux.Router {
	r := mux.NewRouter()

	// Auth routes
	r.HandleFunc("/register", handlers.RegisterHandler).Methods("POST")
	r.HandleFunc("/login", handlers.LoginHandler).Methods("POST")
	r.HandleFunc("/logout", handlers.LogoutHandler).Methods("GET")
	r.HandleFunc("/me", handlers.MeHandler).Methods("GET")

	// Posts
	r.HandleFunc("/posts", handlers.CreatePostHandler).Methods("POST")
	r.HandleFunc("/posts/all", handlers.GetPostsHandler).Methods("GET")

	// Comments
	r.HandleFunc("/comments", handlers.CreateCommentHandler).Methods("POST")
	r.HandleFunc("/comments/all", handlers.GetCommentsHandler).Methods("GET")

	// Messages
	r.HandleFunc("/messages", handlers.GetMessagesHandler).Methods("GET")
	r.HandleFunc("/messages", handlers.SendMessageHandler).Methods("POST")

	// User status
	r.HandleFunc("/users/status", handlers.GetUserStatusHandler).Methods("GET")
	r.HandleFunc("/ws/status", handlers.UserStatusWebSocket)

	// Chat WebSocket
	r.HandleFunc("/ws/chat", handlers.UserChatWebSocket)

	// Static files (frontend)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./frontend/")))

	return r
}
