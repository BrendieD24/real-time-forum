import { getConnectedUser } from './auth.js';
import { showSection } from './page.js';

export async function loadPosts() {
  //Verifie si l'utilisateur est connecté
  const user = await getConnectedUser();
  if (!user) {
    showSection('login');
    return;
  }
  const res = await fetch('/posts/all');
  const posts = await res.json();
  const container = document.getElementById('section-posts');

  container.innerHTML = '';

  posts.forEach((post) => {
    const div = document.createElement('div');
    div.classList.add('thread');

    const title = document.createElement('h3');
    title.textContent = post.Title;

    const category = document.createElement('p');
    category.innerHTML = `<strong>Catégorie :</strong> ${post.Category}`;

    const content = document.createElement('p');
    content.textContent = post.Content;

    const footer = document.createElement('small');
    footer.textContent = `Posté le ${post.CreatedAt} par ${post.Author}`;

    const hr = document.createElement('hr');

    div.appendChild(title);
    div.appendChild(category);
    div.appendChild(content);
    div.appendChild(footer);
    div.appendChild(hr);

    container.appendChild(div);

    showSection('posts');
    div.addEventListener('click', () => {
      showPostDetail(post);
    });
  });
}

export async function showPostDetail(post) {
  const user = await getConnectedUser();

  const detail = document.getElementById('section-post-detail');
  detail.innerHTML = '';

  const backBtn = document.createElement('button');
  backBtn.textContent = '← Retour';
  backBtn.addEventListener('click', () => {
    showSection('posts');
  });

  const title = document.createElement('h2');
  title.textContent = post.Title;

  const info = document.createElement('p');
  info.innerHTML = `<strong>Catégorie :</strong> ${post.Category} <br>
        <strong>Auteur :</strong> ${post.Author} <br>
        <strong>Date :</strong> ${post.CreatedAt}`;

  const content = document.createElement('p');
  content.textContent = post.Content;

  const commentSection = document.createElement('div');
  const commentList = document.createElement('ul');
  commentSection.appendChild(commentList);

  if (user) {
    const commentInput = document.createElement('input');
    commentInput.placeholder = 'Votre commentaire';

    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Envoyer';

    const msg = document.createElement('div');

    sendBtn.addEventListener('click', async () => {
      const text = commentInput.value.trim();
      if (!text) return;

      const res = await fetch('/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          PostID: post.ID,
          Content: text,
        }),
      });

      const txt = await res.text();
      msg.textContent = txt;
      msg.style.color = res.ok ? 'green' : 'red';

      if (res.ok) {
        commentInput.value = '';
        await loadComments(post.ID, commentList);
      }
    });

    commentSection.appendChild(commentInput);
    commentSection.appendChild(sendBtn);
    commentSection.appendChild(msg);
  } else {
    const warning = document.createElement('p');
    warning.textContent = 'Vous devez être connecté pour commenter.';
    warning.style.color = 'orange';
    commentSection.appendChild(warning);
  }

  await loadComments(post.ID, commentList);

  detail.appendChild(backBtn);
  detail.appendChild(title);
  detail.appendChild(info);
  detail.appendChild(content);
  detail.appendChild(document.createElement('hr'));
  detail.appendChild(commentSection);

  showSection('post-detail');
}

export async function loadComments(postID, ulElement) {
  ulElement.innerHTML = '';

  const res = await fetch(`/comments/all?post=${postID}`);
  if (!res.ok) {
    ulElement.innerHTML =
      '<li>Erreur lors du chargement des commentaires.</li>';
    return;
  }

  let comments = [];
  try {
    comments = await res.json();
    if (!Array.isArray(comments)) throw new Error('Format inattendu');
  } catch (err) {
    ulElement.innerHTML = '<li>Impossible de lire les commentaires.</li>';
    return;
  }

  comments.forEach((c) => {
    const li = document.createElement('li');
    li.textContent = `${c.Author} (${c.CreatedAt}) : ${c.Content}`;
    ulElement.appendChild(li);
  });
}

export async function createPost() {
  // Vérification si l'utilisateur est connecté
  const user = await getConnectedUser();
  if (!user) {
    alert('Vous devez être connecté pour créer un post.');
    showSection('login');
    return;
  }
  const title = document.getElementById('post-title').value.trim();
  const category = document.getElementById('post-category').value.trim();
  const content = document.getElementById('post-content').value.trim();

  // Vérification des champs
  if (!title || !category || !content) {
    alert('Veuillez remplir tous les champs.');
    return;
  }

  const res = await fetch('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Title: title,
      Category: category,
      Content: content,
    }),
  });

  if (res.ok) {
    document.getElementById('post-title').value = '';
    document.getElementById('post-category').value = '';
    document.getElementById('post-content').value = '';
    loadPosts();
    showSection('posts');
  } else {
    const msg = await res.text();
    alert(`Erreur lors de la création du post : ${msg}`);
  }
}
