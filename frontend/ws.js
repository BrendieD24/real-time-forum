let statusWS = null;
let reconnectTimeout = null;

export function openStatusWebSocket() {
  if (statusWS && statusWS.readyState === WebSocket.OPEN) {
    return;
  }

  createStatusWebSocket();
}

function createStatusWebSocket() {
  statusWS = new WebSocket('ws://localhost:8080/ws/status');

  statusWS.onopen = () => {
    console.log('WebSocket status ouvert');
    clearTimeout(reconnectTimeout); // Clear any pending reconnection attempts
  };

  statusWS.onclose = () => {
    console.log('WebSocket status fermé');
    scheduleReconnect(); // Schedule a reconnect
  };

  statusWS.onerror = (err) => {
    console.error('Erreur WebSocket status :', err);
    scheduleReconnect(); // Schedule a reconnect on error
  };
}

function scheduleReconnect() {
  if (!reconnectTimeout) {
    reconnectTimeout = setTimeout(() => {
      console.log('Tentative de reconnexion WebSocket...');
      createStatusWebSocket();
    }, 5000); // Reconnect after 5 seconds
  }
}
