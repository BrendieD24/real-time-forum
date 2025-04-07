package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func InitDB() {
	database, err := sql.Open("sqlite3", "./db/forum.db")
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	createUserTable := `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		pseudo TEXT NOT NULL UNIQUE,
		email TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL
	);`

	_, err = database.Exec(createUserTable)
	if err != nil {
		log.Fatal("Erreur création table users:", err)
	}

	log.Println("Base de données initialisée")
}
