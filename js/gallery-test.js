const gallery = document.querySelector('#test-gallery');
const lightbox = document.querySelector('.lightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const lightboxCount = document.querySelector('.lightbox-count');
const photos = [];
let currentIndex = 0;
let resizeTimer;

function showImage(index) {
  currentIndex = (index + photos.length) % photos.length;
  const photo = photos[currentIndex];
  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.alt;
  lightboxCount.textContent = `${currentIndex + 1} / ${photos.length}`;
  lightbox.hidden = false;
  document.body.classList.add('lightbox-open');
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove('lightbox-open');
}

function columnCount() {
  if (window.innerWidth <= 700) return 1;
  if (window.innerWidth <= 1000) return 2;
  return 3;
}

function renderGallery() {
  gallery.replaceChildren();

  const columns = Array.from({ length: columnCount() }, () => {
    const column = document.createElement('div');
    column.className = 'masonry-column';
    gallery.append(column);
    return column;
  });

  const heights = columns.map(() => 0);

  photos.forEach((photo, index) => {
    const figure = document.createElement('figure');
    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = photo.alt;
    image.loading = 'lazy';
    image.addEventListener('click', () => showImage(index));
    figure.append(image);

    const shortestColumn = heights.indexOf(Math.min(...heights));
    columns[shortestColumn].append(figure);
    heights[shortestColumn] += photo.height / photo.width;
  });
}

fetch('images.json')
  .then((response) => response.json())
  .then((items) => {
    photos.push(...items);
    return Promise.all(photos.map((photo) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        photo.width = image.naturalWidth;
        photo.height = image.naturalHeight;
        resolve();
      };
      image.onerror = resolve;
      image.src = photo.src;
    })));
  })
  .then(renderGallery)
  .catch(() => {
    gallery.textContent = 'The gallery could not be loaded.';
  });

window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(renderGallery, 150);
});

document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
document.querySelector('.lightbox-prev').addEventListener('click', () => showImage(currentIndex - 1));
document.querySelector('.lightbox-next').addEventListener('click', () => showImage(currentIndex + 1));

document.addEventListener('keydown', (event) => {
  if (lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
  if (event.key === 'ArrowRight') showImage(currentIndex + 1);
});
