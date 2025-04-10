package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/models"
	"time"

	"github.com/google/uuid"
)

func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID, err := GetConnectedUserID(r)
	if err != nil {
		http.Error(w, "Vous devez être connecté pour créer un post", http.StatusForbidden)
		return
	}

	var post models.Post
	err = json.NewDecoder(r.Body).Decode(&post)
	if err != nil {
		http.Error(w, "Erreur de décodage", http.StatusBadRequest)
		return
	}

	post.ID = uuid.New().String()
	post.CreatedAt = time.Now().Format("2006-01-02 15:04:05")

	stmt, err := db.DB.Prepare("INSERT INTO posts(id, author_id, title, content, category, created_at) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		http.Error(w, "Erreur SQL", http.StatusInternalServerError)
		return
	}
	_, err = stmt.Exec(post.ID, userID, post.Title, post.Content, post.Category, post.CreatedAt)

	if err != nil {
		http.Error(w, "Erreur d'insertion", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Post créé avec succès"))
}

func GetPostsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Query(`
	SELECT posts.id, users.nickname, posts.title, posts.content, posts.category, posts.created_at
	FROM posts
	JOIN users ON posts.author_id = users.id
	ORDER BY posts.created_at DESC
  `)
	if err != nil {
		http.Error(w, "Erreur récupération des posts", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var p models.Post
		err := rows.Scan(&p.ID, &p.Author, &p.Title, &p.Content, &p.Category, &p.CreatedAt)
		if err != nil {
			continue
		}
		posts = append(posts, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
