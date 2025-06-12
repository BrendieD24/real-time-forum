import { showSection } from './page.js';
import {
  openStatusWebSocket,
  sendChatMessage,
  setOnChatMessageCallback,
  isConnected,
} from './ws.js';
import { getConnectedUser } from './auth.js';

// Charge l'historique des messages
let currentOffset = 0; // Offset for pagination
const limit = 10; // Number of messages to load per request
let currentReceiverID = null;
let messageQueue = []; // Garde la file d'attente pour compatibilité

// Ouvre un chat privé
export function openPrivateChat(userID, nickname) {
  currentReceiverID = userID;
  showSection('chat');
  currentOffset = 0; // Reset offset for new chat

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

  // Définir le callback pour rafraîchir les messages quand on reçoit un message
  setOnChatMessageCallback((data) => {
    if (currentReceiverID) {
      // Append the new message and refresh the list
      const list = document.getElementById('private-messages');
      const li = document.createElement('li');
      li.textContent = `${data.sender_name} (${displayDateHour(
        new Date(data.created_at)
      )}) : ${data.content}`;
      list.appendChild(li);
      scrollChatToBottom(); // Scroll to the bottom after appending
      // loadMessages(currentReceiverID, true, true);
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
export async function sendPrivateMessage() {
  const input = document.getElementById('private-message-input');
  const text = input.value.trim();
  const user = await getConnectedUser(); // Assurez-vous que cette fonction est définie pour obtenir l'utilisateur connecté

  if (!text || !currentReceiverID) return;

  const messageSent = sendChatMessage(currentReceiverID, text);

  if (!messageSent) {
    // Simulate immediate display for the sender
    const list = document.getElementById('private-messages');
    const li = document.createElement('li');
    li.textContent = `Vous : ${text} (en attente...)`;
    li.style.opacity = '0.7';
    list.appendChild(li);
  } else {
    // Append the new message and refresh the list
    const list = document.getElementById('private-messages');
    const li = document.createElement('li');
    li.textContent = `${user.nickname} (${displayDateHour(
      new Date(Date.now())
    )}) : ${text}`;
    list.appendChild(li);
    scrollChatToBottom(); // Scroll to the bottom after appending
    // loadMessages(currentReceiverID, true, true);
  }

  input.value = ''; // Clear input
}

async function loadMessages(userID, shouldScroll = true, append = false) {
  try {
    const res = await fetch(
      `/messages?user=${userID}&limit=${limit}&offset=${currentOffset}`
    );
    if (!res.ok) throw new Error('Erreur lors du chargement des messages');

    const messages = await res.json();

    const list = document.getElementById('private-messages');
    if (!append) {
      list.innerHTML = ''; // Clear the list if not appending
    }
    if (!messages) {
      return;
    }
    messages.forEach((msg) => {
      const li = document.createElement('li');
      li.textContent = `${msg.SenderName} (${displayDateHour(
        new Date(msg.CreatedAt)
      )}) : ${msg.Content}`;
      list.prepend(li); // Add messages at the top
    });

    if (shouldScroll) {
      scrollChatToBottom(); // Scroll to the bottom after loading
    }

    // Update offset for next pagination
    currentOffset += messages.length;
  } catch (err) {
    console.error('Impossible de charger les messages :', err);
  }
}
// Throttle utility function
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function (...args) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

const throttledScrollHandler = throttle((e) => {
  if (e.target.scrollTop === 0) {
    loadMessages(currentReceiverID, false, true);
  }
}, 2000); // 2 secondes

document
  .getElementById('private-messages')
  .addEventListener('scroll', throttledScrollHandler);

export function displayDateHour(date) {
  const now = new Date();
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    const day = date.getDate();
    const month = date.toLocaleString('fr-FR', { month: 'short' });
    const time = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${day} ${month} ${time}`;
  }
}

export function scrollChatToBottom() {
  const list = document.getElementById('private-messages');
  if (list) {
    list.scrollTop = list.scrollHeight;
  }
}
