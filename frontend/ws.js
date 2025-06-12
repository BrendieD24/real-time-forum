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
  statusWS = new WebSocket("ws://localhost:8080/ws/status");

  statusWS.onopen = () => {
    console.log("WebSocket status ouvert");
    clearTimeout(reconnectTimeout);

    // Envoi des messages en attente dans la file
    while (messageQueue.length > 0) {
      const message = messageQueue.shift();
      sendChatMessage(message.receiver_id, message.content);
    }
  };

  statusWS.onclose = () => {
    console.log("WebSocket status fermé");
    scheduleReconnect();
  };

  statusWS.onerror = (err) => {
    console.error("Erreur WebSocket status :", err);
    scheduleReconnect();
  };

  // Gestion des messages entrants
  statusWS.onmessage = (event) => {
    console.log("Message WebSocket reçu:", event.data);

    try {
      const data = JSON.parse(event.data);

      // Si c'est un message de chat et qu'un callback est enregistré
      if (data.type === "chat" && onChatMessageCallback) {
        onChatMessageCallback(data);
      }
    } catch (e) {
      console.error("Erreur parsing message:", e);
    }
  };
}

function scheduleReconnect() {
  if (!reconnectTimeout) {
    reconnectTimeout = setTimeout(() => {
      console.log("Tentative de reconnexion WebSocket...");
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
    type: "chat",
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
