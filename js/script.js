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

const destinationsGrid = document.querySelector("[data-destinations-grid]");
const featuredDestination = document.querySelector("[data-featured-destination]");
const destinationsCount = document.querySelector("[data-destinations-count]");

const destinationPhotos = {
  "maldives.jpg": "https://images.unsplash.com/photo-1769389352398-f7b694034eb5?auto=format&fit=crop&w=1200&q=80",
  "kyoto.jpg": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
  "santorini.jpg": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=80",
  "marrakech.jpg": "https://images.unsplash.com/photo-1750859464437-b66433efd869?auto=format&fit=crop&w=900&q=80",
};

function formatPrice(value) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function getDestinationPhoto(destination) {
  return destinationPhotos[destination.image] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80";
}

function renderFeaturedDestination(destination) {
  if (!featuredDestination || !destination) {
    return;
  }

  featuredDestination.innerHTML = `
    <img class="featured-photo" src="${getDestinationPhoto(destination)}" alt="${destination.nom_destination}, ${destination.pays}">
    <div class="featured-content">
      <span class="stay-tag">Coup de coeur</span>
      <h3>${destination.nom_destination}, ${destination.pays}</h3>
      <p>${destination.description}</p>
      <div class="feature-details">
        <span>${destination.continent}</span>
        <span>Voyage premium</span>
        <span>A partir de ${formatPrice(destination.budget_min)} EUR</span>
      </div>
      <a class="btn-secondary" href="destination-detail.html?id=${destination.id_destination}">Voir la destination</a>
    </div>
  `;
}

function renderDestinationCards(destinations) {
  if (!destinationsGrid) {
    return;
  }

  destinationsGrid.innerHTML = destinations.map((destination) => `
    <article class="catalog-card">
      <img class="catalog-photo" src="${getDestinationPhoto(destination)}" alt="${destination.nom_destination}, ${destination.pays}">
      <div class="catalog-card-body">
        <div class="rating">Destination ${destination.continent}</div>
        <h3>${destination.nom_destination}, ${destination.pays}</h3>
        <p>${destination.description}</p>
        <div class="card-meta">
          <span>A partir de</span>
          <span>${formatPrice(destination.budget_min)} EUR</span>
        </div>
        <a href="destination-detail.html?id=${destination.id_destination}">Voir la destination</a>
      </div>
    </article>
  `).join("");
}

if (destinationsGrid) {
  fetch("../backend/api/destinations.php")
    .then((response) => response.json())
    .then((data) => {
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error("Destinations indisponibles");
      }

      const destinations = data.data;
      const featured = destinations.find((destination) => destination.nom_destination === "Maldives") || destinations[0];
      const cards = destinations.filter((destination) => destination.id_destination !== featured.id_destination);

      if (destinationsCount) {
        destinationsCount.textContent = `${destinations.length} destinations trouvées`;
      }

      renderFeaturedDestination(featured);
      renderDestinationCards(cards);
    })
    .catch(() => {
      if (destinationsCount) {
        destinationsCount.textContent = "Destinations indisponibles";
      }
    });
}
