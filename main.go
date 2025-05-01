package main

import (
	"log"
	"net/http"
	"real-time-forum/db"
)

func main() {
	db.InitDB("forum.db")

	log.Println("Serveur sur http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
