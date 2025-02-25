document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remover clase active de todos los botones
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Agregar clase active al botón clickeado
      button.classList.add("active");

      // Obtener el filtro seleccionado
      const filter = button.getAttribute("data-filter");

      // Filtrar los elementos
      galleryItems.forEach((item) => {
        if (filter === "all" || item.getAttribute("data-category") === filter) {
          item.style.display = "block";
          item.style.opacity = "1";
        } else {
          item.style.opacity = "0";
          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    });
  });
});
