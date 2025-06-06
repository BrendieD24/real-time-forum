package handlers

import (
	"log"
	"net/http"
	"real-time-forum/models"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Map des connexions WebSocket
var clients = make(map[string]*websocket.Conn)

func ChatWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Erreur upgrade websocket:", err)
		return
	}
	defer conn.Close()

	userID, err := GetConnectedUserID(r)
	if err != nil {
		log.Println("Non connecté")
		return
	}

	// Enregistrer la connexion
	clients[userID] = conn
	defer delete(clients, userID)

	log.Println("User connecté au chat:", userID)

	for {
		var msg models.Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("Déconnexion websocket:", err)
			break
		}

		msg.SenderID = userID // forcer l'ID sender (sécurité)
		log.Printf("Message de %s vers %s : %s\n", msg.SenderID, msg.ReceiverID, msg.Content)

		// Trouver le receiver
		receiverConn, ok := clients[msg.ReceiverID]
		if !ok {
			log.Println("Receiver non connecté")
			continue
		}

		// Envoyer le message au destinataire
		err = receiverConn.WriteJSON(msg)
		if err != nil {
			log.Println("Erreur envoi receiver:", err)
		}
	}
}
