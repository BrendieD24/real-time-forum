package models

type Message struct {
	SenderID   string `json:"SenderID"`
	ReceiverID string `json:"ReceiverID"`
	Content    string `json:"Content"`
	CreatedAt  string `json:"CreatedAt"`
}
