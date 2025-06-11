import { showSection, handleUserLoggedIn } from './page.js';
import { register, login, getConnectedUser } from './auth.js';
import { loadPosts } from './posts.js';
import { loadUserSidebar, showUserSidebar } from './user.js';
import { sendPrivateMessage } from './chat.js';
import { openStatusWebSocket } from './ws.js';
import { createPost } from './posts.js';

document.addEventListener('DOMContentLoaded', () => {
  // Boutons de navigation
  document.getElementById('btnRegister').addEventListener('click', () => {
    showSection('register');
  });

  document.getElementById('btnLogin').addEventListener('click', () => {
    showSection('login');
  });

  document.getElementById('createPostBtn').addEventListener('click', () => {
    showSection('create-post');
  });

  document.getElementById('btnPosts').addEventListener('click', () => {
    showSection('posts');
  });

  // Bouton register
  document.getElementById('registerBtn').addEventListener('click', register);

  document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
  });
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
  });
  document
    .getElementById('create-post-form')
    .addEventListener('submit', (e) => {
      e.preventDefault(); // Empêche le rechargement de la page
      createPost();
    });

  // Bouton login
  document.getElementById('loginBtn').addEventListener('click', login);

  // Chargement des posts au démarrage

  loadPosts();

  openStatusWebSocket();
  setInterval(() => {
    getConnectedUser().then((user) => {
      if (user) {
        loadUserSidebar(user); // Pass the user as a parameter
      }
    });
  }, 10000); // refresh auto toutes les 10 sec
  document
    .getElementById('send-private-message')
    .addEventListener('click', sendPrivateMessage);

  // Vérifie si user est connecté → met à jour l'interface
  getConnectedUser().then((user) => {
    if (user) {
      handleUserLoggedIn(user);
      showUserSidebar();
      loadUserSidebar(user);
    }
  });
});
