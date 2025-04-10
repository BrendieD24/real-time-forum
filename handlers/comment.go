package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/db"
	"real-time-forum/models"
	"time"

	"github.com/google/uuid"
)

func CreateCommentHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID, err := GetConnectedUserID(r)
	if err != nil {
		http.Error(w, "Non connecté", http.StatusForbidden)
		return
	}

	var c models.Comment
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	c.ID = uuid.New().String()
	c.CreatedAt = time.Now().Format("2006-01-02 15:04:05")

	stmt, err := db.DB.Prepare("INSERT INTO comments(id, post_id, author_id, content, created_at) VALUES (?, ?, ?, ?, ?)")
	if err != nil {
		http.Error(w, "Erreur DB", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec(c.ID, c.PostID, userID, c.Content, c.CreatedAt)
	if err != nil {
		http.Error(w, "Erreur insertion", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Commentaire ajouté"))
}

func GetCommentsHandler(w http.ResponseWriter, r *http.Request) {
	postID := r.URL.Query().Get("post")
	if postID == "" {
		http.Error(w, "Post ID manquant", http.StatusBadRequest)
		return
	}

	rows, err := db.DB.Query(`
		SELECT users.nickname, comments.content, comments.created_at
		FROM comments
		JOIN users ON comments.author_id = users.id
		WHERE comments.post_id = ?
		ORDER BY comments.created_at ASC
	`, postID)

	if err != nil {
		http.Error(w, "Erreur récupération", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var comments []models.CommentDisplay
	for rows.Next() {
		var c models.CommentDisplay
		if err := rows.Scan(&c.Author, &c.Content, &c.CreatedAt); err != nil {
			continue
		}
		comments = append(comments, c)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}
