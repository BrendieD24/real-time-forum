document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login").addEventListener("click", async () => {
    const body = {
      Identifier: document.getElementById("login-id").value,
      Password: document.getElementById("login-pwd").value,
    };

    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const msgBox = document.getElementById("login-msg");
    msgBox.innerText = await res.text();
    msgBox.style.color = res.ok ? "pink" : "black";

    // 🔄 Si connexion réussie : récupérer utilisateur + mettre à jour l'UI
    if (res.ok) {
      const user = await getConnectedUser();
      if (user) handleUserLoggedIn(user);
    }
  });
});

export async function getConnectedUser() {
  const res = await fetch("/me");
  if (!res.ok) return null;

  const user = await res.json();
  console.log("Utilisateur connecté :", user);
  return user;
}

function handleUserLoggedIn(user) {
  document.getElementById("section-login").style.display = "none";
  document.getElementById("section-register").style.display = "none";
  document.getElementById("section-create-post").style.display = "none";
  document.getElementById("createPostBtn").style.display = "inline-block";

  // Masquer boutons login/inscription
  document.querySelector(
    "button[onclick=\"showSection('login')\"]"
  ).style.display = "none";
  document.querySelector(
    "button[onclick=\"showSection('register')\"]"
  ).style.display = "none";

  // Afficher bouton déconnexion
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.style.display = "inline-block";
  logoutBtn.addEventListener("click", async () => {
    await fetch("/logout");
    location.reload();
  });

  // Message de bienvenue avec le nickname
  const header = document.querySelector(".header");
  const welcome = document.createElement("span");
  welcome.id = "welcome-msg";
  welcome.textContent = ` 👋 Salut, ${user.nickname}`;
  header.appendChild(welcome);
}
