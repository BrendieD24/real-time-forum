// document.addEventListener("DOMContentLoaded", () => {
//   let chatSocket;

//   function initChatWebSocket() {
//     chatSocket = new WebSocket("ws://localhost:8080/ws/chat");

//     chatSocket.onopen = () => {
//       console.log("WebSocket de chat connecté ✅");
//     };

//     chatSocket.onmessage = (event) => {
//       const msg = JSON.parse(event.data);
//       if (selectedUserId === msg.SenderID) {
//         addMessageToList(msg, true); // en direct
//       }
//     };

//     chatSocket.onclose = () => {
//       console.warn("WebSocket de chat fermé ❌");
//       setTimeout(initChatWebSocket, 3000);
//     };
//   }
//   initChatWebSocket();
// });
