import { openPrivateChat, displayDateHour } from './chat.js';

let statusWS = null;
let reconnectTimeout = null;
let messageQueue = []; // File d'attente pour les messages de chat
let onChatMessageCallback = null; // Callback pour traiter les messages de chat

export function openStatusWebSocket() {
  if (statusWS && statusWS.readyState === WebSocket.OPEN) {
    return;
  }

  createStatusWebSocket();
}

function createStatusWebSocket() {
  statusWS = new WebSocket('ws://localhost:8080/ws/status');

  statusWS.onopen = () => {
    clearTimeout(reconnectTimeout);

    // Envoi des messages en attente dans la file
    while (messageQueue.length > 0) {
      const message = messageQueue.shift();
      sendChatMessage(message.receiver_id, message.content);
    }
  };

  statusWS.onclose = () => {
    scheduleReconnect();
  };

  statusWS.onerror = (err) => {
    console.error('Erreur WebSocket status :', err);
    scheduleReconnect();
  };

  // Gestion des messages entrants
  statusWS.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      // Si c'est un message de chat et qu'un callback est enregistré
      if (data.type === 'chat') {
        const result = checkIfChatOpen();
        if (!checkIfChatOpen() || checkIfChatOpen() !== data.sender_name) {
          displayNotification(
            data.sender_name,
            data.sender_id,
            data.content,
            data.created_at
          );
        } else {
          onChatMessageCallback(data);
        }
      }
    } catch (e) {
      console.error('Erreur parsing message:', e);
    }
  };
}
function displayNotification(senderName, senderId, content, createdAt) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <strong>${senderName}</strong> vous a envoyé un message :<br>
    <em>${content}</em><br>
    <small>${displayDateHour(new Date(createdAt))}</small>
  `;

  // Ajoute un bouton pour ouvrir le chat
  const openChatButton = document.createElement('button');
  openChatButton.textContent = 'Ouvrir le chat';
  openChatButton.onclick = () => {
    openPrivateChat(senderId, senderName);
    document.body.removeChild(notification); // Ferme la notification
  };

  notification.appendChild(openChatButton);
  document.body.appendChild(notification);

  // Supprime la notification après 5 secondes
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 5000);
}

function checkIfChatOpen() {
  const chatSection = document.getElementById('section-chat');
  if (!chatSection) {
    return false; // Si la section de chat n'existe pas, retourne false
  }
  // Vérifie si le chat est ouvert et récupère le nom d'utilisateur
  const h3 = document.querySelector('#section-chat h3');
  if (!h3) {
    return false; // Si le h3 n'existe pas, retourne false
  }
  const username = h3.textContent.trim().split(' ').pop();

  if (
    chatSection &&
    chatSection.style.display !== 'none' &&
    username &&
    username.trim() !== '' &&
    username !== 'avec'
  ) {
    return username; // Retourne le username si le chat est ouvert
  }

  return false; // Retourne false si le chat est fermé
}
function scheduleReconnect() {
  if (!reconnectTimeout) {
    reconnectTimeout = setTimeout(() => {
      console.log('Tentative de reconnexion WebSocket...');
      createStatusWebSocket();
    }, 5000);
  }
}

// Nouvelle fonction pour envoyer des messages de chat
export function sendChatMessage(receiver_id, content) {
  if (!statusWS || statusWS.readyState !== WebSocket.OPEN) {
    // Stocker le message pour l'envoyer plus tard
    messageQueue.push({ receiver_id, content });
    openStatusWebSocket();
    return false;
  }

  const payload = {
    type: 'chat',
    receiver_id: receiver_id,
    content: content,
  };

  statusWS.send(JSON.stringify(payload));
  return true;
}

// Fonction pour définir le callback de traitement des messages de chat
export function setOnChatMessageCallback(callback) {
  onChatMessageCallback = callback;
}

// Vérifier si WebSocket est connecté
export function isConnected() {
  return statusWS && statusWS.readyState === WebSocket.OPEN;
}
