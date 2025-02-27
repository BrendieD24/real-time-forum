-- Création de la base de données
CREATE DATABASE IF NOT EXISTS forum_popart;
USE forum_popart;
-- Table des utilisateurs
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Table des catégories de discussion
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);
-- Table des sujets
CREATE TABLE topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
-- Table des messages
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    topic_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);
-- Insertion de données de test
INSERT INTO users (username, email, password)
VALUES ('Alice', 'alice@example.com', 'hashedpassword1'),
    ('Bob', 'bob@example.com', 'hashedpassword2');
INSERT INTO categories (name, description)
VALUES (
        'Général',
        'Discussions générales sur tous les sujets'
    ),
    (
        'Pop Art',
        'Discussions sur le mouvement Pop Art'
    );
INSERT INTO topics (title, user_id, category_id)
VALUES ('Bienvenue sur le forum !', 1, 1),
    ('Vos artistes pop art préférés ?', 2, 2);
INSERT INTO posts (content, user_id, topic_id)
VALUES ('Salut tout le monde !', 1, 1),
    ('J’adore Roy Lichtenstein !', 2, 2);