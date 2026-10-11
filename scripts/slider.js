
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".portfolio-marquee");
  const slider = document.getElementById("portfolioSlider");
  const track = document.getElementById("portfolioTrack");

  if (!section || !slider || !track) return;

  const previousButton = section.querySelector(".portfolio-prev");
  const nextButton = section.querySelector(".portfolio-next");
  const toggleButton = section.querySelector(".portfolio-toggle");
  const toggleIcon = toggleButton?.querySelector(".portfolio-toggle-icon");

  if (!previousButton || !nextButton || !toggleButton || !toggleIcon) {
    return;
  }

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const originalSlides = Array.from(track.children);

  if (!originalSlides.length) return;

  // Kesintisiz geçiş için kartları çoğalt.
  originalSlides.forEach((slide, index) => {
    const clone = slide.cloneNode(true);

    clone.setAttribute("aria-hidden", "true");
    clone.dataset.clone = "true";

    // Kopyalanan kartlardaki bağlantılar
    // klavye ile tekrar odaklanmasın.
    clone.querySelectorAll("a").forEach((link) => {
      link.setAttribute("tabindex", "-1");
    });

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
  let activePointerId = null;
  let pointerMoved = false;

  let lastFrameTime = performance.now();
  let nudgeDistance = 0;

  const speed = 42;
  const dragThreshold = 6;

  function calculateDimensions() {
    const firstSlide = track.children[0];
    const secondSlide = track.children[1];
    const firstClone = track.querySelector(
      '[data-first-clone="true"]'
    );

    if (!firstSlide || !firstClone) return;

    loopWidth =
      firstClone.offsetLeft - firstSlide.offsetLeft;

    if (secondSlide) {
      cardStep =
        secondSlide.offsetLeft - firstSlide.offsetLeft;
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

    if (Math.abs(nudgeDistance) > 0.1) {
      const movement =
        nudgeDistance * Math.min(1, deltaTime * 9);

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

  // DRAG İŞLEMLERİ

  function startDragging(event) {
    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    // Bir pointer işlemi zaten aktifse yeniden başlatma.
    if (activePointerId !== null) return;

    activePointerId = event.pointerId;
    isDragging = true;
    pointerMoved = false;

    pointerStartX = event.clientX;
    dragStartPosition = position;
    nudgeDistance = 0;

    // ÖNEMLİ:
    // Burada setPointerCapture kullanmıyoruz.
    // Böylece normal link tıklamaları engellenmez.
  }

  function dragSlider(event) {
    if (
      !isDragging ||
      event.pointerId !== activePointerId
    ) {
      return;
    }

    const dragDistance =
      event.clientX - pointerStartX;

    // Sadece belirli bir mesafeden sonra
    // hareketi gerçek sürükleme kabul et.
    if (Math.abs(dragDistance) > dragThreshold) {
      pointerMoved = true;
    }

    if (!pointerMoved) return;

    slider.classList.add("is-dragging");

    position = dragStartPosition - dragDistance;

    normalizePosition();
    render();
  }

  function stopDragging(event) {
    if (event.pointerId !== activePointerId) {
      return;
    }

    isDragging = false;
    activePointerId = null;

    slider.classList.remove("is-dragging");
  }

  slider.addEventListener("pointerdown", startDragging);
  slider.addEventListener("pointermove", dragSlider);
  slider.addEventListener("pointerup", stopDragging);
  slider.addEventListener("pointercancel", stopDragging);
  slider.addEventListener("pointerleave", stopDragging);

  // LİNK TIKLAMA DÜZELTMESİ
  // Gerçek sürükleme olduysa link açılmasını engelle.
  // Normal tıklamalarda tarayıcı linki açar.

  slider.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest("a");

      if (!link) return;

      if (pointerMoved && event.detail !== 0) {
        event.preventDefault();
        event.stopPropagation();
      }

      pointerMoved = false;
    },
    true
  );

  // HOVER KONTROLÜ

  slider.addEventListener("mouseenter", () => {
    isHoverPaused = true;
  });

  slider.addEventListener("mouseleave", () => {
    isHoverPaused = false;
  });

  // KLAVYE ODAK KONTROLÜ

  section.addEventListener("focusin", () => {
    isFocusPaused = true;
  });

  section.addEventListener("focusout", (event) => {
    if (!section.contains(event.relatedTarget)) {
      isFocusPaused = false;
    }
  });

  // BUTONLAR

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

  // RESPONSIVE

  window.addEventListener(
    "resize",
    calculateDimensions
  );

  // ERİŞİLEBİLİRLİK

  reducedMotionQuery.addEventListener(
    "change",
    (event) => {
      if (event.matches) {
        isPlaying = false;
      }

      updateToggleButton();
    }
  );

  // GÖRSELLER YÜKLENDİKTEN SONRA ÖLÇÜLERİ HESAPLA

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
