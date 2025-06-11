//----------------------------------Thème-----------------------------------//

const toggleButton = document.getElementById('toggle-theme');
const body = document.body;

// Vérifie le thème enregistré dans localStorage
if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark-mode');
} else {
  body.classList.add('light-mode');
}

// Gestion du changement de thème
toggleButton.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  body.classList.toggle('light-mode');

  if (body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

const themeIcon = document.getElementById('theme-icon');

function updateIcon() {
  themeIcon.textContent = body.classList.contains('dark-mode') ? '🌙' : '🌞';
}
updateIcon();

toggleButton.addEventListener('click', updateIcon);

//---------------------------------Fin-----------------------------------//
export function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  sections.forEach((sec) => {
    sec.style.display = sec.id === `section-${sectionId}` ? 'block' : 'none';
  });
}

export function handleUserLoggedIn(user) {
  const loginSection = document.getElementById('section-login');
  const registerSection = document.getElementById('section-register');
  const createPostSection = document.getElementById('section-create-post');
  const createPostBtn = document.getElementById('createPostBtn');

  if (loginSection) loginSection.style.display = 'none';
  if (registerSection) registerSection.style.display = 'none';
  if (createPostSection) createPostSection.style.display = 'none';
  if (createPostBtn) createPostBtn.style.display = 'inline-block';

  // Masquer boutons login/inscription
  const loginBtn = document.getElementById('btnLogin');
  const registerBtn = document.getElementById('btnRegister');

  if (loginBtn) loginBtn.style.display = 'none';
  if (registerBtn) registerBtn.style.display = 'none';

  // Afficher bouton déconnexion
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.style.display = 'inline-block';
    logoutBtn.addEventListener('click', async () => {
      await fetch('/logout');
      location.reload();
    });
  }
  const forumBtn = document.getElementById('btnPosts');
  if (forumBtn) {
    forumBtn.style.display = 'inline-block';
  }

  // Message de bienvenue avec le nickname
  const header = document.querySelector('.header');
  if (header && !document.getElementById('welcome-msg')) {
    const welcome = document.createElement('span');
    welcome.id = 'welcome-msg';
    welcome.textContent = ` 👋 Salut, ${user.nickname}`;
    header.appendChild(welcome);
  }
}
