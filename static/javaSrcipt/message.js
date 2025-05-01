document.addEventListener("DOMContentLoaded", () => {
  function addMessageToList(msg, realtime = false) {
    const list = document.getElementById("message-list");
    const li = document.createElement("li");

    li.classList.add("message-bubble");
    li.classList.add(
      msg.SenderID === currentUserId ? "message-right" : "message-left"
    );
    li.textContent = `${msg.Content}`;
    list.appendChild(li);

    if (realtime) {
      list.scrollTop = list.scrollHeight;
    }
  }
});
