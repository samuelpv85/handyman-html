/**
 * Sistema de Reseñas para Handyman
 * Este script maneja la funcionalidad del sistema de reseñas, incluyendo:
 * - Carrusel de reseñas con navegación
 * - Filtrado por tipo de servicio
 * - Estadísticas de satisfacción
 * - Modal para añadir nuevas reseñas
 */

document.addEventListener("DOMContentLoaded", function () {
  // Cargar las reseñas desde el almacenamiento local o usar las iniciales
  let reviewsData = window.ReviewsData.loadReviews();
  const SERVICES = window.ReviewsData.SERVICES;
  const AVATARS = window.ReviewsData.AVATARS;

  // Variables para el carrusel
  let currentIndex = 0;
  let visibleReviews = 3; // Número de reseñas visibles a la vez
  let filteredReviews = [...reviewsData]; // Inicialmente mostramos todas las reseñas

  // Elementos del DOM
  const reviewsContainer = document.getElementById("reviewsContainer");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const carouselDots = document.getElementById("carouselDots");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const addReviewBtn = document.getElementById("addReviewBtn");
  const reviewModal = document.getElementById("reviewModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const reviewForm = document.getElementById("reviewForm");
  const ratingInputs = document.querySelectorAll('input[name="rating"]');
  const ratingText = document.querySelector(".rating-text");
  const statsContainer = document.querySelector(".satisfaction-stats");

  // Ajustar el número de reseñas visibles según el ancho de la pantalla
  function updateVisibleReviews() {
    if (window.innerWidth < 768) {
      visibleReviews = 1;
    } else if (window.innerWidth < 992) {
      visibleReviews = 2;
    } else {
      visibleReviews = 3;
    }
    renderReviews();
  }

  // Inicializar el carrusel
  function initCarousel() {
    updateVisibleReviews();
    window.addEventListener("resize", updateVisibleReviews);

    // Configurar botones de navegación
    prevBtn.addEventListener("click", showPreviousReviews);
    nextBtn.addEventListener("click", showNextReviews);

    // Configurar filtros
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", filterReviews);
    });

    // Configurar modal
    if (addReviewBtn) {
      addReviewBtn.addEventListener("click", openModal);
    } else {
      console.error("Botón de añadir reseña no encontrado");
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", closeModal);
    } else {
      console.error("Botón de cerrar modal no encontrado");
    }

    if (reviewModal) {
      reviewModal.addEventListener("click", function (e) {
        if (e.target === reviewModal) {
          closeModal();
        }
      });
    } else {
      console.error("Modal de reseñas no encontrado");
    }

    // Configurar formulario
    if (reviewForm) {
      reviewForm.addEventListener("submit", handleReviewSubmit);
    }

    // Configurar texto de calificación
    if (ratingInputs.length > 0 && ratingText) {
      ratingInputs.forEach((input) => {
        input.addEventListener("change", updateRatingText);
      });
    }

    // Inicializar estadísticas
    updateStatistics();
  }

  // Renderizar las reseñas en el carrusel
  function renderReviews() {
    if (!reviewsContainer) return;

    reviewsContainer.innerHTML = "";

    // Crear puntos de navegación
    updateCarouselDots();

    // Verificar límites del carrusel
    checkCarouselLimits();

    // Mostrar las reseñas visibles
    const endIndex = Math.min(
      currentIndex + visibleReviews,
      filteredReviews.length
    );
    for (let i = currentIndex; i < endIndex; i++) {
      const review = filteredReviews[i];
      const reviewCard = createReviewCard(review);
      reviewsContainer.appendChild(reviewCard);
    }
  }

  // Crear una tarjeta de reseña
  function createReviewCard(review) {
    const card = document.createElement("div");
    card.className = "review-card";

    // Determinar el avatar según el género
    const avatarSrc = review.gender ? AVATARS[review.gender] : AVATARS.man;

    // Crear las estrellas de calificación
    let starsHTML = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= review.rating) {
        starsHTML += '<i class="fas fa-star"></i>';
      } else {
        starsHTML += '<i class="far fa-star"></i>';
      }
    }

    // Crear el icono del servicio
    const serviceIcon = SERVICES[review.service]
      ? `<i class="fas fa-${SERVICES[review.service].icon}"></i>`
      : "";

    // Crear el badge de verificación
    const verifiedBadge = review.verified
      ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Verificado</span>'
      : "";

    card.innerHTML = `
      <div class="review-header">
        <div class="customer-info">
          <img src="${avatarSrc}" alt="${review.customerName}" class="customer-avatar">
          <div>
            <h4>${review.customerName}</h4>
            <div class="service-type">${serviceIcon} ${review.serviceLabel}</div>
          </div>
        </div>
        <div class="review-date">${review.date}</div>
      </div>
      <div class="review-body">
        <h3 class="review-title">${review.title}</h3>
        <div class="review-rating">${starsHTML}</div>
        <p class="review-content">${review.content}</p>
      </div>
      <div class="review-footer">
        ${verifiedBadge}
      </div>
    `;

    return card;
  }

  // Actualizar los puntos de navegación del carrusel
  function updateCarouselDots() {
    if (!carouselDots) return;

    carouselDots.innerHTML = "";
    const totalPages = Math.ceil(filteredReviews.length / visibleReviews);

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement("span");
      dot.className = "carousel-dot";
      if (i === Math.floor(currentIndex / visibleReviews)) {
        dot.classList.add("active");
      }
      dot.addEventListener("click", () => {
        currentIndex = i * visibleReviews;
        renderReviews();
      });
      carouselDots.appendChild(dot);
    }
  }

  // Verificar los límites del carrusel y actualizar los botones
  function checkCarouselLimits() {
    if (!prevBtn || !nextBtn) return;

    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex + visibleReviews >= filteredReviews.length;

    prevBtn.classList.toggle("disabled", prevBtn.disabled);
    nextBtn.classList.toggle("disabled", nextBtn.disabled);
  }

  // Mostrar las reseñas anteriores
  function showPreviousReviews() {
    if (currentIndex > 0) {
      currentIndex = Math.max(0, currentIndex - visibleReviews);
      renderReviews();
    }
  }

  // Mostrar las siguientes reseñas
  function showNextReviews() {
    if (currentIndex + visibleReviews < filteredReviews.length) {
      currentIndex = Math.min(
        filteredReviews.length - visibleReviews,
        currentIndex + visibleReviews
      );
      renderReviews();
    }
  }

  // Filtrar las reseñas por tipo de servicio
  function filterReviews(e) {
    const filterBtn = e.target.closest(".filter-btn");
    if (!filterBtn) return;

    // Actualizar botones activos
    filterBtns.forEach((btn) => btn.classList.remove("active"));
    filterBtn.classList.add("active");

    const filter = filterBtn.dataset.filter;

    // Filtrar las reseñas
    if (filter === "all") {
      filteredReviews = [...reviewsData];
    } else {
      filteredReviews = reviewsData.filter(
        (review) => review.service === filter
      );
    }

    // Reiniciar el carrusel
    currentIndex = 0;
    renderReviews();
    updateStatistics();
  }

  // Actualizar las estadísticas de satisfacción
  function updateStatistics() {
    if (!statsContainer) return;

    // Calcular la calificación promedio
    const totalRating = filteredReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const averageRating =
      filteredReviews.length > 0
        ? (totalRating / filteredReviews.length).toFixed(1)
        : 0;

    // Contar las calificaciones por nivel (1-5)
    const ratingCounts = [0, 0, 0, 0, 0];
    filteredReviews.forEach((review) => {
      ratingCounts[review.rating - 1]++;
    });

    // Crear las estrellas para la calificación promedio
    let starsHTML = "";
    const fullStars = Math.floor(averageRating);
    const halfStar = averageRating - fullStars >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        starsHTML += '<i class="fas fa-star"></i>';
      } else if (i === fullStars + 1 && halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
      } else {
        starsHTML += '<i class="far fa-star"></i>';
      }
    }

    // Crear las barras de progreso para cada nivel de calificación
    let barsHTML = "";
    for (let i = 5; i >= 1; i--) {
      const count = ratingCounts[i - 1];
      // Calcular el porcentaje con precisión y asegurar que sea 0 si no hay reseñas
      const percentage = filteredReviews.length > 0 
        ? ((count / filteredReviews.length) * 100).toFixed(1) 
        : 0;
      
      // Asegurar que la barra tenga al menos 1% de ancho si hay al menos una reseña con esta calificación
      const barWidth = count > 0 ? Math.max(1, percentage) : 0;
      
      barsHTML += `
        <div class="rating-bar">
          <div class="rating-label">${i} <i class="fas fa-star"></i></div>
          <div class="rating-progress">
            <div class="rating-progress-fill" style="width: ${barWidth}%"></div>
          </div>
          <div class="rating-percent">${percentage}%</div>
        </div>
      `;
    }

    // Actualizar el contenido de las estadísticas
    statsContainer.innerHTML = `
      <div class="rating-overview">
        <div class="average-rating">${averageRating}</div>
        <div class="star-display">${starsHTML}</div>
        <div class="review-count">Basado en <span>${filteredReviews.length}</span> reseñas</div>
      </div>
      <div class="rating-bars">
        ${barsHTML}
      </div>
    `;
  }

  // Abrir el modal para añadir una reseña
  function openModal() {
    if (!reviewModal) return;
    reviewModal.classList.add("active");
    document.body.style.overflow = "hidden"; // Evitar scroll en el fondo
  }

  // Cerrar el modal
  function closeModal() {
    if (!reviewModal) return;
    reviewModal.classList.remove("active");
    document.body.style.overflow = "";
    if (reviewForm) reviewForm.reset();
  }

  // Actualizar el texto de calificación
  function updateRatingText() {
    if (!ratingText) return;

    const selectedRating = document.querySelector(
      'input[name="rating"]:checked'
    );
    if (selectedRating) {
      const ratingValue = parseInt(selectedRating.value);
      let ratingDescription = "";

      switch (ratingValue) {
        case 1:
          ratingDescription = "Muy insatisfecho";
          break;
        case 2:
          ratingDescription = "Insatisfecho";
          break;
        case 3:
          ratingDescription = "Neutral";
          break;
        case 4:
          ratingDescription = "Satisfecho";
          break;
        case 5:
          ratingDescription = "Muy satisfecho";
          break;
      }

      ratingText.textContent = ratingDescription;
    }
  }

  // Manejar el envío del formulario de reseña
  function handleReviewSubmit(e) {
    e.preventDefault();

    // Obtener los valores del formulario
    const serviceSelect = document.getElementById("service");
    const serviceId = serviceSelect.value;
    const serviceLabel =
      serviceSelect.options[serviceSelect.selectedIndex].text;
    const rating = document.querySelector('input[name="rating"]:checked').value;
    const title = document.getElementById("reviewTitle").value;
    const content = document.getElementById("reviewContent").value;
    const customerName = document.getElementById("customerName").value;
    const gender = document.querySelector('input[name="gender"]:checked').value;

    // Crear la nueva reseña
    const newReview = {
      service: serviceId,
      serviceLabel: serviceLabel,
      rating: parseInt(rating),
      title,
      content,
      customerName,
      gender,
    };

    // Añadir la reseña a los datos
    const addedReview = window.ReviewsData.addReview(newReview);

    // Actualizar los datos locales
    reviewsData = window.ReviewsData.loadReviews();
    filteredReviews = [...reviewsData];

    // Actualizar la visualización
    currentIndex = 0;
    renderReviews();
    updateStatistics();

    // Cerrar el modal
    closeModal();

    // Mostrar mensaje de confirmación
    alert("¡Gracias por tu reseña! Ha sido añadida correctamente.");
  }

  // Inicializar el sistema de reseñas
  initCarousel();
});
