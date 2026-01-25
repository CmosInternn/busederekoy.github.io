import { animateSlider } from './slider.js';
import { animateCanvas} from './canvas.js';

export function animate()
{
  animateSlider();
  animateCanvas();
  requestAnimationFrame(animate);
}

animate();