document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  let currentSlide = 0;

  function updateSlides() {
    slides.forEach((slide, index) => {
      slide.className = "slide";
      if (index === currentSlide) {
        slide.classList.add("active");
      } else if (index === (currentSlide - 1 + slides.length) % slides.length) {
        slide.classList.add("prev");
      } else if (index === (currentSlide - 2 + slides.length) % slides.length) {
        slide.classList.add("prev-2");
      } else if (index === (currentSlide + 1) % slides.length) {
        slide.classList.add("next");
      } else if (index === (currentSlide + 2) % slides.length) {
        slide.classList.add("next-2");
      }
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlides();
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlides();
  }

  document.querySelector(".next").addEventListener("click", nextSlide);
  document.querySelector(".prev").addEventListener("click", prevSlide);

  // Inicializar el slider
  updateSlides();

  // Auto-play opcional
  setInterval(nextSlide, 5000);
});
