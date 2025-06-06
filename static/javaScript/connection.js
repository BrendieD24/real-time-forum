document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login").addEventListener("click", async () => {
    const body = {
      Identifier: document.getElementById("login-id").value,
      Password: document.getElementById("login-pwd").value
    };

    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
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
  try {
    const res = await fetch("/me");
    if (!res.ok) {
      console.warn("/me → Non connecté");
      return null;
    }
    const user = await res.json();
    console.log("Utilisateur connecté :", user);
    return user;
  } catch (err) {
    console.error("Erreur getConnectedUser :", err);
    return null;
  }
}

export async function handleUserLoggedIn(user) {
  document.getElementById("section-login").style.display = "none";
  document.getElementById("section-register").style.display = "none";
  document.getElementById("section-create-post").style.display = "none";
  document.getElementById("createPostBtn").style.display = "inline-block";

  // Masquer boutons login/inscription
  document.getElementById("register")?.style.display === "none";
  document.getElementById("login")?.style.display === "none";

  // Afficher bouton déconnexion
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.style.display = "inline-block";
  logoutBtn.addEventListener("click", async () => {
    await fetch("/logout");
    location.reload();
  });

  // Affiche le bouton pour créer un post
  const createBtn = document.getElementById("createPostBtn");
  if (createBtn) createBtn.style.display = "inline-block";

  // Message de bienvenue avec le nickname
  const header = document.querySelector(".header");
  const welcome = document.createElement("span");
  welcome.id = "welcome-msg";
  welcome.textContent = ` 👋 Salut, ${user.nickname}`;
  header.appendChild(welcome);
}
