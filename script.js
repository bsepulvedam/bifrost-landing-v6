const preloader = document.getElementById("preloader");

const clientSlider = document.getElementById("clientSlider");
const previousClient = document.getElementById("previousClient");
const nextClient = document.getElementById("nextClient");
const clientVideos = document.querySelectorAll(".client-video");

const PRELOADER_DURATION = 2600;
const FADE_DURATION = 600; /* sincronizado con --preloader-fade */
const LEAVE_DURATION = 160; /* sincronizado con --motion-fast */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const scrollBehavior = () => (reducedMotion.matches ? "auto" : "smooth");

/* =========================================
   PRELOADER
========================================= */
function finishPreloader() {
  if (!preloader) {
    return;
  }

  preloader.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-ready");

  try {
    sessionStorage.setItem("bifrost:seen", "1");
  } catch (error) {
    /* sin storage: el preloader simplemente se repetirá */
  }
}

if (document.documentElement.classList.contains("skip-preloader")) {
  /* Dos frames para que el navegador pinte el estado inicial y la entrada se anime */
  requestAnimationFrame(() => requestAnimationFrame(finishPreloader));
} else {
  window.addEventListener("load", () => {
    window.setTimeout(finishPreloader, reducedMotion.matches ? 0 : PRELOADER_DURATION);
  });
}

window.setTimeout(() => {
  if (document.body.classList.contains("is-loading")) {
    finishPreloader();
  }
}, PRELOADER_DURATION + FADE_DURATION + 1500);

/* =========================================
   TRANSICIÓN ENTRE PÁGINAS
   Fade-out corto y navegación normal; si algo no aplica, el enlace funciona nativo.
========================================= */
document.addEventListener("click", (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    reducedMotion.matches ||
    document.body.classList.contains("is-loading")
  ) {
    return;
  }

  const link = event.target.closest("a[href]");

  if (
    !link ||
    link.hasAttribute("download") ||
    (link.target && link.target !== "_self")
  ) {
    return;
  }

  const url = new URL(link.href, window.location.href);

  const isSameSite =
    url.protocol === window.location.protocol &&
    url.host === window.location.host &&
    (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "file:");

  const isSamePage =
    url.pathname === window.location.pathname && url.search === window.location.search;

  if (!isSameSite || isSamePage) {
    return;
  }

  event.preventDefault();
  document.body.classList.add("is-leaving");
  window.setTimeout(() => {
    window.location.href = url.href;
  }, LEAVE_DURATION);
});

/* Volver con el botón "atrás" puede restaurar la página desde caché ya desvanecida */
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    document.body.classList.remove("is-leaving");
  }
});

/* =========================================
   CARRUSEL DE CLIENTES
========================================= */
if (clientSlider && previousClient && nextClient) {
  function getScrollAmount() {
    const firstCard = clientSlider.querySelector(".client-card");

    if (!firstCard) {
      return clientSlider.clientWidth * 0.8;
    }

    const styles = window.getComputedStyle(clientSlider);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;

    return firstCard.getBoundingClientRect().width + gap;
  }

  function updateSliderButtons() {
    const maximumScroll = clientSlider.scrollWidth - clientSlider.clientWidth;
    const currentScroll = clientSlider.scrollLeft;

    previousClient.disabled = currentScroll <= 4;
    nextClient.disabled = currentScroll >= maximumScroll - 4;
  }

  function pauseAllClientVideos() {
    clientVideos.forEach((video) => {
      video.pause();
    });
  }

  previousClient.addEventListener("click", () => {
    pauseAllClientVideos();

    clientSlider.scrollBy({
      left: -getScrollAmount(),
      behavior: scrollBehavior(),
    });
  });

  nextClient.addEventListener("click", () => {
    pauseAllClientVideos();

    clientSlider.scrollBy({
      left: getScrollAmount(),
      behavior: scrollBehavior(),
    });
  });

  clientSlider.addEventListener("scroll", updateSliderButtons, {
    passive: true,
  });

  window.addEventListener("resize", updateSliderButtons);

  let isDragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let hasPausedDuringDrag = false;

  clientSlider.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".client-video")) {
      return;
    }

    if (event.pointerType === "touch") {
      return;
    }

    isDragging = true;
    hasPausedDuringDrag = false;
    dragStartX = event.clientX;
    dragStartScroll = clientSlider.scrollLeft;

    clientSlider.classList.add("is-dragging");
    clientSlider.setPointerCapture(event.pointerId);
  });

  clientSlider.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    const distance = event.clientX - dragStartX;

    if (Math.abs(distance) > 5 && !hasPausedDuringDrag) {
      pauseAllClientVideos();
      hasPausedDuringDrag = true;
    }

    clientSlider.scrollLeft = dragStartScroll - distance;
  });

  function stopDragging(event) {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    hasPausedDuringDrag = false;
    clientSlider.classList.remove("is-dragging");

    if (
      event &&
      clientSlider.hasPointerCapture &&
      clientSlider.hasPointerCapture(event.pointerId)
    ) {
      clientSlider.releasePointerCapture(event.pointerId);
    }
  }

  clientSlider.addEventListener("pointerup", stopDragging);
  clientSlider.addEventListener("pointercancel", stopDragging);
  clientSlider.addEventListener("pointerleave", stopDragging);

  clientSlider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      pauseAllClientVideos();

      clientSlider.scrollBy({
        left: getScrollAmount(),
        behavior: scrollBehavior(),
      });
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      pauseAllClientVideos();

      clientSlider.scrollBy({
        left: -getScrollAmount(),
        behavior: scrollBehavior(),
      });
    }
  });

  updateSliderButtons();
}
