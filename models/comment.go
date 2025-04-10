package models

type Comment struct {
	ID        string `json:"ID"`
	PostID    string `json:"PostID"`
	Author    string `json:"Author"`
	Content   string `json:"Content"`
	CreatedAt string `json:"CreatedAt"`
}

type CommentDisplay struct {
	Content   string `json:"Content"`
	CreatedAt string `json:"CreatedAt"`
	Author    string `json:"Author"`
}
