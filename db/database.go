package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB(path string) {
	var err error
	DB, err = sql.Open("sqlite3", path)
	if err != nil {
		log.Fatal(err)
	}

	query := `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		nickname TEXT UNIQUE,
		firstname TEXT,
		lastname TEXT,
		age INTEGER,
		gender TEXT CHECK(gender IN ('male', 'female', 'other')),
		email TEXT UNIQUE,
		password TEXT
	);`

	_, err = DB.Exec(query)
	if err != nil {
		log.Fatal(err)
	}
}
