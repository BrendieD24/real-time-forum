let statusWS = null;
let statusWSInterval = null;

export function openStatusWebSocket() {
  if (statusWS && statusWS.readyState === WebSocket.OPEN) {
    return;
  }

  statusWS = new WebSocket("ws://localhost:8080/ws/status");

  statusWS.onopen = () => {
    console.log("WebSocket status ouvert");
  };

  statusWS.onclose = () => {
    console.log("WebSocket status fermé");
  };

  statusWS.onerror = (err) => {
    console.error("Erreur WebSocket status :", err);
  };

  // Si pas encore démarré → start interval
  if (!statusWSInterval) {
    statusWSInterval = setInterval(() => {
      console.log("Refreshing WebSocket status...");
      refreshStatusWebSocket();
    }, 10000); // toutes les 10s
  }
}

function refreshStatusWebSocket() {
  if (statusWS) {
    statusWS.close(); // ferme l'ancien WS
  }

  // En ouvrir un nouveau :
  statusWS = new WebSocket("ws://localhost:8080/ws/status");

  statusWS.onopen = () => {
    console.log("WebSocket status rafraîchi !");
  };

  statusWS.onclose = () => {
    console.log("WebSocket status fermé");
  };

  statusWS.onerror = (err) => {
    console.error("Erreur WebSocket status :", err);
  };
}
