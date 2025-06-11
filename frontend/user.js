import { openPrivateChat } from './chat.js';

export async function loadUserSidebar(userConnected) {
  try {
    const res = await fetch('/users/status');
    if (!res.ok) throw new Error('Erreur chargement users');

    const users = await res.json();
    console.log('Users sidebar :', users);

    const list = document.getElementById('user-list');
    list.innerHTML = '';

    users.forEach((user) => {
      console.log('User ID : ', user.ID);
      console.log('UserConnected ID : ', userConnected.id);

      // Ignore l'utilisateur connecté
      if (user.ID === (userConnected?.id || 0)) return;
      const li = document.createElement('li');
      li.classList.add('user-entry');

      // Point vert ou gris
      const dot = document.createElement('span');
      dot.classList.add('status-dot');
      dot.style.backgroundColor = user.Online ? 'green' : 'red';

      const nickname = document.createElement('span');
      nickname.textContent = user.Nickname;

      li.appendChild(dot);
      li.appendChild(nickname);

      // Clique sur user → ouvre chat privé
      li.addEventListener('click', () => {
        openPrivateChat(user.ID, user.Nickname);
      });

      list.appendChild(li);
    });
  } catch (err) {
    console.error('Erreur sidebar users :', err);
  }
}

export function hideUserSidebar() {
  const sidebar = document.getElementById('user-sidebar');
  if (sidebar) {
    sidebar.style.display = 'none';
  }
}
export function showUserSidebar() {
  const sidebar = document.getElementById('user-sidebar');
  if (sidebar) {
    sidebar.style.display = 'block';
  }
}
