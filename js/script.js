const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

const roleCards = document.querySelectorAll("[data-role]");
const roleInput = document.querySelector("[data-role-input]");
const loginTitle = document.querySelector("[data-login-title]");
const loginForm = document.querySelector("[data-login-form]");
const formMessage = document.querySelector("[data-form-message]");
const dashboardUser = document.querySelector("[data-dashboard-user]");
const logoutButton = document.querySelector("[data-logout-button]");

function setFormMessage(message, type = "info") {
  if (!formMessage) {
    return;
  }

  formMessage.textContent = message;
  formMessage.dataset.type = type;
}

function updateLoggedUser(user) {
  if (!dashboardUser || !logoutButton) {
    return;
  }

  if (!user) {
    dashboardUser.textContent = "Connectez-vous pour afficher votre espace.";
    logoutButton.classList.add("is-hidden");
    return;
  }

  dashboardUser.textContent = `${user.prenom} ${user.nom} - ${user.role}`;
  logoutButton.classList.remove("is-hidden");
}

roleCards.forEach((card) => {
  card.addEventListener("click", () => {
    const role = card.dataset.role;

    roleCards.forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");

    if (roleInput) {
      roleInput.value = role;
    }

    if (loginTitle) {
      loginTitle.textContent = `Connexion ${card.querySelector("span").textContent.toLowerCase()}`;
    }
  });
});

if (loginForm) {
  fetch("../backend/auth/me.php", { credentials: "include" })
    .then((response) => response.json())
    .then((data) => updateLoggedUser(data.user))
    .catch(() => updateLoggedUser(null));

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage("Connexion en cours...");

    try {
      const response = await fetch(loginForm.action, {
        method: "POST",
        body: new FormData(loginForm),
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setFormMessage(data.message || "Connexion impossible.", "error");
        updateLoggedUser(null);
        return;
      }

      setFormMessage(data.message, "success");
      updateLoggedUser(data.user);
      loginForm.reset();
    } catch (error) {
      setFormMessage("Le serveur PHP ne répond pas.", "error");
      updateLoggedUser(null);
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    await fetch("../backend/auth/logout.php", { credentials: "include" });
    setFormMessage("Vous êtes déconnecté.", "success");
    updateLoggedUser(null);
  });
}
