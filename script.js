const clientSlider = document.getElementById("clientSlider");
const previousClient = document.getElementById("previousClient");
const nextClient = document.getElementById("nextClient");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const scrollBehavior = () => (reducedMotion.matches ? "auto" : "smooth");

/* =========================================
   CARRUSEL DE CLIENTES
========================================= */
if (clientSlider && previousClient && nextClient) {
  const sliderControls = previousClient.parentElement;
  const clientCards = Array.from(clientSlider.querySelectorAll(".client-card"));

  function getScrollAmount() {
    const firstCard = clientCards[0];

    if (!firstCard) {
      return clientSlider.clientWidth * 0.8;
    }

    const styles = window.getComputedStyle(clientSlider);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;

    return firstCard.offsetWidth + gap;
  }

  function updateSliderButtons() {
    const maximumScroll = clientSlider.scrollWidth - clientSlider.clientWidth;
    const currentScroll = clientSlider.scrollLeft;

    sliderControls.hidden = maximumScroll <= 4;
    previousClient.setAttribute("aria-disabled", String(currentScroll <= 4));
    nextClient.setAttribute("aria-disabled", String(currentScroll >= maximumScroll - 4));
  }

  function stepSlider(direction) {
    const button = direction < 0 ? previousClient : nextClient;
    if (sliderControls.hidden || button.getAttribute("aria-disabled") === "true") {
      return;
    }
    clientSlider.scrollBy({
      left: direction * getScrollAmount(),
      behavior: scrollBehavior(),
    });
  }

  previousClient.addEventListener("click", () => stepSlider(-1));
  nextClient.addEventListener("click", () => stepSlider(1));

  clientSlider.addEventListener("scroll", updateSliderButtons, {
    passive: true,
  });

  window.addEventListener("resize", updateSliderButtons);

  let dragPointerId = null;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let ignorePointerClick = false;

  clientSlider.addEventListener("pointerdown", (event) => {
    ignorePointerClick = false;
    if (dragPointerId !== null || event.pointerType !== "mouse" ||
        event.button !== 0) {
      return;
    }

    dragPointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartScroll = clientSlider.scrollLeft;

  });

  clientSlider.addEventListener("pointermove", (event) => {
    if (event.pointerId !== dragPointerId) {
      return;
    }

    const distance = event.clientX - dragStartX;

    if (!clientSlider.classList.contains("is-dragging")) {
      if (Math.abs(distance) <= 5) {
        return;
      }
      clientSlider.classList.add("is-dragging");
      ignorePointerClick = true;
      clientSlider.setPointerCapture(event.pointerId);
    }

    clientSlider.scrollLeft = dragStartScroll - distance;
  });

  function stopDragging(event) {
    if (event.pointerId !== dragPointerId) {
      return;
    }

    dragPointerId = null;
    clientSlider.classList.remove("is-dragging");
  }

  clientSlider.addEventListener("pointerup", stopDragging);
  clientSlider.addEventListener("pointercancel", stopDragging);
  clientSlider.addEventListener("lostpointercapture", stopDragging);
  clientSlider.addEventListener("pointerleave", (event) => {
    if (!clientSlider.classList.contains("is-dragging")) {
      stopDragging(event);
    }
  });

  clientSlider.addEventListener("click", (event) => {
    if (ignorePointerClick && event.detail > 0) {
      event.preventDefault();
      ignorePointerClick = false;
    }
  }, { capture: true });

  clientSlider.addEventListener("keydown", (event) => {
    if (event.defaultPrevented ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const direction = event.key === "ArrowLeft" ? -1 : 1;
      const cardIndex = clientCards.indexOf(event.target);
      if (cardIndex >= 0) {
        clientCards[cardIndex + direction]?.focus();
      } else {
        stepSlider(direction);
      }
    }
  });

  updateSliderButtons();
}

document.querySelectorAll(".client-project").forEach((project) => {
  const video = project.querySelector(".client-video");
  const status = project.querySelector(".client-video-status");
  const showPlaybackError = () => {
    status.textContent = "Este video no está disponible en este momento.";
  };

  video.addEventListener("error", showPlaybackError);
  if (video.error) {
    showPlaybackError();
  }
});

/* El resplandor es decorativo y el almacenamiento solo decide si se repite. */
if (!reducedMotion.matches) {
  try {
    if (!sessionStorage.getItem("bifrost:seen")) {
      sessionStorage.setItem("bifrost:seen", "1");
      document.querySelector(".brand")?.classList.add("is-intro");
    }
  } catch {
    /* Con el almacenamiento bloqueado, el logo conserva su estado normal. */
  }
}
