document.addEventListener("DOMContentLoaded", () => {
  const projects = document.querySelectorAll(".project-showcase");

  const modal = document.getElementById("projectModal");
  const modalTitle = document.getElementById("projectModalTitle");
  const modalStage = document.getElementById("projectModalStage");
  const modalCounter = modal.querySelector(".project-modal-counter");
  const closeButton = modal.querySelector(".project-modal-close");
  const previousButton = modal.querySelector(".project-modal-prev");
  const nextButton = modal.querySelector(".project-modal-next");

  let currentGallery = [];
  let currentIndex = 0;
  let lastFocusedElement = null;

  function pauseAllProjectVideos(activeVideo = null) {
    document.querySelectorAll(".project-video").forEach((video) => {
      if (video === activeVideo) return;

      video.pause();

      const card = video.closest(".project-showcase");
      const button = card?.querySelector(".project-play");
      const icon = button?.querySelector(".play-icon");

      button?.classList.remove("is-playing");

      if (button) {
        button.setAttribute("aria-label", "Videoyu oynat");
      }

      if (icon) {
        icon.textContent = "▶";
      }
    });
  }

  function getProjectGallery(project) {
    const videoSource = project.dataset.video;
    const posterSource = project.dataset.poster;

    const imageSources = project.dataset.images
      .split(",")
      .map((source) => source.trim())
      .filter(Boolean);

    const gallery = [];

    if (videoSource) {
      gallery.push({
        type: "video",
        src: videoSource,
        poster: posterSource
      });
    }

    imageSources.forEach((source) => {
      gallery.push({
        type: "image",
        src: source
      });
    });

    return gallery;
  }

  function renderModalMedia() {
    const media = currentGallery[currentIndex];

    modalStage.replaceChildren();

    if (!media) return;

    if (media.type === "video") {
      const video = document.createElement("video");

      video.src = media.src;
      video.poster = media.poster || "";
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;

      modalStage.appendChild(video);
    } else {
      const image = document.createElement("img");

      image.src = media.src;
      image.alt = `${modalTitle.textContent} proje görseli`;

      modalStage.appendChild(image);
    }

    modalCounter.textContent =
      `${String(currentIndex + 1).padStart(2, "0")} / ` +
      `${String(currentGallery.length).padStart(2, "0")}`;

    const hasMultipleItems = currentGallery.length > 1;

    previousButton.hidden = !hasMultipleItems;
    nextButton.hidden = !hasMultipleItems;
  }

  function openProjectModal(project, index = 0, trigger = null) {
    pauseAllProjectVideos();

    currentGallery = getProjectGallery(project);
    currentIndex = Math.min(index, currentGallery.length - 1);

    modalTitle.textContent = project.dataset.title;
    lastFocusedElement = trigger;

    renderModalMedia();

    document.documentElement.classList.add("modal-is-open");

    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
  }

  function closeProjectModal() {
    modalStage.replaceChildren();
    document.documentElement.classList.remove("modal-is-open");

    if (typeof modal.close === "function") {
      modal.close();
    } else {
      modal.removeAttribute("open");
      lastFocusedElement?.focus();
    }
  }

  function showPreviousMedia() {
    currentIndex =
      (currentIndex - 1 + currentGallery.length) %
      currentGallery.length;

    renderModalMedia();
  }

  function showNextMedia() {
    currentIndex =
      (currentIndex + 1) %
      currentGallery.length;

    renderModalMedia();
  }

  projects.forEach((project) => {
    const video = project.querySelector(".project-video");
    const playButton = project.querySelector(".project-play");
    const playIcon = playButton.querySelector(".play-icon");
    const expandButton = project.querySelector(".project-expand");
    const detailButton = project.querySelector(".project-detail-button");
    const thumbnails = project.querySelectorAll(".project-thumbnail");

    playButton.addEventListener("click", async () => {
      if (video.paused) {
        pauseAllProjectVideos(video);

        try {
          await video.play();

          playButton.classList.add("is-playing");
          playButton.setAttribute("aria-label", "Videoyu duraklat");
          playIcon.textContent = "Ⅱ";
        } catch (error) {
          console.warn("Video oynatılamadı:", error);
        }
      } else {
        video.pause();

        playButton.classList.remove("is-playing");
        playButton.setAttribute("aria-label", "Videoyu oynat");
        playIcon.textContent = "▶";
      }
    });

    video.addEventListener("ended", () => {
      playButton.classList.remove("is-playing");
      playButton.setAttribute("aria-label", "Videoyu oynat");
      playIcon.textContent = "▶";
    });

    expandButton.addEventListener("click", () => {
      openProjectModal(project, 0, expandButton);
    });

    detailButton.addEventListener("click", () => {
      openProjectModal(project, 0, detailButton);
    });

    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", () => {
        const index = Number(thumbnail.dataset.index);

        openProjectModal(project, index, thumbnail);
      });
    });
  });

  previousButton.addEventListener("click", showPreviousMedia);
  nextButton.addEventListener("click", showNextMedia);
  closeButton.addEventListener("click", closeProjectModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeProjectModal();
    }
  });

  modal.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      showPreviousMedia();
    }

    if (event.key === "ArrowRight") {
      showNextMedia();
    }
  });

  modal.addEventListener("close", () => {
    modalStage.replaceChildren();
    document.documentElement.classList.remove("modal-is-open");
    lastFocusedElement?.focus();
  });
});
