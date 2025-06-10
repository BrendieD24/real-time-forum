package models

type Message struct {
	ID         string
	SenderID   string
	ReceiverID string
	Content    string
	CreatedAt  string
}

type MessageDisplay struct {
	SenderName   string
	ReceiverName string
	Content      string
	CreatedAt    string
}
