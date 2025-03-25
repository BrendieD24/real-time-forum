package main

import (
	"fmt"
	"log"
	"net/http"
)

// Fonction pour gérer les requêtes HTTP
func homeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Bienvenue sur la page d'accueil !")
}

func main() {
	// Associer la route "/" à la fonction homeHandler
	http.HandleFunc("/", homeHandler)

	// Démarrer le serveur sur le port 8080
	port := ":2424"
	fmt.Println("Serveur démarré sur http://localhost" + port)
	log.Fatal(http.ListenAndServe(port, nil))
}
