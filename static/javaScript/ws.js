import { updateUserSidebar } from "./user.js";
import { getConnectedUser } from "./connection.js";

document.addEventListener("DOMContentLoaded", () => {
  const ws = new WebSocket("ws://localhost:8080/ws/status");

  ws.onopen = () => {
    console.log("WebSocket statut ouvert");
  };
  ws.onclose = () => {
    console.log("WebSocket statut fermé");
  };
  getConnectedUser().then((user) => {
    if (user) {
      const ws = new WebSocket("ws://localhost:8080/ws/status");

      ws.onopen = () => console.log("🟢 Statut WebSocket ouvert");
      ws.onclose = () => console.log("🔴 Statut WebSocket fermé");
    }
  });
  ws.onmessage = (event) => {
    const statusUpdate = JSON.parse(event.data);
    console.log("Mise à jour du statut :", statusUpdate);
    updateUserSidebar(); // mettre à jour la liste visuellement
  };
});
