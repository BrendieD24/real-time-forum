function showSection(sectionId) {
  const sections = document.querySelectorAll(".section");
  sections.forEach((sec) => {
    sec.style.display = sec.id === `section-${sectionId}` ? "block" : "none";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Cacher le bouton "Créer un post" tant que non connecté
  document.getElementById("createPostBtn").style.display = "none";

  // 🔄 Charger les posts dès le départ + détecter l'utilisateur
  getConnectedUser().then((user) => {
    if (user) {
      handleUserLoggedIn(user);
      document.getElementById("post-author")?.remove();

      // Montrer le bouton déconnexion
      const logoutBtn = document.getElementById("logoutBtn");
      logoutBtn.style.display = "inline-block";
      logoutBtn.addEventListener("click", async () => {
        await fetch("/logout");
        location.reload(); // Recharge la page pour réinitialiser l'état
      });
    }
    loadPosts();
  });

  document.getElementById("registerBtn").addEventListener("click", async () => {
    const nickname = document.getElementById("reg-nickname").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const firstname = document.getElementById("reg-firstname").value.trim();
    const lastname = document.getElementById("reg-lastname").value.trim();
    const age = document.getElementById("reg-age").value.trim();
    const gender = document.getElementById("reg-gender").value.trim();

    const msgBox = document.getElementById("register-msg");

    // 🔒 Vérification
    if (
      !nickname ||
      !email ||
      !password ||
      !firstname ||
      !lastname ||
      !age ||
      !gender
    ) {
      msgBox.innerText = "Veuillez remplir tous les champs.";
      msgBox.style.color = "black";
      return;
    }
    // 🔒 Vérification du format de l'email
    if (!email.includes("@") || !email.endsWith(".com")) {
      msgBox.innerText =
        "Veuillez entrer un email valide se terminant par .com";
      msgBox.style.color = "black";
      return;
    }
    // Vérification prénom/nom (lettres et espaces uniquement)
    const nameRegex = /^[A-Za-zÀ-ÿ\s\-]+$/;
    if (!nameRegex.test(firstname) || !nameRegex.test(lastname)) {
      msgBox.innerText =
        "Prénom et nom ne doivent pas contenir de caractères spéciaux";
      msgBox.style.color = "black";
      return;
    }

    // Vérification âge
    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 10) {
      msgBox.innerText = "Vous n'avais pas l'âge l'égal pour vous inscrire.";
      msgBox.style.color = "black";
      return;
    }

    const body = {
      Nickname: nickname,
      Email: email,
      Password: password,
      FirstName: firstname,
      LastName: lastname,
      Age: parseInt(age),
      Gender: gender
    };

    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const msg = await res.text();
      msgBox.innerText = msg;
      msgBox.style.color = res.ok ? "pink" : "black";
    } catch (err) {
      msgBox.innerText = "Erreur réseau";
      msgBox.style.color = "black";
    }
  });

  // CONNEXION
  document.getElementById("loginBtn").addEventListener("click", async () => {
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
  document.getElementById("postBtn").addEventListener("click", async () => {
    const title = document.getElementById("post-title").value.trim();
    const content = document.getElementById("post-content").value.trim();
    const category = document.getElementById("post-category").value;
    const msgBox = document.getElementById("post-msg");

    if (!title || !content || !category) {
      msgBox.innerText = "Tous les champs sont obligatoires.";
      msgBox.style.color = "red";
      return;
    }

    const res = await fetch("/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Title: title,
        Content: content,
        Category: category
      })
    });

    const msg = await res.text();
    msgBox.innerText = msg;
    msgBox.style.color = res.ok ? "green" : "red";

    if (res.ok) {
      document.getElementById("post-title").value = "";
      document.getElementById("post-content").value = "";
      loadPosts();
    }
  });
});
// 🧠 Déclarées globalement maintenant :
async function loadPosts() {
  const res = await fetch("/posts/all");
  const posts = await res.json();
  const container = document.getElementById("post-list");

  container.innerHTML = "";
  posts.forEach((post) => {
    const div = document.createElement("div");
    div.classList.add("thread");
    div.innerHTML = `
      <h3>${post.Title}</h3>
      <p><strong>Catégorie :</strong> ${post.Category}</p>
      <p>${post.Content}</p>
      <small>Posté le ${post.CreatedAt} par ${post.AuthorID}</small>
      <hr>
    `;
    container.appendChild(div);
  });
}
async function getConnectedUser() {
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
