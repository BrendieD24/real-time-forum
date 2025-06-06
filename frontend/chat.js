let currentReceiverID = null;
export async function loadUserList() {
  console.log("Chargement de la liste des users");

  const res = await fetch("/users/all");
  if (!res.ok) {
    console.error("Erreur lors du chargement des users");
    return;
  }

  const users = await res.json();
  console.log("Utilisateurs reçus :", users);

  const list = document.getElementById("user-list");
  list.innerHTML = "";

  users.forEach((user) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = `${user.Nickname}`;
    btn.addEventListener("click", () => {
      currentReceiverID = user.ID;
      openPrivateChat(user.Nickname);
    });

    li.appendChild(btn);
    list.appendChild(li);
  });
}

function openPrivateChat(nickname, receiverId) {
  console.log("Chat privé vers", nickname, receiverId);

  currentReceiverID = receiverId; // stocke l'ID

  document.getElementById(
    "private-chat-title"
  ).textContent = `Chat avec ${nickname}`;
  document.getElementById("private-chat").style.display = "block";
  document.getElementById("private-messages").innerHTML = "";

  // Ajoute un listener pour envoyer le message
  const sendBtn = document.getElementById("send-message");

  // Supprimer les anciens listeners (sinon si tu cliques plusieurs fois → bug)
  sendBtn.replaceWith(sendBtn.cloneNode(true)); // astuce : clone le bouton
  document
    .getElementById("send-message")
    .addEventListener("click", async () => {
      const text = document.getElementById("private-message").value.trim();
      if (!text || !currentReceiverID) return;

      const res = await fetch("/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ReceiverID: currentReceiverID,
          Content: text
        })
      });

      if (res.ok) {
        // ajouter ton message dans la liste
        const li = document.createElement("li");
        li.textContent = `Moi : ${text}`;
        document.getElementById("private-messages").appendChild(li);

        document.getElementById("private-message").value = "";
      } else {
        console.error("Erreur envoi message");
      }
    });
}
