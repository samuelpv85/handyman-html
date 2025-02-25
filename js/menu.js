document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav_link");

  // Toggle menú
  menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("active");
    document.body.style.overflow = navLinks.classList.contains("active")
      ? "hidden"
      : "";
  });

  // Cerrar menú al hacer click en un enlace
  links.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  // Ajustar menú en resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
});
