//----------------------------------Thème-----------------------------------//

const toggleButton = document.getElementById("toggle-theme");
const body = document.body;

// Vérifie le thème enregistré dans localStorage
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark-mode");
} else {
  body.classList.add("light-mode");
}

// Gestion du changement de thème
toggleButton.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
  body.classList.toggle("light-mode");

  if (body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

const themeIcon = document.getElementById("theme-icon");

function updateIcon() {
  themeIcon.textContent = body.classList.contains("dark-mode") ? "🌙" : "🌞";
}
updateIcon();

toggleButton.addEventListener("click", updateIcon);

//---------------------------------Fin-----------------------------------//
