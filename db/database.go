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

	createPostTable := `
	CREATE TABLE IF NOT EXISTS posts (
	id TEXT PRIMARY KEY,
	author_id TEXT,
	title TEXT,
	content TEXT,
	category TEXT,
	created_at TEXT,
	FOREIGN KEY(author_id) REFERENCES users(id)
	);`
	_, err = DB.Exec(createPostTable)
	if err != nil {
		log.Fatal("Erreur création table posts:", err)
	}
	_, err = DB.Exec(`
	CREATE TABLE IF NOT EXISTS comments (
	id TEXT PRIMARY KEY,
	post_id TEXT,
	author_id TEXT,
	content TEXT,
	created_at TEXT
	);
	`)
	if err != nil {
		log.Fatal("Erreur création table comments :", err)
	}

	createMessageTable := `
	CREATE TABLE IF NOT EXISTS messages (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	expediteur TEXT,
	recepteur TEXT,
	message TEXT,
	date TEXT,
	statut TEXT CHECK(statut IN ('lu', 'non lu'))
	);`
	_, err = DB.Exec(createMessageTable)
	if err != nil {
		log.Fatal("Erreur création table messages:", err)
	}

	_, err = DB.Exec(`
	CREATE TABLE IF NOT EXISTS sessions (
	user_id TEXT PRIMARY KEY,
	last_seen TEXT
	);
	`)
	if err != nil {
		log.Fatal("Erreur création table sessions :", err)
	}

}
