import { showSection } from './page.js';

let chatSocket = null;
let currentReceiverID = null;
let messageQueue = []; // File d'attente pour les messages à envoyer

// Ouvre un chat privé
export function openPrivateChat(userID, nickname) {
  console.log(`Ouverture du chat avec ${nickname} (ID: ${userID})`);

  currentReceiverID = userID;
  showSection('chat');

  // Met à jour le titre du chat
  const chatTitle = document.getElementById('private-chat-title');
  if (chatTitle) {
    chatTitle.textContent = `Chat avec ${nickname}`;
    chatTitle.style.display = 'block';
  }

  // Vide la liste de messages
  const list = document.getElementById('private-messages');
  list.innerHTML = '';
  list.style.display = 'block';

  // Affiche l'input + bouton
  document.getElementById('private-message-input').style.display = 'block';
  document.getElementById('send-private-message').style.display =
    'inline-block';

  // Ouvre le WebSocket si besoin
  openChatWebSocket();

  // Charge l'historique
  loadMessages(userID);
}

// Ouvre le WebSocket de chat privé
function openChatWebSocket() {
  if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
    return; // déjà ouvert
  }

  // Si une connexion existe mais n'est pas ouverte, la fermer
  if (chatSocket) {
    chatSocket.close();
  }

  // Si une connexion existe mais n'est pas ouverte, la fermer
  if (chatSocket) {
    chatSocket.close();
  }

  chatSocket = new WebSocket('ws://localhost:8080/ws/chat');

  chatSocket.onopen = () => {
    console.log("WebSocket chat ouvert");
    // Envoyer les messages en file d'attente
    while (messageQueue.length > 0) {
      const message = messageQueue.shift();
      chatSocket.send(JSON.stringify(message));

      // Après avoir envoyé un message depuis la file d'attente, rafraîchir les messages
      loadMessages(currentReceiverID);
    }
  };

  chatSocket.onclose = () => {
    console.log('WebSocket chat fermé');
    chatSocket = null;

    // Tentative de reconnexion après un délai
    setTimeout(() => {
      if (currentReceiverID) {
        openChatWebSocket();
      }
    }, 2000);
  };

  chatSocket.onmessage = (event) => {
    console.log('Message reçu :', event.data);
    loadMessages(currentReceiverID); // Rafraîchir les messages
  };
}

// Envoie un message privé
export function sendPrivateMessage() {
  const input = document.getElementById('private-message-input');
  const text = input.value.trim();

  if (!text || !currentReceiverID) return;

  if (!chatSocket || chatSocket.readyState !== WebSocket.OPEN) {
    console.error("WebSocket pas prêt");
    return;
  }

  const payload = {
    receiver_id: currentReceiverID,
    content: text,
  };

  if (!chatSocket || chatSocket.readyState !== WebSocket.OPEN) {
    console.log("WebSocket pas prêt, mise en file d'attente du message");
    messageQueue.push(payload);
    openChatWebSocket(); // Tenter d'ouvrir ou réouvrir la connexion

    // Simuler l'affichage immédiat du message pour l'utilisateur
    const list = document.getElementById("private-messages");
    const li = document.createElement("li");
    li.textContent = `Vous : ${text} (en attente...)`;
    li.style.opacity = "0.7";
    list.appendChild(li);
  } else {
    chatSocket.send(JSON.stringify(payload));
    // Rafraîchir les messages immédiatement pour l'expéditeur
    loadMessages(currentReceiverID);
  }

  input.value = ""; // Clear input
}

// Charge l'historique des messages
async function loadMessages(userID) {
  try {
    const res = await fetch(`/messages?user=${userID}`);
    if (!res.ok) throw new Error('Erreur lors du chargement des messages');

    const messages = await res.json();

    const list = document.getElementById('private-messages');
    list.innerHTML = '';

    messages.forEach((msg) => {
      const li = document.createElement('li');
      li.textContent = `${msg.SenderName} : ${msg.Content}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('Impossible de charger les messages :', err);
  }
}
