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
const dashboardGrid = document.querySelector(".dashboard-grid");

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

const lodgingPhotos = [
  "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1750859464437-b66433efd869?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80",
];

const activityPhotos = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=900&q=80",
];

function renderHebergements(hebergements) {
  const grid = document.querySelector("[data-hebergements-grid]");
  const featured = document.querySelector("[data-featured-hebergement]");
  const count = document.querySelector("[data-hebergements-count]");

  if (!grid) {
    return;
  }

  if (count) {
    count.textContent = `${hebergements.length} hébergements disponibles`;
  }

  const first = hebergements[0];
  if (featured && first) {
    featured.innerHTML = `
      <img class="featured-photo" src="${lodgingPhotos[0]}" alt="${escapeHTML(first.nom_hebergement)}">
      <div class="featured-content">
        <span class="stay-tag">${first.disponibilite ? "Disponible" : "Indisponible"}</span>
        <h3>${escapeHTML(first.nom_hebergement)}</h3>
        <p>${escapeHTML(first.description)}</p>
        <div class="feature-details">
          <span>${escapeHTML(first.nom_destination)}</span>
          <span>${escapeHTML(first.capacite)} voyageurs</span>
          <span>${formatPrice(first.prix_nuit)} EUR / nuit</span>
        </div>
        <a class="btn-secondary" href="destination-detail.html">Voir l'hébergement</a>
      </div>
    `;
  }

  grid.innerHTML = hebergements.slice(1).map((hebergement, index) => `
    <article class="catalog-card">
      <img class="catalog-photo" src="${lodgingPhotos[(index + 1) % lodgingPhotos.length]}" alt="${escapeHTML(hebergement.nom_hebergement)}">
      <div class="catalog-card-body">
        <div class="rating">${escapeHTML(hebergement.nombre_etoiles || 5)} étoiles</div>
        <h3>${escapeHTML(hebergement.nom_hebergement)}</h3>
        <p>${escapeHTML(hebergement.description)}</p>
        <div class="card-meta">
          <span>${escapeHTML(hebergement.nom_destination)}</span>
          <span>${formatPrice(hebergement.prix_nuit)} EUR/nuit</span>
        </div>
        <a href="destination-detail.html">Ajouter au séjour</a>
      </div>
    </article>
  `).join("");
}

function renderActivites(activites) {
  const grid = document.querySelector("[data-activites-grid]");
  const count = document.querySelector("[data-activites-count]");

  if (!grid) {
    return;
  }

  if (count) {
    count.textContent = `${activites.length} activités disponibles`;
  }

  grid.innerHTML = activites.map((activite, index) => `
    <article class="experience-card ${index === 0 ? "large-experience" : ""}">
      <img src="${activityPhotos[index % activityPhotos.length]}" alt="${escapeHTML(activite.nom_activite)}">
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
          <a class="btn-secondary" href="destination-detail.html?id=${encodeURIComponent(activite.id_destination || 1)}">Ajouter au séjour</a>
        ` : `<strong>${formatPrice(activite.prix)} EUR</strong>`}
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

  if (!list) {
    return;
  }

  if (count) {
    count.textContent = `${transports.length} trajets disponibles`;
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
        <button class="${index === 0 ? "btn-primary" : "btn-secondary"}" type="button">Ajouter au séjour</button>
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
  if (gallery) {
    const photo = getDestinationPhoto(destination);
    gallery.innerHTML = `
      <img class="gallery-large" src="${photo}" alt="${escapeHTML(destination.nom_destination)}">
      <img src="${photo}" alt="${escapeHTML(destination.nom_destination)}">
      <img src="${photo}" alt="${escapeHTML(destination.pays)}">
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
        bookingMessage.textContent = `${data.message} Référence ${data.reference}`;
        bookingMessage.dataset.type = "success";
      }
    } catch (error) {
      if (bookingMessage) {
        bookingMessage.textContent = error.message;
        bookingMessage.dataset.type = "error";
      }
    }
  });
}
