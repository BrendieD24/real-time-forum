package main

import (
	"log"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/routes"
)

func main() {
	// Init DB
	db.InitDB("forum.db")

	// Setup router
	r := routes.SetupRouter()

	// Start server
	log.Println("Serveur sur http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
