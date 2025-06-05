export async function updateUserSidebar() {
  try {
    const res = await fetch("/users/status");
    if (!res.ok) throw new Error("Erreur serveur");
    const users = await res.json();

    const ul = document.getElementById("user-sidebar-list");
    ul.innerHTML = "";

    users.forEach((u) => {
      const li = document.createElement("li");
      li.textContent = `${u.nickname} ${u.online ? "🟢" : "⚪"}`;
      ul.appendChild(li);
    });
  } catch (err) {
    console.error("Impossible de charger les utilisateurs", err);
  }
}
