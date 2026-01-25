export const track = document.getElementById('atrack');

export let position = 0;
export const speed = 1; 

export function animateSlider() {
  position -= speed;

  const trackWidth = track.scrollWidth / 2;

  if (Math.abs(position) >= trackWidth) {
    position = 0;
  }
  track.style.transform = `translateX(${position}px)`;
}

