const ws = new WebSocket("ws://localhost:8080/ws/chat");

ws.onopen = () => {
  console.log("✅ WebSocket chat ouvert");
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log("📩 Message privé reçu :", msg);
  const list = document.getElementById("chat-list");
  const li = document.createElement("li");
  li.textContent = `De ${msg.SenderID}: ${msg.Content}`;
  list.appendChild(li);
};

function sendMessage() {
  const receiverID = document.getElementById("receiver-id").value.trim();
  const text = document.getElementById("chat-input").value.trim();
  if (!receiverID || !text) return;

  ws.send(
    JSON.stringify({
      ReceiverID: receiverID,
      Content: text
    })
  );

  document.getElementById("chat-input").value = "";
}
