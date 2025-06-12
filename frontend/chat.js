import { showSection } from "./page.js";
import {
  openStatusWebSocket,
  sendChatMessage,
  setOnChatMessageCallback,
  isConnected,
} from "./ws.js";

let currentReceiverID = null;
let messageQueue = []; // Garde la file d'attente pour compatibilité

// Ouvre un chat privé
export function openPrivateChat(userID, nickname) {
  console.log(`Ouverture du chat avec ${nickname} (ID: ${userID})`);

  currentReceiverID = userID;
  showSection("chat");

  // Met à jour le titre du chat
  const chatTitle = document.getElementById("private-chat-title");
  if (chatTitle) {
    chatTitle.textContent = `Chat avec ${nickname}`;
    chatTitle.style.display = "block";
  }

  // Vide la liste de messages
  const list = document.getElementById("private-messages");
  list.innerHTML = "";
  list.style.display = "block";

  // Affiche l'input + bouton
  document.getElementById("private-message-input").style.display = "block";
  document.getElementById("send-private-message").style.display =
    "inline-block";

  // Définir le callback pour rafraîchir les messages quand on reçoit un message
  setOnChatMessageCallback(() => {
    if (currentReceiverID) {
      loadMessages(currentReceiverID);
    }
  });

  // Ouvre le WebSocket si besoin
  openStatusWebSocket();

  // Charge l'historique
  loadMessages(userID);
}

// Fonction qui remplace openChatWebSocket (plus utilisée directement)
function ensureWebSocketConnection() {
  openStatusWebSocket();
}

// Envoie un message privé
export function sendPrivateMessage() {
  const input = document.getElementById("private-message-input");
  const text = input.value.trim();

  if (!text || !currentReceiverID) return;

  const messageSent = sendChatMessage(currentReceiverID, text);

  if (!messageSent) {
    console.log("WebSocket pas prêt, mise en file d'attente du message");

    // Simuler l'affichage immédiat du message pour l'utilisateur
    const list = document.getElementById("private-messages");
    const li = document.createElement("li");
    li.textContent = `Vous : ${text} (en attente...)`;
    li.style.opacity = "0.7";
    list.appendChild(li);
  } else {
    // Rafraîchir les messages immédiatement pour l'expéditeur
    loadMessages(currentReceiverID);
  }

  input.value = ""; // Clear input
}

// Charge l'historique des messages
async function loadMessages(userID) {
  try {
    const res = await fetch(`/messages?user=${userID}`);
    if (!res.ok) throw new Error("Erreur lors du chargement des messages");

    const messages = await res.json();

    const list = document.getElementById("private-messages");
    list.innerHTML = "";

    messages.forEach((msg) => {
      const li = document.createElement("li");
      li.textContent = `${msg.SenderName} (${displayDateHour(
        new Date(msg.CreatedAt)
      )}) : ${msg.Content}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Impossible de charger les messages :", err);
  }
}

function displayDateHour(date) {
  const now = new Date();
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    const day = date.getDate();
    const month = date.toLocaleString("fr-FR", { month: "short" });
    const time = date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${day} ${month} ${time}`;
  }
}
