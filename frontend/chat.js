import { showSection } from './page.js';

let chatSocket = null;
let currentReceiverID = null;

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

  chatSocket = new WebSocket('ws://localhost:8080/ws/chat');

  chatSocket.onopen = () => {
    console.log('WebSocket chat ouvert');
  };

  chatSocket.onclose = () => {
    console.log('WebSocket chat fermé');
    chatSocket = null;
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
    console.error('WebSocket pas prêt');
    return;
  }

  const payload = {
    receiver_id: currentReceiverID,
    content: text,
  };

  chatSocket.send(JSON.stringify(payload));
  input.value = ''; // Clear input
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
