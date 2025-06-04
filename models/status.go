package models

import "github.com/gorilla/websocket"

var UserConnections = map[string]*websocket.Conn{}

type UserStatus struct {
	ID       string `json:"id"`
	Nickname string `json:"nickname"`
	Online   bool   `json:"online"`
}
