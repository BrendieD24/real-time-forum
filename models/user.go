package models

import "github.com/gorilla/websocket"

type User struct {
	ID        string
	Nickname  string
	FirstName string
	LastName  string
	Age       int
	Gender    string
	Email     string
	Password  string
}
type UserStatus struct {
	ID       string `json:"ID"`
	Nickname string `json:"Nickname"`
	Online   bool   `json:"Online"`
}
type UserConnection struct {
	UserID string      `json:"UserID"`
	Conn   interface{} `json:"Conn"`
}

var UserConnections = map[string]*websocket.Conn{}
