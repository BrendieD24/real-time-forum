package models

type Message struct {
	ID         string `json:"ID"`
	SenderID   string `json:"SenderID"`
	ReceiverID string `json:"ReceiverID"`
	Content    string `json:"Content"`
	CreatedAt  string `json:"CreatedAt"`
}
type MessageDisplay struct {
	SenderID   string
	ReceiverID string
	Content    string
	CreatedAt  string
	SenderName string
}
