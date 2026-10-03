const preloader = document.getElementById("preloader");

const clientSlider = document.getElementById("clientSlider");
const previousClient = document.getElementById("previousClient");
const nextClient = document.getElementById("nextClient");
const clientVideos = document.querySelectorAll(".client-video");

const PRELOADER_DURATION = 2600;
const FADE_DURATION = 850;

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
}

window.addEventListener("load", () => {
  window.setTimeout(finishPreloader, PRELOADER_DURATION);
});

window.setTimeout(() => {
  if (document.body.classList.contains("is-loading")) {
    finishPreloader();
  }
}, PRELOADER_DURATION + FADE_DURATION + 1500);

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
      behavior: "smooth",
    });
  });

  nextClient.addEventListener("click", () => {
    pauseAllClientVideos();

    clientSlider.scrollBy({
      left: getScrollAmount(),
      behavior: "smooth",
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
        behavior: "smooth",
      });
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      pauseAllClientVideos();

      clientSlider.scrollBy({
        left: -getScrollAmount(),
        behavior: "smooth",
      });
    }
  });

  updateSliderButtons();
}
