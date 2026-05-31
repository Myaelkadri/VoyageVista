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
const logoutButtons = document.querySelectorAll("[data-logout-button]");
const logoutButton = logoutButtons[0];
const dashboardGrid = document.querySelector(".dashboard-grid");
const registerForm = document.querySelector("[data-register-form]");
const registerRoleInput = document.querySelector("[data-register-role-input]");
const registerMessage = document.querySelector("[data-register-message]");
const authHeading = document.querySelector("[data-auth-heading]");
const authCopy = document.querySelector("[data-auth-copy]");
const currentSessionCard = document.querySelector("[data-current-session]");
const currentSessionTitle = document.querySelector("[data-current-session-title]");
const currentSessionText = document.querySelector("[data-current-session-text]");
const currentSessionLink = document.querySelector("[data-current-session-link]");

const roleLabels = {
  voyageur: "voyageur",
  prestataire: "prestataire",
  admin: "administrateur",
};

const roleRedirects = {
  voyageur: "compte-voyageur.html",
  prestataire: "prestataire.html",
  admin: "admin.html",
};

function getSelectedRole() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role") || roleInput?.value || "voyageur";
  return roleLabels[role] ? role : "voyageur";
}

function applyAuthRole() {
  const role = getSelectedRole();
  const label = roleLabels[role];

  if (roleInput) {
    roleInput.value = role;
  }

  if (registerRoleInput) {
    registerRoleInput.value = role;
  }

  if (loginTitle) {
    loginTitle.textContent = `Connexion ${label}`;
  }

  if (authHeading) {
    authHeading.textContent = `Connexion ${label}`;
  }

  if (authCopy) {
    authCopy.textContent = `Connectez-vous pour acceder a votre espace ${label}.`;
  }
}

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
  loadDashboardData();
}

function showCurrentSession(user) {
  if (!currentSessionCard || !user) {
    return;
  }

  currentSessionCard.classList.remove("is-hidden");

  if (currentSessionTitle) {
    currentSessionTitle.textContent = `${user.prenom} ${user.nom}`;
  }

  if (currentSessionText) {
    currentSessionText.textContent = `Connecté en tant que ${roleLabels[user.role] || user.role}.`;
  }

  if (currentSessionLink) {
    currentSessionLink.href = roleRedirects[user.role] || "compte-voyageur.html";
  }
}

function renderDashboard(data) {
  if (!dashboardGrid) {
    return;
  }

  const reservation = data.reservations[0];
  const notificationsCount = data.notifications.length;
  const favorisCount = data.favoris.length;

  dashboardGrid.innerHTML = `
    <article class="dashboard-card">
      <span>Réservation active</span>
      <h3>${escapeHTML(reservation?.titre || "Aucune réservation")}</h3>
      <p>${reservation ? `${escapeHTML(reservation.date_debut)} au ${escapeHTML(reservation.date_fin)} · Référence ${escapeHTML(reservation.reference_reservation)}` : "Composez un séjour depuis une destination."}</p>
    </article>

    <article class="dashboard-card">
      <span>Panier</span>
      <h3>${reservation ? `${formatPrice(reservation.montant_total)} EUR` : "0 EUR"}</h3>
      <p>${reservation ? `Statut : ${escapeHTML(reservation.statut_reservation)}` : "Aucun voyage en attente de validation."}</p>
    </article>

    <article class="dashboard-card">
      <span>Favoris</span>
      <h3>${favorisCount} éléments</h3>
      <p>Destinations, hébergements, transports ou activités sauvegardés.</p>
    </article>

    <article class="dashboard-card">
      <span>Notifications</span>
      <h3>${notificationsCount} messages</h3>
      <p>${escapeHTML(data.notifications[0]?.message || "Aucune notification pour le moment.")}</p>
    </article>
  `;
}

function loadDashboardData() {
  if (!dashboardGrid) {
    return;
  }

  fetch("../backend/api/dashboard.php", { credentials: "include" })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        renderDashboard(data.data);
      }
    })
    .catch(() => {});
}

roleCards.forEach((card) => {
  card.addEventListener("click", () => {
    const role = card.dataset.role;

    roleCards.forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");

    if (roleInput) {
      roleInput.value = role;
    }

    if (registerRoleInput) {
      registerRoleInput.value = role;
    }

    if (loginTitle) {
      loginTitle.textContent = `Connexion ${card.querySelector("span").textContent.toLowerCase()}`;
    }
  });
});

applyAuthRole();

if (currentSessionCard) {
  fetch("../backend/auth/me.php", { credentials: "include" })
    .then((response) => response.json())
    .then((data) => showCurrentSession(data.user))
    .catch(() => {});
}

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
      window.location.href = roleRedirects[data.user.role] || "compte-voyageur.html";
    } catch (error) {
      setFormMessage("Le serveur PHP ne répond pas.", "error");
      updateLoggedUser(null);
    }
  });
}

logoutButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    await fetch("../backend/auth/logout.php", { credentials: "include" });
    setFormMessage("Vous êtes déconnecté.", "success");
    updateLoggedUser(null);

    if (currentSessionCard) {
      currentSessionCard.classList.add("is-hidden");
    }

    window.location.href = "compte.html";
  });
});

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setTypedMessage(registerMessage, "Création du compte...");

    try {
      const response = await fetch(registerForm.action, {
        method: "POST",
        body: new FormData(registerForm),
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Inscription impossible.");
      }

      setTypedMessage(registerMessage, `${data.message} Vous pouvez vous connecter.`, "success");
      registerForm.reset();
    } catch (error) {
      setTypedMessage(registerMessage, error.message, "error");
    }
  });
}

const destinationsGrid = document.querySelector("[data-destinations-grid]");
const featuredDestination = document.querySelector("[data-featured-destination]");
const destinationsCount = document.querySelector("[data-destinations-count]");
const destinationSearchForm = document.querySelector("[data-destination-search]");
const destinationSearchInput = document.querySelector("[data-destination-search-input]");
const destinationFilterInputs = document.querySelectorAll("[data-destination-filter]");
const destinationSort = document.querySelector("[data-destination-sort]");
const destinationPagination = document.querySelector("[data-destinations-pagination]");
const resetDestinationFilters = document.querySelector("[data-reset-destination-filters]");

const destinationPhotos = {
  "maldives.jpg": "https://images.unsplash.com/photo-1769389352398-f7b694034eb5?auto=format&fit=crop&w=1200&q=80",
  "kyoto.jpg": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
  "santorini.jpg": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=80",
  "marrakech.jpg": "https://images.unsplash.com/photo-1750859464437-b66433efd869?auto=format&fit=crop&w=900&q=80",
  "dubai.jpg": "https://commons.wikimedia.org/wiki/Special:FilePath/Skyline-Dubai-2010.jpg",
  "bahamas.jpg": "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=900&q=80",
  "capri.jpg": "https://commons.wikimedia.org/wiki/Special:FilePath/Capri%20Faraglioni%20with%20boat.jpg",
  "st-tropez.jpg": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "monaco.jpg": "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=900&q=80",
};

const destinationTypes = {
  Maldives: "Plage",
  Kyoto: "Ville",
  Santorini: "Plage",
  Marrakech: "Ville",
  Dubai: "Ville",
  Bahamas: "Plage",
  Capri: "Plage",
  "St Tropez": "Plage",
  Monaco: "Ville",
};

const destinationGalleryPhotos = {
  Maldives: [
    "https://images.unsplash.com/photo-1769389352398-f7b694034eb5?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=900&q=80",
  ],
  Kyoto: [
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=900&q=80",
  ],
  Santorini: [
    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?auto=format&fit=crop&w=900&q=80",
  ],
  Marrakech: [
    "https://images.unsplash.com/photo-1750859464437-b66433efd869?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1548018560-c7196548e84d?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=900&q=80",
  ],
  Dubai: [
    "https://commons.wikimedia.org/wiki/Special:FilePath/Skyline-Dubai-2010.jpg",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Burj%20Khalifa.jpg",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Dubai%20Marina%20Skyline.jpg",
  ],
  Bahamas: [
    "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80",
  ],
  Capri: [
    "https://commons.wikimedia.org/wiki/Special:FilePath/Capri%20Faraglioni%20with%20boat.jpg",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Marina%20Grande%20Capri.jpg",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Capri%20view%20from%20Anacapri.jpg",
  ],
  "St Tropez": [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Tropez%20port.jpg",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Saint-Tropez%20France.jpg",
  ],
  Monaco: [
    "https://commons.wikimedia.org/wiki/Special:FilePath/Monaco%20Monte%20Carlo.jpg",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Port%20Hercule%20Monaco.jpg",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Monaco%20Casino.jpg",
  ],
};

let allDestinations = [];
let destinationCurrentPage = 1;
const destinationsPerPage = 4;

function formatPrice(value) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getDestinationPhoto(destination) {
  return destinationPhotos[destination.image] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80";
}

function getTripBuilderParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    reservationId: params.get("reservation_id"),
    destinationId: params.get("destination_id"),
  };
}

function getNextTripStep(type, reservationId, destinationId) {
  const query = `reservation_id=${encodeURIComponent(reservationId)}&destination_id=${encodeURIComponent(destinationId)}`;

  if (type === "transport") {
    return `hebergements.html?${query}`;
  }

  if (type === "hebergement") {
    return `activites.html?${query}`;
  }

  return "panier.html";
}

function getDestinationType(destination) {
  return destinationTypes[destination.nom_destination] || "Ville";
}

function getDestinationGallery(destination) {
  return destinationGalleryPhotos[destination.nom_destination] || [
    getDestinationPhoto(destination),
    getDestinationPhoto(destination),
    getDestinationPhoto(destination),
  ];
}

function renderFeaturedDestination(destination) {
  if (!featuredDestination || !destination) {
    return;
  }

  featuredDestination.innerHTML = `
    <img class="featured-photo" src="${getDestinationPhoto(destination)}" alt="${destination.nom_destination}, ${destination.pays}">
    <div class="featured-content">
      <span class="stay-tag">Coup de coeur</span>
      <h3>${escapeHTML(destination.nom_destination)}, ${escapeHTML(destination.pays)}</h3>
      <p>${escapeHTML(destination.description)}</p>
      <div class="feature-details">
        <span>${escapeHTML(destination.continent)}</span>
        <span>Voyage premium</span>
        <span>A partir de ${formatPrice(destination.budget_min)} EUR</span>
      </div>
      <a class="btn-secondary" href="destination-detail.html?id=${encodeURIComponent(destination.id_destination)}">Voir la destination</a>
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
        <div class="rating">Destination ${escapeHTML(destination.continent)}</div>
        <h3>${escapeHTML(destination.nom_destination)}, ${escapeHTML(destination.pays)}</h3>
        <p>${escapeHTML(destination.description)}</p>
        <div class="card-meta">
          <span>A partir de</span>
          <span>${formatPrice(destination.budget_min)} EUR</span>
        </div>
        <a href="destination-detail.html?id=${encodeURIComponent(destination.id_destination)}">Voir la destination</a>
      </div>
    </article>
  `).join("");
}

function getDestinationFilters() {
  const selectedContinents = [...document.querySelectorAll('input[name="continent"]:checked')].map((input) => input.value);
  const selectedTypes = [...document.querySelectorAll('input[name="type"]:checked')].map((input) => input.value);
  const selectedBudget = document.querySelector('input[name="budget"]:checked')?.value || "all";
  const search = destinationSearchInput?.value.trim().toLowerCase() || "";
  const sort = destinationSort?.value || "Recommandes";

  return {
    selectedContinents,
    selectedTypes,
    selectedBudget,
    search,
    sort,
  };
}

function matchesBudget(destination, selectedBudget) {
  const price = Number(destination.budget_min);

  if (selectedBudget === "under-2500") {
    return price < 2500;
  }

  if (selectedBudget === "2500-4000") {
    return price >= 2500 && price <= 4000;
  }

  if (selectedBudget === "over-4000") {
    return price > 4000;
  }

  return true;
}

function getFilteredDestinations() {
  const filters = getDestinationFilters();

  const filtered = allDestinations.filter((destination) => {
    const type = getDestinationType(destination);
    const searchText = `${destination.nom_destination} ${destination.pays} ${destination.continent} ${destination.description}`.toLowerCase();

    return filters.selectedContinents.includes(destination.continent)
      && filters.selectedTypes.includes(type)
      && matchesBudget(destination, filters.selectedBudget)
      && searchText.includes(filters.search);
  });

  if (filters.sort === "Prix croissant") {
    filtered.sort((a, b) => Number(a.budget_min) - Number(b.budget_min));
  } else if (filters.sort === "Prix decroissant") {
    filtered.sort((a, b) => Number(b.budget_min) - Number(a.budget_min));
  } else if (filters.sort === "Nom A-Z") {
    filtered.sort((a, b) => a.nom_destination.localeCompare(b.nom_destination, "fr"));
  }

  return filtered;
}

function renderDestinationPagination(totalPages) {
  if (!destinationPagination) {
    return;
  }

  if (totalPages <= 1) {
    destinationPagination.innerHTML = "";
    return;
  }

  const buttons = [];
  for (let page = 1; page <= totalPages; page++) {
    buttons.push(`<button type="button" class="${page === destinationCurrentPage ? "active" : ""}" data-destination-page="${page}">${page}</button>`);
  }

  buttons.push(`<button type="button" data-destination-page="${Math.min(destinationCurrentPage + 1, totalPages)}">Suivant</button>`);
  destinationPagination.innerHTML = buttons.join("");
}

function renderDestinationResults() {
  if (!destinationsGrid) {
    return;
  }

  const filtered = getFilteredDestinations();
  const totalPages = Math.max(1, Math.ceil(filtered.length / destinationsPerPage));

  if (destinationCurrentPage > totalPages) {
    destinationCurrentPage = totalPages;
  }

  const featured = filtered.find((destination) => destination.nom_destination === "Maldives") || filtered[0];
  const pageItems = filtered
    .filter((destination) => !featured || destination.id_destination !== featured.id_destination)
    .slice((destinationCurrentPage - 1) * destinationsPerPage, destinationCurrentPage * destinationsPerPage);

  if (destinationsCount) {
    destinationsCount.textContent = `${filtered.length} destination${filtered.length > 1 ? "s" : ""} trouvée${filtered.length > 1 ? "s" : ""}`;
  }

  if (!featured) {
    if (featuredDestination) {
      featuredDestination.innerHTML = `
        <div class="featured-content">
          <span class="stay-tag">Aucun résultat</span>
          <h3>Aucune destination ne correspond aux filtres</h3>
          <p>Essayez une autre recherche ou réinitialisez les filtres.</p>
        </div>
      `;
    }
    destinationsGrid.innerHTML = "";
    renderDestinationPagination(0);
    return;
  }

  renderFeaturedDestination(featured);
  renderDestinationCards(pageItems);
  renderDestinationPagination(totalPages);
}

if (destinationsGrid) {
  fetch("../backend/api/destinations.php")
    .then((response) => response.json())
    .then((data) => {
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error("Destinations indisponibles");
      }

      allDestinations = data.data;
      renderDestinationResults();
    })
    .catch(() => {
      if (destinationsCount) {
        destinationsCount.textContent = "Destinations indisponibles";
      }
    });
}

if (destinationSearchForm) {
  destinationSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    destinationCurrentPage = 1;
    renderDestinationResults();
  });
}

destinationFilterInputs.forEach((input) => {
  input.addEventListener("change", () => {
    destinationCurrentPage = 1;
    renderDestinationResults();
  });
});

if (destinationSort) {
  destinationSort.addEventListener("change", () => {
    destinationCurrentPage = 1;
    renderDestinationResults();
  });
}

if (destinationPagination) {
  destinationPagination.addEventListener("click", (event) => {
    const button = event.target.closest("[data-destination-page]");
    if (!button) {
      return;
    }

    destinationCurrentPage = Number(button.dataset.destinationPage);
    renderDestinationResults();
  });
}

if (resetDestinationFilters) {
  resetDestinationFilters.addEventListener("click", () => {
    if (destinationSearchInput) {
      destinationSearchInput.value = "";
    }

    destinationFilterInputs.forEach((input) => {
      if (input.type === "checkbox") {
        input.checked = true;
      }
    });

    const allBudget = document.querySelector('input[name="budget"][value="all"]');
    if (allBudget) {
      allBudget.checked = true;
    }

    if (destinationSort) {
      destinationSort.value = "Recommandes";
    }

    destinationCurrentPage = 1;
    renderDestinationResults();
  });
}

const lodgingPhotos = [
  "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1750859464437-b66433efd869?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80",
];

const lodgingPhotosByType = {
  riad: "https://images.unsplash.com/photo-1750859464437-b66433efd869?auto=format&fit=crop&w=900&q=80",
  villa: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=900&q=80",
  resort: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80",
  hotel: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80",
  palace: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
  ryokan: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=80",
  camp: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=900&q=80",
  lodge: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80",
};

const activityPhotosByCategory = {
  aventure: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
  bien: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=900&q=80",
  croisiere: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80",
  culture: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=80",
  gastronomie: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  nature: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
  plage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  ville: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
};

const activityPhotosByName = {
  "diner plage bahamas": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  "diner plage prive": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  "diner prive sur la plage": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  "diner sous les etoiles": "https://images.unsplash.com/photo-1519671282429-b44660ead0a7?auto=format&fit=crop&w=900&q=80",
  "diner terrasse privee": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
  "diner port st tropez": "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80",
  "diner anacapri": "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80",
  "diner desert agafay": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=900&q=80",
  "safari desert prive": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=900&q=80",
  "visite medina guidee": "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=900&q=80",
  "diner kaiseki": "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=900&q=80",
  "visite temples kyoto": "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=80",
  "ceremonie du the privee": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80",
  "tour port hercule": "https://commons.wikimedia.org/wiki/Special:FilePath/Port%20Hercule%20Monaco.jpg",
  "soiree casino privee": "https://commons.wikimedia.org/wiki/Special:FilePath/Monte-Carlo%20Casino.jpg",
  "diner etoile monaco": "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80",
};

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getLodgingPhoto(hebergement, fallbackIndex = 0) {
  const text = `${hebergement.type_hebergement} ${hebergement.nom_hebergement} ${hebergement.description}`.toLowerCase();
  const key = Object.keys(lodgingPhotosByType).find((type) => text.includes(type));
  return key ? lodgingPhotosByType[key] : lodgingPhotos[fallbackIndex % lodgingPhotos.length];
}

function getActivityPhoto(activite) {
  const text = normalizeText(`${activite.categorie} ${activite.nom_activite} ${activite.description}`);
  const name = normalizeText(activite.nom_activite);
  const nameKey = Object.keys(activityPhotosByName).find((activityName) => name.includes(activityName));
  if (nameKey) {
    return activityPhotosByName[nameKey];
  }

  const key = Object.keys(activityPhotosByCategory).find((category) => text.includes(category));
  return key ? activityPhotosByCategory[key] : activityPhotosByCategory.culture;
}

function renderHebergements(hebergements) {
  const grid = document.querySelector("[data-hebergements-grid]");
  const featured = document.querySelector("[data-featured-hebergement]");
  const count = document.querySelector("[data-hebergements-count]");
  const tripBuilder = getTripBuilderParams();

  if (!grid) {
    return;
  }

  if (tripBuilder.destinationId) {
    hebergements = hebergements.filter((hebergement) => String(hebergement.id_destination) === String(tripBuilder.destinationId));
  }

  if (count) {
    count.textContent = tripBuilder.destinationId
      ? `${hebergements.length} hébergements pour votre séjour`
      : `${hebergements.length} hébergements disponibles`;
  }

  const first = hebergements[0];
  if (featured && first) {
    featured.innerHTML = `
      <img class="featured-photo" src="${getLodgingPhoto(first)}" alt="${escapeHTML(first.nom_hebergement)}">
      <div class="featured-content">
        <span class="stay-tag">${first.disponibilite ? "Disponible" : "Indisponible"}</span>
        <h3>${escapeHTML(first.nom_hebergement)}</h3>
        <p>${escapeHTML(first.description)}</p>
        <div class="feature-details">
          <span>${escapeHTML(first.nom_destination)}</span>
          <span>${escapeHTML(first.capacite)} voyageurs</span>
          <span>${formatPrice(first.prix_nuit)} EUR / nuit</span>
        </div>
        ${tripBuilder.reservationId ? `
          <button class="btn-secondary" type="button" data-add-itinerary-item="hebergement" data-item-id="${escapeHTML(first.id_hebergement)}">
            Ajouter cet hébergement
          </button>
        ` : `<a class="btn-secondary" href="destination-detail.html?id=${encodeURIComponent(first.id_destination)}">Voir l'hébergement</a>`}
      </div>
    `;
  }

  grid.innerHTML = hebergements.slice(1).map((hebergement, index) => `
    <article class="catalog-card">
      <img class="catalog-photo" src="${getLodgingPhoto(hebergement, index + 1)}" alt="${escapeHTML(hebergement.nom_hebergement)}">
      <div class="catalog-card-body">
        <div class="rating">${escapeHTML(hebergement.nombre_etoiles || 5)} étoiles</div>
        <h3>${escapeHTML(hebergement.nom_hebergement)}</h3>
        <p>${escapeHTML(hebergement.description)}</p>
        <div class="card-meta">
          <span>${escapeHTML(hebergement.nom_destination)}</span>
          <span>${formatPrice(hebergement.prix_nuit)} EUR/nuit</span>
        </div>
        ${tripBuilder.reservationId ? `
          <a href="#" data-add-itinerary-item="hebergement" data-item-id="${escapeHTML(hebergement.id_hebergement)}">Ajouter cet hébergement</a>
        ` : `<a href="destination-detail.html?id=${encodeURIComponent(hebergement.id_destination)}">Voir la destination</a>`}
      </div>
    </article>
  `).join("");
}

function renderActivites(activites) {
  const grid = document.querySelector("[data-activites-grid]");
  const count = document.querySelector("[data-activites-count]");
  const tripBuilder = getTripBuilderParams();

  if (!grid) {
    return;
  }

  if (tripBuilder.destinationId) {
    activites = activites.filter((activite) => String(activite.id_destination) === String(tripBuilder.destinationId));
  }

  if (count) {
    count.textContent = tripBuilder.destinationId
      ? `${activites.length} activités pour votre séjour`
      : `${activites.length} activités disponibles`;
  }

  grid.innerHTML = activites.map((activite, index) => `
    <article class="experience-card ${index === 0 ? "large-experience" : ""}">
      <img src="${getActivityPhoto(activite)}" alt="${escapeHTML(activite.nom_activite)}">
      <div>
        <span class="stay-tag">${escapeHTML(activite.categorie)}</span>
        <h3>${escapeHTML(activite.nom_activite)}</h3>
        <p>${escapeHTML(activite.description)}</p>
        ${index === 0 ? `
          <div class="feature-details">
            <span>${escapeHTML(activite.duree)}</span>
            <span>${escapeHTML(activite.places_disponibles)} places</span>
            <span>${formatPrice(activite.prix)} EUR</span>
          </div>
          ${tripBuilder.reservationId ? `
            <button class="btn-secondary" type="button" data-add-itinerary-item="activite" data-item-id="${escapeHTML(activite.id_activite)}">
              Ajouter cette activité
            </button>
          ` : `<a class="btn-secondary" href="destination-detail.html?id=${encodeURIComponent(activite.id_destination || 1)}">Voir la destination</a>`}
        ` : `<strong>${formatPrice(activite.prix)} EUR</strong>`}
        ${index !== 0 && tripBuilder.reservationId ? `
          <button class="btn-secondary" type="button" data-add-itinerary-item="activite" data-item-id="${escapeHTML(activite.id_activite)}">
            Ajouter
          </button>
        ` : ""}
      </div>
    </article>
  `).join("");
}

function formatTransportType(type) {
  return String(type || "").replaceAll("_", " ");
}

function renderTransports(transports) {
  const list = document.querySelector("[data-transports-list]");
  const count = document.querySelector("[data-transports-count]");
  const tripBuilder = getTripBuilderParams();

  if (!list) {
    return;
  }

  if (tripBuilder.destinationId) {
    transports = transports.filter((transport) => String(transport.id_destination) === String(tripBuilder.destinationId));
  }

  if (count) {
    count.textContent = tripBuilder.destinationId
      ? `${transports.length} trajets pour votre séjour`
      : `${transports.length} trajets disponibles`;
  }

  list.innerHTML = transports.map((transport, index) => `
    <article class="transport-card ${index === 0 ? "recommended" : ""}">
      <div class="transport-main">
        <span class="stay-tag">${index === 0 ? "Recommandé" : escapeHTML(transport.compagnie)}</span>
        <h3>${escapeHTML(transport.ville_depart)} → ${escapeHTML(transport.ville_arrivee)}</h3>
        <p>${escapeHTML(transport.compagnie)} vers ${escapeHTML(transport.nom_destination)}.</p>
        <div class="route-line">
          <span>${escapeHTML(transport.ville_depart)}</span>
          <strong>${escapeHTML(transport.places_disponibles)} places</strong>
          <span>${escapeHTML(transport.ville_arrivee)}</span>
        </div>
      </div>
      <div class="transport-side">
        <span class="transport-type">${escapeHTML(formatTransportType(transport.type_transport))} · ${escapeHTML(transport.classe)}</span>
        <strong>${formatPrice(transport.prix)} EUR</strong>
        ${tripBuilder.reservationId ? `
          <button class="btn-primary" type="button" data-add-itinerary-item="transport" data-item-id="${escapeHTML(transport.id_transport)}">
            Ajouter ce transport
          </button>
        ` : `<button class="${index === 0 ? "btn-primary" : "btn-secondary"}" type="button">Voir details</button>`}
      </div>
    </article>
  `).join("");
}

function loadApiList(selector, url, renderCallback, countSelector, errorText) {
  if (!document.querySelector(selector)) {
    return;
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error(errorText);
      }
      renderCallback(data.data);
    })
    .catch(() => {
      const count = document.querySelector(countSelector);
      if (count) {
        count.textContent = errorText;
      }
    });
}

loadApiList("[data-hebergements-grid]", "../backend/api/hebergements.php", renderHebergements, "[data-hebergements-count]", "Hébergements indisponibles");
loadApiList("[data-activites-grid]", "../backend/api/activites.php", renderActivites, "[data-activites-count]", "Activités indisponibles");
loadApiList("[data-transports-list]", "../backend/api/transports.php", renderTransports, "[data-transports-count]", "Trajets indisponibles");

const detailTitle = document.querySelector("[data-detail-title]");
const bookingForm = document.querySelector("[data-booking-form]");
const bookingMessage = document.querySelector("[data-booking-message]");

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function renderDestinationDetail(data) {
  const destination = data.destination;
  const options = [
    ...data.hebergements.map((item) => ({ type: "Hébergement", title: item.nom_hebergement, text: `${item.type_hebergement || "Premium"} · ${formatPrice(item.prix_nuit)} EUR/nuit` })),
    ...data.activites.map((item) => ({ type: "Activité", title: item.nom_activite, text: `${item.categorie} · ${formatPrice(item.prix)} EUR` })),
    ...data.transports.map((item) => ({ type: "Transport", title: `${item.ville_depart} → ${item.ville_arrivee}`, text: `${item.compagnie} · ${formatPrice(item.prix)} EUR` })),
  ].slice(0, 3);

  document.title = `${destination.nom_destination} - VoyageVista`;
  setText("[data-detail-breadcrumb]", `Destinations / ${destination.continent}`);
  setText("[data-detail-title]", `${destination.nom_destination}, ${destination.pays}`);
  setText("[data-detail-description]", destination.description);
  setText("[data-detail-overview-title]", `Séjour premium à ${destination.nom_destination}`);
  setText("[data-detail-overview]", destination.description);
  setText("[data-booking-title]", `${destination.nom_destination} premium`);
  setText("[data-booking-price]", `${formatPrice(destination.budget_min)} EUR`);

  const destinationInput = document.querySelector("[data-booking-destination]");
  if (destinationInput) {
    destinationInput.value = destination.id_destination;
  }

  const badges = document.querySelector("[data-detail-badges]");
  if (badges) {
    badges.innerHTML = `
      <span>${escapeHTML(destination.continent)}</span>
      <span>Voyage premium</span>
      <span>A partir de ${formatPrice(destination.budget_min)} EUR</span>
    `;
  }

  const gallery = document.querySelector("[data-detail-gallery]");
  const detailHero = document.querySelector("[data-detail-hero]");
  const photos = getDestinationGallery(destination);

  if (detailHero) {
    detailHero.style.background = `linear-gradient(90deg, rgba(12, 31, 27, 0.84), rgba(12, 31, 27, 0.46), rgba(12, 31, 27, 0.14)), url("${photos[0]}") center/cover`;
  }

  if (gallery) {
    gallery.innerHTML = `
      <img class="gallery-large" src="${photos[0]}" alt="${escapeHTML(destination.nom_destination)}">
      <img src="${photos[1]}" alt="${escapeHTML(destination.nom_destination)}">
      <img src="${photos[2]}" alt="${escapeHTML(destination.pays)}">
    `;
  }

  const optionsGrid = document.querySelector("[data-detail-options]");
  if (optionsGrid) {
    optionsGrid.innerHTML = options.map((option) => `
      <article class="option-card">
        <span>${escapeHTML(option.type)}</span>
        <h3>${escapeHTML(option.title)}</h3>
        <p>${escapeHTML(option.text)}</p>
      </article>
    `).join("");
  }
}

if (detailTitle) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "1";

  fetch(`../backend/api/destination-detail.php?id=${encodeURIComponent(id)}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        throw new Error("Destination introuvable");
      }
      renderDestinationDetail(data.data);
    })
    .catch(() => {
      setText("[data-detail-title]", "Destination indisponible");
    });
}

if (bookingForm) {
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (bookingMessage) {
      bookingMessage.textContent = "Ajout en cours...";
      bookingMessage.dataset.type = "info";
    }

    try {
      const response = await fetch(bookingForm.action, {
        method: "POST",
        body: new FormData(bookingForm),
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Connexion requise.");
      }

      if (bookingMessage) {
        bookingMessage.innerHTML = `
          ${escapeHTML(data.message)} Référence ${escapeHTML(data.reference)}. Choisissez maintenant un transport.
        `;
        bookingMessage.dataset.type = "success";
      }
      window.setTimeout(() => {
        window.location.href = `transports.html?reservation_id=${encodeURIComponent(data.reservation_id)}&destination_id=${encodeURIComponent(data.destination_id)}`;
      }, 900);
    } catch (error) {
      if (bookingMessage) {
        bookingMessage.textContent = error.message;
        bookingMessage.dataset.type = "error";
      }
    }
  });
}

document.addEventListener("click", async (event) => {
  const trigger = event.target.closest("[data-add-itinerary-item]");
  if (!trigger) {
    return;
  }

  event.preventDefault();
  const tripBuilder = getTripBuilderParams();

  if (!tripBuilder.reservationId || !tripBuilder.destinationId) {
    return;
  }

  const formData = new FormData();
  formData.append("id_reservation", tripBuilder.reservationId);
  formData.append("type", trigger.dataset.addItineraryItem);
  formData.append("id_item", trigger.dataset.itemId);

  trigger.textContent = "Ajout en cours...";
  trigger.setAttribute("disabled", "disabled");

  try {
    const response = await fetch("../backend/api/add-itinerary-item.php", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Ajout impossible.");
    }

    trigger.textContent = "Ajouté";
    window.location.href = getNextTripStep(trigger.dataset.addItineraryItem, tripBuilder.reservationId, tripBuilder.destinationId);
  } catch (error) {
    trigger.textContent = error.message;
    trigger.removeAttribute("disabled");
  }
});

const cartList = document.querySelector("[data-cart-list]");
const cartCount = document.querySelector("[data-cart-count]");
const cartMessage = document.querySelector("[data-cart-message]");

function setTypedMessage(element, message, type = "info") {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.dataset.type = type;
}

function renderCart(items) {
  if (!cartList) {
    return;
  }

  if (cartCount) {
    cartCount.textContent = `${items.length} réservation${items.length > 1 ? "s" : ""}`;
  }

  if (items.length === 0) {
    cartList.innerHTML = `
      <article class="dashboard-card">
        <span>Panier vide</span>
        <h3>Aucun séjour en attente</h3>
        <p>Ajoutez une destination depuis le catalogue pour commencer.</p>
      </article>
    `;
    return;
  }

  cartList.innerHTML = items.map((item) => `
    <article class="cart-item">
      <div>
        <span class="stay-tag">${escapeHTML(item.statut_reservation)}</span>
        <h3>${escapeHTML(item.titre)}</h3>
        <p>${escapeHTML(item.date_debut)} au ${escapeHTML(item.date_fin)} · Référence ${escapeHTML(item.reference_reservation)}</p>
      </div>
      <div class="cart-actions">
        <strong>${formatPrice(item.montant_total)} EUR</strong>
        ${item.statut_reservation === "en_attente" ? `
          <a class="btn-primary" href="paiement.html?id=${encodeURIComponent(item.id_reservation)}">Payer</a>
          <button class="btn-secondary" type="button" data-delete-reservation="${escapeHTML(item.id_reservation)}">Retirer</button>
        ` : `<span class="transport-type">Confirmée</span>`}
      </div>
    </article>
  `).join("");
}

async function loadCart() {
  if (!cartList) {
    return;
  }

  try {
    const response = await fetch("../backend/api/panier.php", { credentials: "include" });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Connexion requise.");
    }
    renderCart(data.data);
  } catch (error) {
    setTypedMessage(cartMessage, error.message, "error");
  }
}

if (cartList) {
  loadCart();
  cartList.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-reservation]");
    if (!button) {
      return;
    }

    const formData = new FormData();
    formData.append("id_reservation", button.dataset.deleteReservation);

    try {
      const response = await fetch("../backend/api/delete-reservation.php", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Suppression impossible.");
      }
      setTypedMessage(cartMessage, data.message, "success");
      loadCart();
    } catch (error) {
      setTypedMessage(cartMessage, error.message, "error");
    }
  });
}

const paymentForm = document.querySelector("[data-payment-form]");
const paymentReservation = document.querySelector("[data-payment-reservation]");
const paymentMessage = document.querySelector("[data-payment-message]");
const paymentSummary = document.querySelector("[data-payment-summary]");

if (paymentForm) {
  const params = new URLSearchParams(window.location.search);
  const reservationId = params.get("id");
  if (paymentReservation) {
    paymentReservation.value = reservationId || "";
  }
  if (paymentSummary) {
    paymentSummary.textContent = reservationId ? `Réservation #${reservationId}` : "Réservation non sélectionnée";
  }

  paymentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setTypedMessage(paymentMessage, "Paiement en cours...");

    try {
      const response = await fetch(paymentForm.action, {
        method: "POST",
        body: new FormData(paymentForm),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Paiement impossible.");
      }
      setTypedMessage(paymentMessage, data.message, "success");
      window.location.href = `confirmation.html?id=${encodeURIComponent(data.reservation_id)}`;
    } catch (error) {
      setTypedMessage(paymentMessage, error.message, "error");
    }
  });
}

const providerOffers = document.querySelector("[data-provider-offers]");
const providerCount = document.querySelector("[data-provider-count]");
const providerForm = document.querySelector("[data-provider-form]");
const providerMessage = document.querySelector("[data-provider-message]");

async function loadProviderOffers() {
  if (!providerOffers) {
    return;
  }

  try {
    const response = await fetch("../backend/api/prestataire-offres.php", { credentials: "include" });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Connexion prestataire requise.");
    }

    if (providerCount) {
      providerCount.textContent = `${data.data.length} offres publiées`;
    }

    providerOffers.innerHTML = data.data.map((offer) => `
      <article class="dashboard-card">
        <span>${escapeHTML(offer.type)}</span>
        <h3>${escapeHTML(offer.titre)}</h3>
        <p>${escapeHTML(offer.nom_destination)} · ${formatPrice(offer.prix)} EUR</p>
      </article>
    `).join("");
  } catch (error) {
    setTypedMessage(providerMessage, error.message, "error");
  }
}

if (providerForm) {
  loadProviderOffers();
  providerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(providerForm.action, {
        method: "POST",
        body: new FormData(providerForm),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Publication impossible.");
      }
      setTypedMessage(providerMessage, data.message, "success");
      providerForm.reset();
      loadProviderOffers();
    } catch (error) {
      setTypedMessage(providerMessage, error.message, "error");
    }
  });
}

const adminCounts = document.querySelector("[data-admin-counts]");
const adminUsers = document.querySelector("[data-admin-users]");
const adminMessage = document.querySelector("[data-admin-message]");
const confirmationCard = document.querySelector("[data-confirmation-card]");

function renderAdmin(data) {
  if (!adminCounts || !adminUsers) {
    return;
  }

  adminCounts.innerHTML = Object.entries(data.counts).map(([key, value]) => `
    <article class="dashboard-card">
      <span>${escapeHTML(key)}</span>
      <h3>${formatPrice(value)}</h3>
      <p>Éléments enregistrés</p>
    </article>
  `).join("");

  adminUsers.innerHTML = data.users.map((user) => `
    <article>
      <h3>${escapeHTML(user.prenom)} ${escapeHTML(user.nom)}</h3>
      <p>${escapeHTML(user.email)} · ${escapeHTML(user.role)} · ${escapeHTML(user.statut_compte)}</p>
      <button class="btn-secondary" type="button" data-user-status="${escapeHTML(user.id_utilisateur)}" data-next-status="${user.statut_compte === "actif" ? "bloque" : "actif"}">
        ${user.statut_compte === "actif" ? "Bloquer" : "Activer"}
      </button>
    </article>
  `).join("");
}

async function loadAdmin() {
  if (!adminCounts) {
    return;
  }

  try {
    const response = await fetch("../backend/api/admin-summary.php", { credentials: "include" });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Connexion admin requise.");
    }
    renderAdmin(data.data);
  } catch (error) {
    setTypedMessage(adminMessage, error.message, "error");
  }
}

if (adminCounts) {
  loadAdmin();
  adminUsers.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-user-status]");
    if (!button) {
      return;
    }

    const formData = new FormData();
    formData.append("id_utilisateur", button.dataset.userStatus);
    formData.append("statut_compte", button.dataset.nextStatus);

    try {
      const response = await fetch("../backend/api/admin-update-user.php", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Modification impossible.");
      }
      setTypedMessage(adminMessage, data.message, "success");
      loadAdmin();
    } catch (error) {
      setTypedMessage(adminMessage, error.message, "error");
    }
  });
}

if (confirmationCard) {
  const params = new URLSearchParams(window.location.search);
  const reservationId = params.get("id");

  fetch(`../backend/api/reservation.php?id=${encodeURIComponent(reservationId || "")}`, { credentials: "include" })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        throw new Error(data.message || "Confirmation indisponible.");
      }

      const reservation = data.data;
      confirmationCard.innerHTML = `
        <span class="stay-tag">${escapeHTML(reservation.statut_reservation)}</span>
        <h2>${escapeHTML(reservation.titre)}</h2>
        <p>${escapeHTML(reservation.date_debut)} au ${escapeHTML(reservation.date_fin)}</p>
        <div class="feature-details">
          <span>Référence ${escapeHTML(reservation.reference_reservation)}</span>
          <span>${formatPrice(reservation.montant_total)} EUR</span>
        </div>
        <a class="btn-primary" href="compte.html">Voir mon compte</a>
      `;
    })
    .catch((error) => {
      confirmationCard.innerHTML = `
        <span class="stay-tag">Erreur</span>
        <h2>${escapeHTML(error.message)}</h2>
        <a class="btn-secondary" href="panier.html">Retour au panier</a>
      `;
    });
}
