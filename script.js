
const clientSlider = document.getElementById("clientSlider");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (clientSlider) {
  const section = clientSlider.closest(".clients");
  const toggle = section.querySelector(".slider-toggle");
  const hint = document.getElementById("sliderHint");
  const cards = Array.from(clientSlider.querySelectorAll(".client-card"));
  const interval = 3000;
  const touchPointers = new Set();
  let timer;
  let inView = false;
  let hovered = false;
  let userPaused = false;
  let motionOptIn = false;
  let touchReadyAt = 0;
  let dragPointerId = null;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let ignorePointerClick = false;

  const motionPaused = () => reducedMotion.matches && !motionOptIn;
  const scrollBehavior = () => reducedMotion.matches ? "instant" : "smooth";

  function step(direction, wrap = false) {
    const left = clientSlider.scrollLeft;
    const max = clientSlider.scrollWidth - clientSlider.clientWidth;
    const positions = cards.map((card) => Math.min(card.offsetLeft - cards[0].offsetLeft, max));
    const next = direction > 0
      ? positions.find((position) => position > left + 3)
      : positions.findLast((position) => position < left - 3);
    if (next !== undefined || (wrap && left > 3)) {
      clientSlider.scrollTo({ left: next ?? 0, behavior: scrollBehavior() });
    }
  }

  function schedule() {
    window.clearTimeout(timer);
    if (userPaused || motionPaused() || !inView || document.hidden || hovered ||
        section.contains(document.activeElement) || dragPointerId !== null || touchPointers.size) {
      return;
    }
    timer = window.setTimeout(() => {
      step(1, true);
      schedule();
    }, Math.max(interval, touchReadyAt - performance.now()));
  }

  function updateToggle() {
    const paused = userPaused || motionPaused();
    toggle.hidden = false;
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.textContent = paused ? "Reanudar" : "Pausar";
    hint.textContent = paused
      ? "El carrusel está en pausa. Puedes deslizarlo o usar las flechas del teclado."
      : "El carrusel avanza solo. Puedes pausarlo, deslizarlo o usar las flechas del teclado.";
  }

  toggle.addEventListener("click", () => {
    userPaused = !(userPaused || motionPaused());
    motionOptIn = !userPaused && reducedMotion.matches;
    updateToggle();
    schedule();
  });
  reducedMotion.addEventListener("change", () => {
    motionOptIn = false;
    updateToggle();
    schedule();
  });
  section.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch") {
      hovered = true;
      schedule();
    }
  });
  section.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "touch") {
      hovered = false;
      schedule();
    }
  });
  section.addEventListener("focusin", schedule);
  section.addEventListener("focusout", () => queueMicrotask(schedule));
  document.addEventListener("visibilitychange", schedule);
  clientSlider.addEventListener("wheel", schedule, { passive: true });
  clientSlider.addEventListener("scroll", () => {
    if (touchReadyAt > performance.now()) {
      touchReadyAt = performance.now() + interval;
      schedule();
    }
  }, { passive: true });

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio >= 0.3;
    schedule();
  }, { threshold: 0.3 }).observe(clientSlider);

  clientSlider.addEventListener("pointerdown", (event) => {
    ignorePointerClick = false;
    if (event.pointerType === "touch") {
      touchPointers.add(event.pointerId);
    } else if (dragPointerId === null && event.pointerType === "mouse" && event.button === 0) {
      dragPointerId = event.pointerId;
      dragStartX = event.clientX;
      dragStartScroll = clientSlider.scrollLeft;
    }
    schedule();
  });

  clientSlider.addEventListener("pointermove", (event) => {
    if (event.pointerId !== dragPointerId) return;

    const distance = event.clientX - dragStartX;
    if (!ignorePointerClick) {
      if (Math.abs(distance) <= 5) return;
      ignorePointerClick = true;
      clientSlider.classList.add("is-dragging");
      clientSlider.setPointerCapture(event.pointerId);
    }
    clientSlider.scrollLeft = dragStartScroll - distance;
  });

  function endPointer(event) {
    const touched = touchPointers.delete(event.pointerId);
    if (touched) touchReadyAt = performance.now() + interval;

    if (event.pointerId === dragPointerId) {
      dragPointerId = null;
      clientSlider.classList.remove("is-dragging");
    } else if (!touched) {
      return;
    }
    schedule();
  }

  window.addEventListener("pointerup", endPointer);
  window.addEventListener("pointercancel", endPointer);
  clientSlider.addEventListener("lostpointercapture", endPointer);
  clientSlider.addEventListener("click", (event) => {
    if (ignorePointerClick && event.detail > 0) {
      event.preventDefault();
      ignorePointerClick = false;
    }
  }, { capture: true });

  clientSlider.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();
    const direction = event.key === "ArrowLeft" ? -1 : 1;
    const index = cards.indexOf(event.target);
    if (index >= 0) {
      cards[index + direction]?.focus();
    } else {
      step(direction);
    }
  });

  updateToggle();
}

document.querySelectorAll(".has-sub").forEach((item) => {
  const parentLink = item.firstElementChild;
  item.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    parentLink.focus();
    item.classList.add("is-dismissed");
  });
  item.addEventListener("pointerleave", () => {
    if (!item.contains(document.activeElement)) item.classList.remove("is-dismissed");
  });
  item.addEventListener("focusout", () => queueMicrotask(() => {
    if (!item.contains(document.activeElement)) item.classList.remove("is-dismissed");
  }));
});

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
