const bg = document.querySelector('.light-bg');

window.addEventListener('scroll', () => {
  if (!bg) return;

  const rect = bg.parentElement.getBoundingClientRect();
  const offset = -rect.top * 0.25;

  bg.style.transform = `translateY(${offset}px)`;
});
