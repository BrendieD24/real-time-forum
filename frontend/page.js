//----------------------------------Thème-----------------------------------//

const toggleButton = document.getElementById("toggle-theme");
const body = document.body;

// Vérifie le thème enregistré dans localStorage
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark-mode");
} else {
  body.classList.add("light-mode");
}

// Gestion du changement de thème
toggleButton.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
  body.classList.toggle("light-mode");

  if (body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

const themeIcon = document.getElementById("theme-icon");

function updateIcon() {
  themeIcon.textContent = body.classList.contains("dark-mode") ? "🌙" : "🌞";
}
updateIcon();

toggleButton.addEventListener("click", updateIcon);

//---------------------------------Fin-----------------------------------//

//---------------------------------Messagerie-----------------------------------//

// Fonction pour créer un nouvel élément de message
function createMessageElement(message) {
  const li = document.createElement("li");
  li.innerHTML = `<b>${message.sender}:</b> ${message.content}`;
  return li;
}
// Fonction pour initialiser la connexion WebSocket
function initWebSocket() {
  const socket = new WebSocket("ws://localhost:8080/ws");
  socket.addEventListener("message", receiveMessage);
  return socket;
}

// Fonction pour ajouter un message à la liste
function addMessage(message) {
  const messagesList = document.getElementById("messages");
  const messageElement = createMessageElement(message);
  messagesList.appendChild(messageElement);
}
// Fonction pour gérer l'envoi de messages
function sendMessage() {
  const sender = document.getElementById("username").value.trim();
  const content = document.getElementById("message").value.trim();

  if (sender === "" || content === "") return;

  const message = { sender, content };
  socket.send(JSON.stringify(message));
  addMessage(message);
  document.getElementById("message").value = "";
}
// Fonction pour gérer la réception de messages
function receiveMessage(event) {
  const message = JSON.parse(event.data);
  addMessage(message);
}
// Fonction pour initialiser la page
function initPage() {
  initMessaging();
}
// Appel de la fonction d'initialisation de la page
initPage();
//---------------------------------Fin-----------------------------------//
