import { loadUserList } from "./chat.js";

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
  loadUserList();

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

    const title = document.createElement("h3");
    title.textContent = post.Title;

    const category = document.createElement("p");
    category.innerHTML = `<strong>Catégorie :</strong> ${post.Category}`;

    const content = document.createElement("p");
    content.textContent = post.Content;

    const footer = document.createElement("small");
    footer.textContent = `Posté le ${post.CreatedAt} par ${post.Author}`;

    const hr = document.createElement("hr");

    div.appendChild(title);
    div.appendChild(category);
    div.appendChild(content);
    div.appendChild(footer);
    div.appendChild(hr);

    container.appendChild(div);

    div.addEventListener("click", () => {
      showPostDetail(post);
    });
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
async function showPostDetail(post) {
  const user = await getConnectedUser();

  const detail = document.getElementById("post-detail");
  detail.innerHTML = ""; // vider le contenu précédent
  detail.style.display = "block";

  const backBtn = document.createElement("button");
  backBtn.textContent = "← Retour";
  backBtn.addEventListener("click", () => {
    detail.style.display = "none";
    document.getElementById("post-list").style.display = "block";
  });

  const title = document.createElement("h2");
  title.textContent = post.Title;

  const info = document.createElement("p");
  info.innerHTML = `<strong>Catégorie :</strong> ${post.Category} <br>
    <strong>Auteur :</strong> ${post.Author} <br>
    <strong>Date :</strong> ${post.CreatedAt}`;

  const content = document.createElement("p");
  content.textContent = post.Content;

  // 💬 Commentaires
  const commentSection = document.createElement("div");
  const commentList = document.createElement("ul");
  commentSection.appendChild(commentList);

  // 🧠 Si connecté → afficher le champ
  if (user) {
    const commentInput = document.createElement("input");
    commentInput.placeholder = "Votre commentaire";

    const sendBtn = document.createElement("button");
    sendBtn.textContent = "Envoyer";

    const msg = document.createElement("div");

    sendBtn.addEventListener("click", async () => {
      const text = commentInput.value.trim();
      if (!text) return;

      const res = await fetch("/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          PostID: post.ID,
          Content: text
        })
      });

      const txt = await res.text();
      msg.textContent = txt;
      msg.style.color = res.ok ? "green" : "red";

      if (res.ok) {
        commentInput.value = "";
        await loadComments(post.ID, commentList);
      }
    });

    commentSection.appendChild(commentInput);
    commentSection.appendChild(sendBtn);
    commentSection.appendChild(msg);
  } else {
    // Sinon : message "connexion requise"
    const warning = document.createElement("p");
    warning.textContent = "Vous devez être connecté pour commenter.";
    warning.style.color = "orange";
    commentSection.appendChild(warning);
  }
  await loadComments(post.ID, commentList);

  detail.appendChild(backBtn);
  detail.appendChild(title);
  detail.appendChild(info);
  detail.appendChild(content);
  detail.appendChild(document.createElement("hr"));
  detail.appendChild(commentSection);

  document.getElementById("post-list").style.display = "none";
}
async function loadComments(postID, ulElement) {
  ulElement.innerHTML = "";

  const res = await fetch(`/comments/all?post=${postID}`);
  if (!res.ok) {
    ulElement.innerHTML =
      "<li>Erreur lors du chargement des commentaires.</li>";
    return;
  }

  let comments = [];
  try {
    comments = await res.json();
    if (!Array.isArray(comments)) throw new Error("Format inattendu");
  } catch (err) {
    ulElement.innerHTML = "<li>Impossible de lire les commentaires.</li>";
    return;
  }

  comments.forEach((c) => {
    const li = document.createElement("li");
    li.textContent = `${c.Author} (${c.CreatedAt}) : ${c.Content}`;
    ulElement.appendChild(li);
  });
}

const ws = new WebSocket("ws://localhost:8080/ws/chat");

ws.onopen = () => {
  console.log("✅ WebSocket chat ouvert");
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log("📩 Message reçu :", msg);
  // Ici tu peux l'ajouter à la liste de messages sur la page
};

ws.onclose = () => {
  console.log("❌ WebSocket fermé");
};

// Envoi d'un message :
function sendMessage(content) {
  ws.send(
    JSON.stringify({
      ReceiverID: "xxx", // optionnel si privé
      Content: content
    })
  );
}

users.forEach((user) => {
  const li = document.createElement("li");
  const btn = document.createElement("button");
  btn.textContent = `${user.nickname} (${user.id})`;
  btn.addEventListener("click", () => {
    // Ouvre la messagerie avec cet utilisateur
    showSection("messagerie");
    openChatWith(user.id, user.nickname); // ← ta fonction de chat
  });
  li.appendChild(btn);
  document.getElementById("user-list").appendChild(li);
});
