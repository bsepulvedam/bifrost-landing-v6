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
  const clientVideos = clientSlider.querySelectorAll("video");

  function getScrollAmount() {
    const firstCard = clientSlider.querySelector(".client-card");

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

  function pauseAllClientVideos() {
    clientVideos.forEach((video) => {
      video.pause();
    });
  }

  function stepSlider(direction) {
    const button = direction < 0 ? previousClient : nextClient;
    if (sliderControls.hidden || button.getAttribute("aria-disabled") === "true") {
      return;
    }
    pauseAllClientVideos();

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

  clientSlider.addEventListener("pointerdown", (event) => {
    if (dragPointerId !== null || event.pointerType !== "mouse" ||
        event.button !== 0 || event.target.closest("video")) {
      return;
    }

    dragPointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartScroll = clientSlider.scrollLeft;

    clientSlider.setPointerCapture(event.pointerId);
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
      pauseAllClientVideos();
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

  clientSlider.addEventListener("keydown", (event) => {
    if (event.target !== clientSlider || event.defaultPrevented ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      stepSlider(event.key === "ArrowLeft" ? -1 : 1);
    }
  });

  updateSliderButtons();
}

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
