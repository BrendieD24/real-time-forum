document.addEventListener("DOMContentLoaded", () => {
  let chatSocket;

  function initChatWebSocket() {
    chatSocket = new WebSocket("ws://localhost:8080/ws/chat");

    chatSocket.onopen = () => {
      console.log("WebSocket de chat connecté ✅");
    };

    chatSocket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (selectedUserId === msg.SenderID) {
        addMessageToList(msg, true); // en direct
      }
    };

    chatSocket.onclose = () => {
      console.warn("WebSocket de chat fermé ❌");
      setTimeout(initChatWebSocket, 3000);
    };
  }
  initChatWebSocket();
});
async function loadUsersForChat() {
  const res = await fetch("/users/status");
  if (!res.ok) return;

  const users = await res.json();
  const me = await getConnectedUser();
  const list = document.getElementById("user-list");
  list.innerHTML = "<h3>Utilisateurs :</h3>";

  users
    .filter((u) => u.id !== me.id)
    .forEach((user) => {
      const btn = document.createElement("button");
      btn.innerHTML = `${user.nickname} ${user.online ? "🟢" : "⚪"}`;
      btn.addEventListener("click", () => openChatWith(user));
      list.appendChild(btn);
    });
}
