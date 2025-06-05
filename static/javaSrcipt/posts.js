import { updateUserSidebar } from "./user.js";
import { getConnectedUser } from "./connection.js";
let refreshUsersInterval;

export function showSection(sectionId) {
  const sections = document.querySelectorAll(".section");
  sections.forEach((sec) => {
    sec.style.display = "none"; // tout cacher
  });

  const target = document.getElementById(`section-${sectionId}`);
  if (target) {
    target.style.display = "block"; // afficher la bonne section
  }

  // Optionnel : cacher la liste des posts
  const postList = document.getElementById("post-list");
  if (postList && sectionId !== "posts") {
    postList.style.display = "none";
  }
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
        Category: category,
      }),
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
  updateUserSidebar();
  setInterval(updateUserSidebar, 5000); // 🔁 refresh every 5s
});
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

    div.append(title, category, content, footer);
    container.appendChild(div);

    div.addEventListener("click", () => {
      showPostDetail(post);
    });
  });
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
          Content: text,
        }),
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
