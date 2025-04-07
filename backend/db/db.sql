-- Création de la table users
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    age INT CHECK (age >= 0),
    gender TEXT CHECK(gender IN ('Male', 'Female', 'Other', 'Nothing')),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Supprimer les index avant de les recréer
DROP INDEX IF EXISTS users_email_index;
DROP INDEX IF EXISTS users_nickname_index;
-- Index pour accélérer la recherche
CREATE INDEX users_email_index ON users(email);
CREATE INDEX users_nickname_index ON users(nickname);
-- Création de la table categories
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);
-- Création de la table topics
CREATE TABLE topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
-- Création de la table posts
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);