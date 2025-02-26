const translations = {
  en: {
    nav: {
      home: "Home",
      services: "Services",
      gallery: "Project Gallery",
      about: "About",
      contact: "Contact",
    },
    hero: {
      title: "Handyman",
      description: "Experts in maintenance, painting and remodeling services",
    },
    services: {
      title: "Our Services",
      painting: {
        title: "Painting",
        description:
          "Our painting experts can transform any room or exterior into an elegant and cozy space. We offer interior and exterior painting, lacquering, texturing and much more.",
      },
      assembly: {
        title: "Assembly",
        description:
          "Specialists in assembling furniture, structures and equipment for your home or office. We guarantee professional and lasting work, following the technical specifications of each product.",
      },
      moldings: {
        title: "Moldings",
        description:
          "Our remodeling team helps you transform your home or office with high-quality moldings. We offer custom design, manufacturing and installation for each project.",
      },
    },
    // Add more translations as needed
  },
  es: {
    // Spanish translations (current content)
    // Add all Spanish translations here
  },
};

let currentLang = "en"; // Default language

function toggleLanguage() {
  currentLang = currentLang === "en" ? "es" : "en";
  updateContent();
  document.querySelector(".lang-text").textContent =
    currentLang === "en" ? "ES" : "EN";
}

function updateContent() {
  // Update all text content based on currentLang
  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach((element) => {
    const key = element.dataset.translate;
    element.textContent = translations[currentLang][key];
  });
}

// Initialize in English
document.addEventListener("DOMContentLoaded", () => {
  updateContent();
});
