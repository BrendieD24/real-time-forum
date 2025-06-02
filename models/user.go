package models

type User struct {
	ID        string
	Nickname  string
	FirstName string
	LastName  string
	Age       int
	Gender    string
	Email     string
	Password  string
	Online    bool `json:"online"`
}

type UserStatus struct {
	ID       string `json:"id"`
	Nickname string `json:"nickname"`
	Online   bool   `json:"online"`
}
