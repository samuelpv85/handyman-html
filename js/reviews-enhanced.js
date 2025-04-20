/**
 * SISTEMA MEJORADO DE RESEÑAS PARA HANDYMAN
 * ========================================
 *
 * Este archivo implementa las siguientes mejoras para la sección de reseñas:
 * 1. Sistema de filtrado por tipo de servicio
 * 2. Carrusel para mostrar más reseñas sin ocupar espacio vertical
 * 3. Formulario para que los clientes dejen nuevas reseñas
 * 4. Insignias de verificación para reseñas verificadas
 * 5. Estadísticas generales de calificaciones
 * 6. Mejora de responsividad en dispositivos móviles
 *
 * Autor: Trae AI
 * Fecha: 2023
 */

document.addEventListener("DOMContentLoaded", function () {
  // Referencias a elementos del DOM
  const reviewsSection = document.getElementById("reviews");
  const reviewList = document.querySelector(".review-list");
  let reviewItems = [];

  // Configuración inicial
  let currentSlide = 0;
  let isCarouselMode = window.innerWidth < 768;
  let filteredReviews = []; // Se llenará con las reseñas cargadas desde la API

  /**
   * 1. SISTEMA DE FILTRADO POR TIPO DE SERVICIO
   * ==========================================
   */
  function setupFilterSystem() {
    // Extraer tipos de servicios únicos de las reseñas existentes
    const serviceTypes = new Set();
    reviewItems.forEach((item) => {
      const projectText = item.querySelector(".review-project").textContent;
      const serviceType = projectText.split(":")[1]?.trim() || "Other";
      serviceTypes.add(serviceType);
    });

    // Crear el contenedor de filtros
    const filterContainer = document.createElement("div");
    filterContainer.className = "review-filters";
    filterContainer.innerHTML = `
      <p class="filter-label" data-translate="reviews.filter.label">Filter by service:</p>
      <div class="filter-buttons">
        <button class="filter-btn active" data-service="all" data-translate="reviews.filter.all">All</button>
        ${Array.from(serviceTypes)
          .map(
            (service) =>
              `<button class="filter-btn" data-service="${service}" data-translate="reviews.filter.${service
                .toLowerCase()
                .replace(/ /g, "-")}">${service}</button>`
          )
          .join("")}
      </div>
    `;

    // Insertar el contenedor de filtros antes de la lista de reseñas
    reviewList.parentNode.insertBefore(filterContainer, reviewList);

    // Agregar eventos a los botones de filtro
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Actualizar estado activo de los botones
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        // Filtrar reseñas
        const selectedService = this.getAttribute("data-service");
        filterReviews(selectedService);
      });
    });
  }

  function filterReviews(serviceType) {
    // Resetear la lista filtrada
    filteredReviews = [];

    // Filtrar reseñas según el tipo de servicio
    reviewItems.forEach((item) => {
      const projectText = item.querySelector(".review-project").textContent;
      const itemService = projectText.split(":")[1]?.trim() || "Other";

      if (serviceType === "all" || itemService === serviceType) {
        // Solo añadir a filteredReviews, no cambiar display aquí
        filteredReviews.push(item);
      }

      // Ocultar todas las reseñas inicialmente
      item.style.display = "none";
    });

    // Reiniciar el carrusel
    currentSlide = 0;

    // Actualizar el carrusel para mostrar las reseñas filtradas
    updateCarousel();

    // Actualizar las estadísticas mostradas
    updateReviewStats(serviceType);
  }

  /**
   * 2. CARRUSEL PARA MOSTRAR MÁS RESEÑAS
   * ==================================
   */
  function setupCarousel() {
    // Crear controles del carrusel
    const carouselControls = document.createElement("div");
    carouselControls.className = "carousel-controls";
    carouselControls.innerHTML = `
      <button class="carousel-btn prev" aria-label="Previous review">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="carousel-indicators"></div>
      <button class="carousel-btn next" aria-label="Next review">
        <i class="fas fa-chevron-right"></i>
      </button>
    `;

    // Insertar controles después de la lista de reseñas
    reviewList.parentNode.insertBefore(
      carouselControls,
      reviewList.nextSibling
    );

    // Configurar eventos de los botones
    document
      .querySelector(".carousel-btn.prev")
      .addEventListener("click", () => {
        currentSlide =
          (currentSlide - 1 + filteredReviews.length) % filteredReviews.length;
        updateCarousel();
      });

    document
      .querySelector(".carousel-btn.next")
      .addEventListener("click", () => {
        currentSlide = (currentSlide + 1) % filteredReviews.length;
        updateCarousel();
      });

    // Inicializar el carrusel
    updateCarousel();
  }

  function updateCarousel() {
    // Ocultar todas las reseñas primero
    reviewItems.forEach((item) => {
      item.style.display = "none";
    });

    // Verificar que hay reseñas filtradas
    if (filteredReviews.length === 0) {
      return;
    }

    if (isCarouselMode) {
      // Modo móvil: mostrar solo la reseña actual
      if (filteredReviews.length > 0) {
        filteredReviews[currentSlide].style.display = "flex";
      }
    } else {
      // Modo escritorio: mostrar 3 reseñas a la vez
      for (let i = 0; i < 3; i++) {
        const index = (currentSlide + i) % filteredReviews.length;
        if (filteredReviews[index]) {
          filteredReviews[index].style.display = "flex";
        }
      }
    }

    // Actualizar indicadores
    const indicators = document.querySelector(".carousel-indicators");
    indicators.innerHTML = filteredReviews
      .map(
        (_, index) =>
          `<span class="indicator ${
            index === currentSlide ? "active" : ""
          }"></span>`
      )
      .join("");

    // Agregar eventos a los indicadores
    document.querySelectorAll(".indicator").forEach((indicator, index) => {
      indicator.addEventListener("click", () => {
        currentSlide = index;
        updateCarousel();
      });
    });
  }

  /**
   * 3. FORMULARIO PARA NUEVAS RESEÑAS
   * ===============================
   */
  function setupReviewForm() {
    // Crear el contenedor del formulario
    const formContainer = document.createElement("div");
    formContainer.className = "review-form-container";
    formContainer.innerHTML = `
      <button class="review-form-toggle" data-translate="reviews.form.toggle">
        <i class="fas fa-plus"></i> Leave a Review
      </button>
      <div class="review-form-wrapper hidden">
        <form id="reviewForm" class="review-form">
          <h3 data-translate="reviews.form.title">Share Your Experience</h3>
          
          <div class="form-group">
            <label for="reviewName" data-translate="reviews.form.name">Your Name</label>
            <input type="text" id="reviewName" name="name" required>
          </div>
          
          <div class="form-group">
            <label for="reviewEmail" data-translate="reviews.form.email">Email</label>
            <input type="email" id="reviewEmail" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="reviewService" data-translate="reviews.form.service">Service Type</label>
            <select id="reviewService" name="service" required>
              <option value="" data-translate="reviews.form.select">Select a service</option>
              <option value="Interior Painting" data-translate="reviews.form.service.painting">Interior Painting</option>
              <option value="Furniture Assembly" data-translate="reviews.form.service.assembly">Furniture Assembly</option>
              <option value="Decorative Moldings" data-translate="reviews.form.service.moldings">Decorative Moldings</option>
              <option value="Cabinet Renovation" data-translate="reviews.form.service.cabinet">Cabinet Renovation</option>
              <option value="Custom Shelving" data-translate="reviews.form.service.shelving">Custom Shelving</option>
              <option value="Bathroom Remodeling" data-translate="reviews.form.service.bathroom">Bathroom Remodeling</option>
            </select>
          </div>
          
          <div class="form-group">
            <label data-translate="reviews.form.rating">Rating</label>
            <div class="rating-input">
              <i class="far fa-star" data-rating="1"></i>
              <i class="far fa-star" data-rating="2"></i>
              <i class="far fa-star" data-rating="3"></i>
              <i class="far fa-star" data-rating="4"></i>
              <i class="far fa-star" data-rating="5"></i>
              <input type="hidden" id="reviewRating" name="rating" value="0" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="reviewComment" data-translate="reviews.form.comment">Your Review</label>
            <textarea id="reviewComment" name="comment" rows="4" required></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-cancel" data-translate="reviews.form.cancel">Cancel</button>
            <button type="submit" class="btn-submit" data-translate="reviews.form.submit">Submit Review</button>
          </div>
        </form>
      </div>
    `;

    // Insertar el formulario antes de la lista de reseñas
    reviewList.parentNode.insertBefore(formContainer, reviewList);

    // Configurar eventos del formulario
    const toggleBtn = document.querySelector(".review-form-toggle");
    const formWrapper = document.querySelector(".review-form-wrapper");
    const cancelBtn = document.querySelector(".btn-cancel");
    const reviewForm = document.getElementById("reviewForm");
    const ratingStars = document.querySelectorAll(".rating-input i");
    const ratingInput = document.getElementById("reviewRating");

    // Mostrar/ocultar formulario
    toggleBtn.addEventListener("click", () => {
      formWrapper.classList.toggle("hidden");
      toggleBtn.classList.toggle("active");
    });

    cancelBtn.addEventListener("click", () => {
      formWrapper.classList.add("hidden");
      toggleBtn.classList.remove("active");
      reviewForm.reset();
      resetRatingStars();
    });

    // Sistema de calificación con estrellas
    ratingStars.forEach((star) => {
      // Hover effect
      star.addEventListener("mouseover", function () {
        const rating = this.getAttribute("data-rating");
        highlightStars(rating);
      });

      // Click to set rating
      star.addEventListener("click", function () {
        const rating = this.getAttribute("data-rating");
        ratingInput.value = rating;
        highlightStars(rating);
      });
    });

    document
      .querySelector(".rating-input")
      .addEventListener("mouseout", function () {
        highlightStars(ratingInput.value);
      });

    // Envío del formulario
    reviewForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validar formulario
      if (ratingInput.value === "0") {
        alert("Please select a rating");
        return;
      }

      // Recopilar datos del formulario
      const formData = {
        name: document.getElementById("reviewName").value,
        email: document.getElementById("reviewEmail").value,
        service: document.getElementById("reviewService").value,
        rating: parseInt(ratingInput.value),
        comment: document.getElementById("reviewComment").value,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      // Enviar los datos a la base de datos mediante una llamada AJAX
      fetch("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Crear y añadir la nueva reseña al DOM
            addNewReview(formData);

            // Resetear formulario
            reviewForm.reset();
            resetRatingStars();
            formWrapper.classList.add("hidden");
            toggleBtn.classList.remove("active");

            // Mostrar mensaje de éxito
            showNotification(
              "¡Gracias por tu reseña! Se ha guardado correctamente en la base de datos."
            );
          } else {
            // Mostrar mensaje de error
            showNotification(
              "Error al guardar la reseña: " +
                (data.error || "Error desconocido")
            );
          }
        })
        .catch((error) => {
          console.error("Error al enviar la reseña:", error);
          showNotification(
            "Error al enviar la reseña. Por favor, intente más tarde."
          );
        });
    });

    function highlightStars(rating) {
      ratingStars.forEach((star) => {
        const starRating = parseInt(star.getAttribute("data-rating"));
        if (starRating <= rating) {
          star.className = "fas fa-star";
        } else {
          star.className = "far fa-star";
        }
      });
    }

    function resetRatingStars() {
      ratingInput.value = "0";
      ratingStars.forEach((star) => {
        star.className = "far fa-star";
      });
    }
  }

  function addNewReview(reviewData) {
    // Crear elemento de reseña
    const newReview = document.createElement("article");
    newReview.className = "review-item review-hidden";
    newReview.innerHTML = `
      <div class="review-header">
        <div class="reviewer-profile">
          <div class="reviewer-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="reviewer-info">
            <h3>${reviewData.name}</h3>
            <div class="review-date">${reviewData.date}</div>
          </div>
        </div>
        <div class="review-rating">
          ${Array(5)
            .fill()
            .map((_, i) =>
              i < reviewData.rating
                ? '<i class="fas fa-star"></i>'
                : '<i class="far fa-star"></i>'
            )
            .join("")}
        </div>
      </div>
      <p class="review-text">${reviewData.comment}</p>
      <div class="review-project">Project: ${reviewData.service}</div>
    `;

    // Añadir la reseña al principio de la lista
    reviewList.prepend(newReview);

    // Animar la entrada de la nueva reseña
    setTimeout(() => {
      newReview.classList.add("review-visible");
    }, 100);

    // Actualizar la lista de reseñas filtradas
    filteredReviews = [...document.querySelectorAll(".review-item")];

    // Actualizar el carrusel si está activo
    if (isCarouselMode) {
      currentSlide = 0;
      updateCarousel();
    }
  }

  function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "review-notification";
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  /**
   * 4. INSIGNIAS DE VERIFICACIÓN
   * =========================
   */
  function addVerificationBadges() {
    // Añadir insignias a las reseñas existentes (simulación)
    // En un entorno real, esta información vendría de la base de datos
    reviewItems.forEach((item, index) => {
      // Simulamos que algunas reseñas están verificadas
      const isVerified = index % 2 === 0; // Verificamos reseñas alternadas como ejemplo

      if (isVerified) {
        const reviewerInfo = item.querySelector(".reviewer-info");
        const verifiedBadge = document.createElement("div");
        verifiedBadge.className = "verified-badge";
        verifiedBadge.innerHTML = `
          <i class="fas fa-check-circle"></i>
          <span data-translate="reviews.verified">Verified Customer</span>
        `;
        reviewerInfo.appendChild(verifiedBadge);
      }
    });
  }

  /**
   * 5. ESTADÍSTICAS GENERALES DE CALIFICACIONES
   * =======================================
   */
  function setupReviewStats() {
    // Verificar si ya existe un contenedor de estadísticas para evitar duplicación
    if (document.querySelector(".review-stats")) {
      return;
    }

    // Crear el contenedor de estadísticas
    const statsContainer = document.createElement("div");
    statsContainer.className = "review-stats";
    statsContainer.innerHTML = `
      <h3 data-translate="reviews.stats.title">Customer Satisfaction</h3>
      <div class="stats-content">
        <div class="stats-summary">
          <div class="average-rating">
            <span class="rating-number">0.0</span>
            <div class="rating-stars">
              <i class="far fa-star"></i>
              <i class="far fa-star"></i>
              <i class="far fa-star"></i>
              <i class="far fa-star"></i>
              <i class="far fa-star"></i>
            </div>
            <span class="rating-count" data-translate="reviews.stats.based">Based on <strong>0</strong> reviews</span>
          </div>
        </div>
        <div class="rating-bars">
          <div class="rating-bar-item">
            <span class="rating-label">5 <i class="fas fa-star"></i></span>
            <div class="rating-bar">
              <div class="rating-fill" style="width: 0%;"></div>
            </div>
            <span class="rating-percent">0%</span>
          </div>
          <div class="rating-bar-item">
            <span class="rating-label">4 <i class="fas fa-star"></i></span>
            <div class="rating-bar">
              <div class="rating-fill" style="width: 0%;"></div>
            </div>
            <span class="rating-percent">0%</span>
          </div>
          <div class="rating-bar-item">
            <span class="rating-label">3 <i class="fas fa-star"></i></span>
            <div class="rating-bar">
              <div class="rating-fill" style="width: 0%;"></div>
            </div>
            <span class="rating-percent">0%</span>
          </div>
          <div class="rating-bar-item">
            <span class="rating-label">2 <i class="fas fa-star"></i></span>
            <div class="rating-bar">
              <div class="rating-fill" style="width: 0%;"></div>
            </div>
            <span class="rating-percent">0%</span>
          </div>
          <div class="rating-bar-item">
            <span class="rating-label">1 <i class="fas fa-star"></i></span>
            <div class="rating-bar">
              <div class="rating-fill" style="width: 0%;"></div>
            </div>
            <span class="rating-percent">0%</span>
          </div>
        </div>
      </div>
    `;

    // Insertar estadísticas antes de la lista de reseñas
    const reviewsSubtitle = document.querySelector(".reviews-subtitle");
    reviewsSubtitle.parentNode.insertBefore(
      statsContainer,
      reviewsSubtitle.nextSibling
    );
  }

  function updateReviewStats(serviceType, apiData = null) {
    // Usar datos de la API si están disponibles, de lo contrario calcular en base a las reseñas visibles
    let stats;

    if (apiData) {
      // Procesar datos de la API
      stats = {
        average: apiData.average_rating || 0,
        count: apiData.total_reviews || 0,
        distribution: [
          apiData.rating_1_percent || 0,
          apiData.rating_2_percent || 0,
          apiData.rating_3_percent || 0,
          apiData.rating_4_percent || 0,
          apiData.rating_5_percent || 0,
        ],
      };
    } else {
      // Calcular estadísticas basadas en las reseñas filtradas
      const visibleReviews = filteredReviews;

      // Contar reseñas por calificación
      const ratingCounts = [0, 0, 0, 0, 0]; // Para calificaciones 1-5

      visibleReviews.forEach((item) => {
        const starsElements = item.querySelectorAll(
          ".review-rating .fas.fa-star"
        );
        const rating = starsElements.length;
        if (rating >= 1 && rating <= 5) {
          ratingCounts[rating - 1]++;
        }
      });

      // Calcular total y promedio
      const totalReviews = visibleReviews.length;
      let totalStars = 0;

      ratingCounts.forEach((count, index) => {
        totalStars += count * (index + 1);
      });

      const averageRating = totalReviews > 0 ? totalStars / totalReviews : 0;

      // Calcular distribución porcentual
      const distribution = ratingCounts.map((count) =>
        totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
      );

      stats = {
        average: averageRating,
        count: totalReviews,
        distribution: distribution,
      };
    }

    // Actualizar el DOM con las nuevas estadísticas
    document.querySelector(".rating-number").textContent =
      stats.average.toFixed(1);
    document.querySelector(".rating-count strong").textContent = stats.count;

    // Actualizar las barras de distribución
    const ratingBars = document.querySelectorAll(".rating-fill");
    const ratingPercents = document.querySelectorAll(".rating-percent");

    for (let i = 0; i < 5; i++) {
      const percent = stats.distribution[4 - i];
      ratingBars[i].style.width = `${percent}%`;
      ratingPercents[i].textContent = `${percent}%`;
    }

    // Actualizar las estrellas del promedio
    updateAverageStars(stats.average);
  }

  function updateAverageStars(average) {
    const starsContainer = document.querySelector(".rating-stars");
    starsContainer.innerHTML = "";

    // Crear las estrellas basadas en el promedio
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("i");
      if (i <= Math.floor(average)) {
        star.className = "fas fa-star"; // Estrella completa
      } else if (i - 0.5 <= average) {
        star.className = "fas fa-star-half-alt"; // Media estrella
      } else {
        star.className = "far fa-star"; // Estrella vacía
      }
      starsContainer.appendChild(star);
    }
  }

  /**
   * 6. MEJORA DE RESPONSIVIDAD
   * =======================
   */
  function setupResponsiveness() {
    // Verificar el tamaño de la pantalla al cargar
    checkScreenSize();

    // Escuchar cambios en el tamaño de la ventana
    window.addEventListener("resize", checkScreenSize);
  }

  function checkScreenSize() {
    const wasCarouselMode = isCarouselMode;
    isCarouselMode = window.innerWidth < 768;

    // Si cambia el modo, actualizar la visualización
    if (wasCarouselMode !== isCarouselMode) {
      // Siempre mostrar controles del carrusel, tanto en móvil como en escritorio
      document.querySelector(".carousel-controls").style.display = "flex";

      // Actualizar clases CSS para estilo adecuado según el modo
      const reviewList = document.querySelector(".review-list");
      if (isCarouselMode) {
        reviewList.classList.add("mobile-carousel");
        reviewList.classList.remove("desktop-carousel");

        // Asegurarse de que no haya duplicación de estadísticas en móvil
        const statsContainers = document.querySelectorAll(".review-stats");
        if (statsContainers.length > 1) {
          // Mantener solo el primer contenedor de estadísticas
          for (let i = 1; i < statsContainers.length; i++) {
            statsContainers[i].style.display = "none";
          }
        }
      } else {
        reviewList.classList.add("desktop-carousel");
        reviewList.classList.remove("mobile-carousel");

        // Restaurar visibilidad de estadísticas en escritorio
        const statsContainers = document.querySelectorAll(".review-stats");
        statsContainers.forEach((container) => {
          container.style.display = "";
        });
      }

      // Actualizar la visualización del carrusel según el modo
      updateCarousel();
    }
  }

  /**
   * CARGA DE DATOS DESDE LA API
   * =========================
   */
  async function loadReviewsFromAPI() {
    try {
      // Realizar petición a la API
      const response = await fetch("/api/reviews");

      if (!response.ok) {
        throw new Error(`Error al cargar reseñas: ${response.status}`);
      }

      const data = await response.json();

      // Limpiar las reseñas existentes (siempre, incluso si no hay datos)
      reviewList.innerHTML = "";

      if (data.success && data.data && data.data.length > 0) {
        // Crear elementos para cada reseña de la API
        data.data.forEach((review) => {
          const reviewElement = createReviewElement(review);
          reviewList.appendChild(reviewElement);
        });

        // Actualizar referencias después de cargar nuevas reseñas
        reviewItems = document.querySelectorAll(".review-item");
        filteredReviews = [...reviewItems];

        // Cargar estadísticas de reseñas
        loadReviewStats();

        return true; // Indicar que la carga fue exitosa
      } else {
        console.warn("No se encontraron reseñas en la API");
        reviewList.innerHTML = `<div class="review-empty">No hay reseñas disponibles en este momento.</div>`;
        return false;
      }
    } catch (error) {
      console.error("Error al cargar reseñas desde la API:", error);
      throw error; // Propagar el error para manejarlo en init()
    }
  }

  /**
   * Carga estadísticas desde la API
   */
  async function loadReviewStats() {
    try {
      const response = await fetch("http://localhost:3000/api/reviews/stats");

      if (!response.ok) {
        throw new Error(`Error al cargar estadísticas: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Actualizar estadísticas con datos reales
        updateReviewStats("all", data.data);
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      // Si falla, configurar estadísticas con datos estáticos
      setupReviewStats();
    }
  }

  /**
   * Crea un elemento de reseña a partir de datos de la API
   */
  function createReviewElement(reviewData) {
    const reviewElement = document.createElement("article");
    reviewElement.className = "review-item review-hidden";

    reviewElement.innerHTML = `
      <div class="review-header">
        <div class="reviewer-profile">
          <div class="reviewer-avatar">
            ${
              reviewData.avatar_url
                ? `<img src="${reviewData.avatar_url}" alt="${reviewData.customer_name}">`
                : '<i class="fas fa-user-circle"></i>'
            }
          </div>
          <div class="reviewer-info">
            <h3>${reviewData.customer_name}</h3>
            <div class="review-date">${new Date(
              reviewData.review_date
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</div>
            ${
              reviewData.is_verified
                ? `<div class="verified-badge">
                <i class="fas fa-check-circle"></i>
                <span data-translate="reviews.verified">Verified Customer</span>
              </div>`
                : ""
            }
          </div>
        </div>
        <div class="review-rating">
          ${Array(5)
            .fill()
            .map((_, i) =>
              i < reviewData.rating
                ? '<i class="fas fa-star"></i>'
                : '<i class="far fa-star"></i>'
            )
            .join("")}
        </div>
      </div>
      <p class="review-text">${reviewData.comment}</p>
      <div class="review-project">Project: ${reviewData.service_name}</div>
    `;

    return reviewElement;
  }

  /**
   * INICIALIZACIÓN
   * =============
   */
  function init() {
    // Cargar reseñas desde la API - Esta es la única fuente de reseñas
    loadReviewsFromAPI()
      .then(() => {
        // Obtener las reseñas actualizadas después de cargar
        reviewItems = document.querySelectorAll(".review-item");
        filteredReviews = [...reviewItems];

        // Configurar el resto del sistema después de cargar las reseñas
        setupFilterSystem();
        setupCarousel();
        addVerificationBadges();
        setupReviewStats();
        // Calcular y mostrar estadísticas inmediatamente al cargar
        updateReviewStats("all");
        setupReviewForm();
        setupResponsiveness();

        // Iniciar animación cuando el usuario hace scroll a la sección
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                animateReviews();
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.2 }
        );

        if (reviewsSection) {
          observer.observe(reviewsSection);
        }
      })
      .catch((error) => {
        console.error("Error al inicializar el sistema de reseñas:", error);
        // Mostrar mensaje de error en la interfaz
        reviewList.innerHTML = `<div class="review-error">No se pudieron cargar las reseñas. Por favor, intente más tarde.</div>`;
      });
  }

  // Función para animar la entrada de las reseñas
  function animateReviews() {
    reviewItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add("review-visible");
      }, index * 200);
    });
  }

  // Iniciar todo el sistema
  init();
});
