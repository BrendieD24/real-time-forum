package models

type Post struct {
	ID        string `json:"ID"`
	Author    string `json:"Author"` // nickname ici
	Title     string `json:"Title"`
	Content   string `json:"Content"`
	Category  string `json:"Category"`
	CreatedAt string `json:"CreatedAt"`
}
