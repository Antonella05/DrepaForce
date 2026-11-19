const menuButton = document.querySelector("[data-menu-toggle]");
const siteMenu = document.querySelector("[data-site-menu]");

if (menuButton && siteMenu) {
  const closeMenu = () => {
    siteMenu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Ouvrir le menu");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = siteMenu.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  });

  siteMenu.addEventListener("click", event => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", event => {
    if (!siteMenu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

const previewImage = document.querySelector("[data-preview-image]");
const previewStatus = document.querySelector("[data-preview-status]");
const previewButtons = document.querySelectorAll("[data-preview]");
const previews = {
  home: {
    src: "assets/phone-home.webp",
    alt: "Écran d'accueil de l'application DrepaForce montrant l'état du jour et les rappels",
    status: "Accueil · état du jour & rappels"
  },
  journal: {
    src: "assets/phone-journal.webp",
    alt: "Écran Journal de santé de l'application DrepaForce",
    status: "Journal · suivi de santé"
  },
  news: {
    src: "assets/phone-news.webp",
    alt: "Écran Actualités : articles santé classés par thème",
    status: "Actualités · information fiable"
  }
};

if (previewImage && previewStatus && previewButtons.length) {
  previewButtons.forEach(button => {
    button.addEventListener("click", () => {
      const preview = previews[button.dataset.preview];
      if (!preview) return;

      previewImage.src = preview.src;
      previewImage.alt = preview.alt;
      previewStatus.textContent = preview.status;
      previewImage.classList.remove("screen-swapping");
      void previewImage.offsetWidth;
      previewImage.classList.add("screen-swapping");

      previewButtons.forEach(option => {
        const isSelected = option === button;
        option.classList.toggle("is-active", isSelected);
        option.setAttribute("aria-pressed", String(isSelected));
      });
    });
  });
}

const tiltStage = document.querySelector("[data-tilt]");
const tiltScene = tiltStage?.querySelector(".hero-phones");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supportsFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (tiltStage && tiltScene && supportsFinePointer && !prefersReducedMotion) {
  tiltStage.addEventListener("pointermove", event => {
    const bounds = tiltStage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    tiltScene.style.setProperty("--tilt-x", `${-y * 5}deg`);
    tiltScene.style.setProperty("--tilt-y", `${x * 6}deg`);
    tiltStage.style.setProperty("--glow-x", `${50 + x * 18}%`);
    tiltStage.style.setProperty("--glow-y", `${53 + y * 18}%`);
  });

  tiltStage.addEventListener("pointerleave", () => {
    tiltScene.style.setProperty("--tilt-x", "0deg");
    tiltScene.style.setProperty("--tilt-y", "0deg");
    tiltStage.style.removeProperty("--glow-x");
    tiltStage.style.removeProperty("--glow-y");
  });
}

