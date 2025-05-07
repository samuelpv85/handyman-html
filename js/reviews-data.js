/**
 * Archivo de datos para el sistema de reseñas de Handyman
 * Este archivo almacena las reseñas de los usuarios y proporciona funciones para guardar y cargar datos
 */

// Avatares estándar para hombres y mujeres
const AVATARS = {
  man: "/img/avatars/man-avatar.jpg", // Ruta a la imagen estándar de hombre
  woman: "/img/avatars/woman-avatar.jpg", // Ruta a la imagen estándar de mujer
};

// Tipos de servicios disponibles
const SERVICES = {
  painting: {
    id: "painting",
    label: "Painting",
    icon: "paint-roller",
  },
  assembly: {
    id: "assembly",
    label: "Assembly",
    icon: "tools",
  },
  moldings: {
    id: "moldings",
    label: "Moldings",
    icon: "hammer",
  },
};

// Datos iniciales de reseñas (4 por cada tipo de servicio)
const initialReviews = [
  // Reseñas de Painting
  {
    id: 1,
    service: SERVICES.painting.id,
    serviceLabel: SERVICES.painting.label,
    rating: 5,
    title: "Excelente trabajo de pintura",
    content:
      "They painted my entire house with a perfect finish. The team was very professional and clean. I highly recommend their painting services.",
    customerName: "Carlos Rodríguez",
    gender: "man",
    verified: true,
    date: "15/04/2023",
  },
  {
    id: 2,
    service: SERVICES.painting.id,
    serviceLabel: SERVICES.painting.label,
    rating: 4,
    title: "Buen trabajo en mi sala",
    content:
      "They painted my living room and dining room. The result was very good, although there was a small detail in one corner that needed touching up.",
    customerName: "María González",
    gender: "woman",
    verified: true,
    date: "03/05/2023",
  },
  {
    id: 3,
    service: SERVICES.painting.id,
    serviceLabel: SERVICES.painting.label,
    rating: 5,
    title: "Transformaron mi fachada",
    content:
      "We hired the service to paint the front of our house and it turned out amazing. The colors matched exactly what we had envisioned.",
    customerName: "Juan Pérez",
    gender: "man",
    verified: true,
    date: "22/05/2023",
  },
  {
    id: 4,
    service: SERVICES.painting.id,
    serviceLabel: SERVICES.painting.label,
    rating: 5,
    title: "Excelente servicio y puntualidad",
    content:
      "They painted my office over the weekend and by Monday it was ready to work in. Excellent service and very punctual.",
    customerName: "Ana Martínez",
    gender: "woman",
    verified: true,
    date: "10/06/2023",
  },

  // Reseñas de Assembly
  {
    id: 5,
    service: SERVICES.assembly.id,
    serviceLabel: SERVICES.assembly.label,
    rating: 5,
    title: "Montaje perfecto de muebles",
    content:
      "They assembled all the furniture in my new house in record time. Everything ended up perfectly leveled and stable.",
    customerName: "Roberto Sánchez",
    gender: "man",
    verified: true,
    date: "28/06/2023",
  },
  {
    id: 6,
    service: SERVICES.assembly.id,
    serviceLabel: SERVICES.assembly.label,
    rating: 4,
    title: "Buen trabajo con mis estanterías",
    content:
      "They installed several shelves in my house. The work turned out well, although it took a bit longer than expected.",
    customerName: "Laura Díaz",
    gender: "woman",
    verified: true,
    date: "05/07/2023",
  },
  {
    id: 7,
    service: SERVICES.assembly.id,
    serviceLabel: SERVICES.assembly.label,
    rating: 5,
    title: "Excelente montaje de cocina",
    content:
      "They assembled my entire new kitchen. The result is spectacular and everything works perfectly. Highly recommended.",
    customerName: "Miguel Torres",
    gender: "man",
    verified: true,
    date: "15/07/2023",
  },
  {
    id: 8,
    service: SERVICES.assembly.id,
    serviceLabel: SERVICES.assembly.label,
    rating: 5,
    title: "Montaje rápido y profesional",
    content:
      "I needed several pieces of furniture assembled urgently, and they responded quickly. Very professional and clean work.",
    customerName: "Sofía Vargas",
    gender: "woman",
    verified: true,
    date: "02/08/2023",
  },

  // Reseñas de Moldings
  {
    id: 9,
    service: SERVICES.moldings.id,
    serviceLabel: SERVICES.moldings.label,
    rating: 5,
    title: "Molduras perfectas",
    content:
      "They installed moldings throughout my house and the result is spectacular. They completely transformed the look of the rooms.",
    customerName: "Daniel López",
    gender: "man",
    verified: true,
    date: "20/08/2023",
  },
  {
    id: 10,
    service: SERVICES.moldings.id,
    serviceLabel: SERVICES.moldings.label,
    rating: 4,
    title: "Buen trabajo con las molduras del techo",
    content:
      "They installed moldings on the ceiling of my living room. The work turned out very well, although there was a slight delay in the delivery of the materials.",
    customerName: "Carmen Ruiz",
    gender: "woman",
    verified: true,
    date: "05/09/2023",
  },
  {
    id: 11,
    service: SERVICES.moldings.id,
    serviceLabel: SERVICES.moldings.label,
    rating: 5,
    title: "Excelente acabado en las molduras",
    content:
      "The moldings they installed in my house have a perfect finish. The team was very professional and careful with the details.",
    customerName: "Javier Moreno",
    gender: "man",
    verified: true,
    date: "15/09/2023",
  },
  {
    id: 12,
    service: SERVICES.moldings.id,
    serviceLabel: SERVICES.moldings.label,
    rating: 5,
    title: "Transformaron mi casa con molduras",
    content:
      "The moldings they installed in my house have a perfect finish. The team was very professional and careful with the details.",
    customerName: "Elena Gómez",
    gender: "woman",
    verified: true,
    date: "28/09/2023",
  },
];

// Función para guardar las reseñas en localStorage
function saveReviews(reviews) {
  localStorage.setItem("handyman_reviews", JSON.stringify(reviews));
  return reviews;
}

// Función para cargar las reseñas desde localStorage
function loadReviews() {
  const savedReviews = localStorage.getItem("handyman_reviews");
  return savedReviews ? JSON.parse(savedReviews) : initialReviews;
}

// Función para añadir una nueva reseña
function addReview(reviewData) {
  const reviews = loadReviews();
  const newReview = {
    id: reviews.length > 0 ? Math.max(...reviews.map((r) => r.id)) + 1 : 1,
    ...reviewData,
    date: new Date().toLocaleDateString("es-ES"),
    verified: false,
  };

  reviews.unshift(newReview); // Añadir al principio para que sea la más reciente
  saveReviews(reviews);
  return newReview;
}

// Exportar las funciones y constantes
window.ReviewsData = {
  AVATARS,
  SERVICES,
  loadReviews,
  saveReviews,
  addReview,
};
