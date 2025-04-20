document.addEventListener("DOMContentLoaded", function () {
  // Animación de las estrellas en las reseñas
  const reviewItems = document.querySelectorAll(".review-item");

  // Función para animar la entrada de las reseñas
  function animateReviews() {
    reviewItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add("review-visible");
      }, index * 200);
    });
  }

  // Iniciar animación cuando el usuario hace scroll a la sección
  const reviewsSection = document.getElementById("reviews");
  if (reviewsSection) {
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

    observer.observe(reviewsSection);
  }

  // Añadir clase para animación inicial
  reviewItems.forEach((item) => {
    item.classList.add("review-hidden");
  });
});
