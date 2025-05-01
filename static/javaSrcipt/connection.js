document.addEventListener("DOMContentLoaded", () => {
  let ws;

  function initUserStatusWebSocket() {
    ws = new WebSocket("ws://localhost:8080/ws/status");

    ws.onopen = () => {
      console.log("WebSocket connecté au serveur ✅");
    };

    ws.onmessage = (event) => {
      const users = JSON.parse(event.data);
      renderUserSidebar(users);
    };

    ws.onerror = (err) => {
      console.error("WebSocket erreur :", err);
    };

    ws.onclose = () => {
      console.warn("WebSocket fermé ❌");
      // 🔁 Option : reconnexion automatique après 3s
      setTimeout(initUserStatusWebSocket, 3000);
    };
  }
  initUserStatusWebSocket();
});
