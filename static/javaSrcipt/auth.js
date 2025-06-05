document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("register").addEventListener("click", async () => {
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
      Gender: gender,
    };

    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const msg = await res.text();
      msgBox.innerText = msg;
      msgBox.style.color = res.ok ? "pink" : "black";
    } catch (err) {
      msgBox.innerText = "Erreur réseau";
      msgBox.style.color = "black";
    }
  });
});
