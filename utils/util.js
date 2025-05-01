function addMessageToList(msg, realtime = false) {
  const list = document.getElementById("message-list");
  const li = document.createElement("li");
  li.classList.add("message-bubble");

  if (msg.SenderID === currentUserId) {
    li.classList.add("message-right");
  } else {
    li.classList.add("message-left");
  }

  li.textContent = msg.Content;
  list.appendChild(li);

  if (realtime) {
    list.scrollTop = list.scrollHeight;
  }
}
