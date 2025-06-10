import { showSection, handleUserLoggedIn } from "./page.js";
import { register, login, getConnectedUser } from "./auth.js";
import { loadPosts } from "./posts.js";
import { loadUserSidebar } from "./user.js";
import { sendPrivateMessage } from "./chat.js";

document.addEventListener("DOMContentLoaded", () => {
  // Boutons de navigation
  document.getElementById("btnRegister").addEventListener("click", () => {
    showSection("register");
  });

  document.getElementById("btnLogin").addEventListener("click", () => {
    showSection("login");
  });

  document.getElementById("createPostBtn").addEventListener("click", () => {
    showSection("create-post");
  });

  document.getElementById("btnPosts").addEventListener("click", () => {
    showSection("posts");
  });

  // Bouton register
  document.getElementById("registerBtn").addEventListener("click", register);

  // Bouton login
  document.getElementById("loginBtn").addEventListener("click", login);

  // Chargement des posts au démarrage
  loadPosts();
  loadUserSidebar();
  setInterval(loadUserSidebar, 10000); // refresh auto toutes les 10 sec
  document
    .getElementById("send-private-message")
    .addEventListener("click", sendPrivateMessage);
  // Vérifie si user est connecté → met à jour l'interface
  getConnectedUser().then((user) => {
    if (user) {
      handleUserLoggedIn(user);
    }
  });
});
