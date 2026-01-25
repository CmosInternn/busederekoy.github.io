const modal = document.getElementById('workModal');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalCounter = document.getElementById('modalCounter');
const modalClose = document.getElementById('modalClose');
const overlay = modal.querySelector('.modal-overlay');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let images = [];
let currentIndex = 0;

document.querySelectorAll('.work-card').forEach(card => {
  const title = card.dataset.title;
  const dataImages = card.dataset.images.split(',').map(i => i.trim());
    console.log(dataImages);
  const mainImg = card.querySelector('.work-image > img');
  mainImg.addEventListener('click', () => {
    openModal(title, dataImages, 0);
  });

  const thumbs = card.querySelectorAll('.thumbs img');
  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(title, dataImages, index); 
    });
  });
});

function openModal(title, imgs, startIndex) {
  images = imgs;
  currentIndex = startIndex;

  modalTitle.textContent = title;
  modalImage.src = images[currentIndex];
  updateCounter();

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  modalImage.src = images[currentIndex];
  updateCounter();
});

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % images.length;
  modalImage.src = images[currentIndex];
  updateCounter();
});

function updateCounter() {
  modalCounter.textContent = `${currentIndex + 1} / ${images.length}`;
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeModal();
  }
});
