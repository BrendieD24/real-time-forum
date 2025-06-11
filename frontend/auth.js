import { showSection } from './page.js';
import { showUserSidebar } from './user.js';
import { openStatusWebSocket } from './ws.js';

export async function register() {
  const nickname = document.getElementById('reg-nickname').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const firstname = document.getElementById('reg-firstname').value.trim();
  const lastname = document.getElementById('reg-lastname').value.trim();
  const age = document.getElementById('reg-age').value.trim();
  const gender = document.getElementById('reg-gender').value.trim();

  const msgBox = document.getElementById('register-msg');

  if (
    !nickname ||
    !email ||
    !password ||
    !firstname ||
    !lastname ||
    !age ||
    !gender
  ) {
    msgBox.innerText = 'Veuillez remplir tous les champs.';
    msgBox.style.color = 'black';
    return;
  }

  if (!email.includes('@') || !email.endsWith('.com')) {
    msgBox.innerText = 'Veuillez entrer un email valide se terminant par .com';
    msgBox.style.color = 'black';
    return;
  }

  const nameRegex = /^[A-Za-zÀ-ÿ\s\-]+$/;
  if (!nameRegex.test(firstname) || !nameRegex.test(lastname)) {
    msgBox.innerText =
      'Prénom et nom ne doivent pas contenir de caractères spéciaux';
    msgBox.style.color = 'black';
    return;
  }

  const parsedAge = parseInt(age);
  if (isNaN(parsedAge) || parsedAge < 10) {
    msgBox.innerText = "Vous n'avez pas l'âge légal pour vous inscrire.";
    msgBox.style.color = 'black';
    return;
  }

  const body = {
    Nickname: nickname,
    Email: email,
    Password: password,
    FirstName: firstname,
    LastName: lastname,
    Age: parsedAge,
    Gender: gender,
  };

  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const msg = await res.text();
    msgBox.innerText = msg;
    msgBox.style.color = res.ok ? 'pink' : 'black';
  } catch (err) {
    msgBox.innerText = 'Erreur réseau';
    msgBox.style.color = 'black';
  }
}

export async function login() {
  const body = {
    Identifier: document.getElementById('login-id').value,
    Password: document.getElementById('login-pwd').value,
  };

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const msgBox = document.getElementById('login-msg');
  msgBox.innerText = await res.text();
  msgBox.style.color = res.ok ? 'pink' : 'black';

  if (res.ok) {
    const user = await getConnectedUser();
    if (user) {
      console.log('Utilisateur connecté de merde :', user);
      openStatusWebSocket();
      showSection('posts');
      showUserSidebar();
      import('./page.js').then(({ handleUserLoggedIn }) => {
        handleUserLoggedIn(user);
      });
    }
  }
}

export async function getConnectedUser() {
  const res = await fetch('/me');
  if (!res.ok) return null;

  const user = await res.json();
  console.log('Utilisateur connecté :', user);
  return user;
}
