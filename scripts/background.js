  const lights = document.querySelectorAll('.bg-light');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    lights.forEach((light, index) => {
      const speed = (index + 1) * 0.15; // her ışık farklı hızda
      light.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });