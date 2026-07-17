document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".portfolio-marquee");
  const slider = document.getElementById("portfolioSlider");
  const track = document.getElementById("portfolioTrack");

  const previousButton = section.querySelector(".portfolio-prev");
  const nextButton = section.querySelector(".portfolio-next");
  const toggleButton = section.querySelector(".portfolio-toggle");
  const toggleIcon = toggleButton.querySelector(".portfolio-toggle-icon");

  if (!section || !slider || !track) return;

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const originalSlides = Array.from(track.children);

  if (!originalSlides.length) return;

  // Kesintisiz geçiş için kartları otomatik olarak çoğaltır.
  originalSlides.forEach((slide, index) => {
    const clone = slide.cloneNode(true);

    clone.setAttribute("aria-hidden", "true");
    clone.dataset.clone = "true";

    if (index === 0) {
      clone.dataset.firstClone = "true";
    }

    track.appendChild(clone);
  });

  let position = 0;
  let loopWidth = 0;
  let cardStep = 0;

  let isPlaying = !reducedMotionQuery.matches;
  let isHoverPaused = false;
  let isFocusPaused = false;
  let isDragging = false;

  let pointerStartX = 0;
  let dragStartPosition = 0;

  let lastFrameTime = performance.now();
  let nudgeDistance = 0;

  const speed = 42;

  function calculateDimensions() {
    const firstSlide = track.children[0];
    const secondSlide = track.children[1];
    const firstClone = track.querySelector('[data-first-clone="true"]');

    if (!firstSlide || !firstClone) return;

    loopWidth =
      firstClone.offsetLeft -
      firstSlide.offsetLeft;

    if (secondSlide) {
      cardStep =
        secondSlide.offsetLeft -
        firstSlide.offsetLeft;
    } else {
      cardStep = firstSlide.offsetWidth;
    }

    normalizePosition();
    render();
  }

  function normalizePosition() {
    if (!loopWidth) return;

    while (position >= loopWidth) {
      position -= loopWidth;
    }

    while (position < 0) {
      position += loopWidth;
    }
  }

  function render() {
    track.style.transform =
      `translate3d(${-position}px, 0, 0)`;
  }

  function sliderShouldMove() {
    return (
      isPlaying &&
      !isHoverPaused &&
      !isFocusPaused &&
      !isDragging &&
      !reducedMotionQuery.matches
    );
  }

  function updateToggleButton() {
    const isPaused = !isPlaying;

    toggleButton.setAttribute(
      "aria-pressed",
      String(isPaused)
    );

    toggleButton.setAttribute(
      "aria-label",
      isPaused
        ? "Otomatik kaydırmayı başlat"
        : "Otomatik kaydırmayı durdur"
    );

    toggleIcon.textContent = isPaused ? "▶" : "Ⅱ";
    section.classList.toggle("is-paused", isPaused);
  }

  function animate(timestamp) {
    const deltaTime = Math.min(
      (timestamp - lastFrameTime) / 1000,
      0.05
    );

    lastFrameTime = timestamp;

    if (sliderShouldMove()) {
      position += speed * deltaTime;
    }

    /*
     * Önceki/sonraki butonlarına basıldığında oluşan
     * hareketi yumuşak şekilde uygular.
     */
    if (Math.abs(nudgeDistance) > 0.1) {
      const movement =
        nudgeDistance *
        Math.min(1, deltaTime * 9);

      position += movement;
      nudgeDistance -= movement;
    } else {
      nudgeDistance = 0;
    }

    normalizePosition();
    render();

    requestAnimationFrame(animate);
  }

  function goToPreviousSlide() {
    nudgeDistance -= cardStep;
  }

  function goToNextSlide() {
    nudgeDistance += cardStep;
  }

  function toggleAutoPlay() {
    isPlaying = !isPlaying;
    updateToggleButton();
  }

  function startDragging(event) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    isDragging = true;
    pointerStartX = event.clientX;
    dragStartPosition = position;
    nudgeDistance = 0;

    slider.classList.add("is-dragging");
    slider.setPointerCapture(event.pointerId);
  }

  function dragSlider(event) {
    if (!isDragging) return;

    const dragDistance =
      event.clientX -
      pointerStartX;

    position =
      dragStartPosition -
      dragDistance;

    normalizePosition();
    render();
  }

  function stopDragging(event) {
    if (!isDragging) return;

    isDragging = false;
    slider.classList.remove("is-dragging");

    if (slider.hasPointerCapture(event.pointerId)) {
      slider.releasePointerCapture(event.pointerId);
    }
  }

  slider.addEventListener("pointerdown", startDragging);
  slider.addEventListener("pointermove", dragSlider);
  slider.addEventListener("pointerup", stopDragging);
  slider.addEventListener("pointercancel", stopDragging);
  slider.addEventListener("pointerleave", stopDragging);

  slider.addEventListener("mouseenter", () => {
    isHoverPaused = true;
  });

  slider.addEventListener("mouseleave", () => {
    isHoverPaused = false;
  });

  section.addEventListener("focusin", () => {
    isFocusPaused = true;
  });

  section.addEventListener("focusout", (event) => {
    if (!section.contains(event.relatedTarget)) {
      isFocusPaused = false;
    }
  });

  previousButton.addEventListener(
    "click",
    goToPreviousSlide
  );

  nextButton.addEventListener(
    "click",
    goToNextSlide
  );

  toggleButton.addEventListener(
    "click",
    toggleAutoPlay
  );

  window.addEventListener(
    "resize",
    calculateDimensions
  );

  reducedMotionQuery.addEventListener("change", (event) => {
    if (event.matches) {
      isPlaying = false;
    }

    updateToggleButton();
  });

  /*
   * Görseller yüklendikten sonra ölçüleri tekrar hesaplar.
   * Böylece ilk geçişte boşluk veya sıçrama oluşmaz.
   */
  const images = track.querySelectorAll("img");

  Promise.all(
    Array.from(images).map((image) => {
      if (image.complete) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        image.addEventListener("load", resolve, {
          once: true
        });

        image.addEventListener("error", resolve, {
          once: true
        });
      });
    })
  ).then(calculateDimensions);

  calculateDimensions();
  updateToggleButton();
  requestAnimationFrame(animate);
});
