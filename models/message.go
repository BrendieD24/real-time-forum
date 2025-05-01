package models

type Message struct {
	ID         string `json:"ID"`
	SenderID   string `json:"SenderID"`
	ReceiverID string `json:"ReceiverID"`
	Content    string `json:"Content"`
	CreatedAt  string `json:"CreatedAt"`
}
