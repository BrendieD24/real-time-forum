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
