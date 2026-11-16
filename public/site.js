// Automatyczne ładowanie galerii realizacji na stronie głównej
async function loadGallery() {
  try {
    const res = await fetch('/api/gallery');
    const images = await res.json();
    const galleryContainer = document.getElementById('gallery');
    
    if (!galleryContainer) return;

    if (!images || images.length === 0) {
      galleryContainer.innerHTML = '<div class="gallery-empty">Wkrótce pojawią się tutaj zdjęcia naszych realizacji.</div>';
      return;
    }

    galleryContainer.innerHTML = images.map(img => `
      <div class="gallery-item" style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #2a2a2a;">
        <img src="${img.url}" alt="Realizacja CARSPA KATO" style="width: 100%; height: 220px; object-fit: cover; border-radius: 4px;">
      </div>
    `).join('');
  } catch (err) {
    console.error("Błąd ładowania galerii:", err);
  }
}

document.addEventListener('DOMContentLoaded', loadGallery);
