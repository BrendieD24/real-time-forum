export async function loadUserSidebar() {
  console.log("Chargement de la liste des utilisateurs...");

  try {
    const res = await fetch("/users/status");
    if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");

    const users = await res.json();
    console.log("Utilisateurs reçus :", users);

    const list = document.getElementById("user-list");
    list.innerHTML = "";

    users.forEach((user) => {
      const li = document.createElement("li");
      li.classList.add("user-entry");

      // ⬤ point vert ou gris
      const dot = document.createElement("span");
      dot.classList.add("status-dot");
      dot.style.backgroundColor = user.Online ? "green" : "gray";

      const nickname = document.createElement("span");
      nickname.textContent = user.Nickname;

      // ⬇️ Clique sur le user → ouvre chat privé
      li.addEventListener("click", () => {
        openPrivateChat(user.ID, user.Nickname); // On passe ID et Nickname
      });

      li.appendChild(dot);
      li.appendChild(nickname);
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Impossible de charger les utilisateurs :", err);
  }
}
