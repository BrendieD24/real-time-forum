package main

import (
	"log"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/service"
)

func main() {
	db.InitDB("forum.db")

	r := service.SetupRoutes()

	log.Println("Serveur démarré sur http://localhost:8080")
	err := http.ListenAndServe(":8080", r)
	if err != nil {
		log.Fatal(err)
	}
}
