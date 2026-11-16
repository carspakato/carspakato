document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch('/api/public-data');
    const data = await res.json();

    // 1. Ładowanie galerii na stronie głównej
    const galleryContainer = document.querySelector('#galleryGrid');
    if (galleryContainer) {
      if (data.gallery && data.gallery.length > 0) {
        galleryContainer.innerHTML = data.gallery.map(g => `
          <div class="gallery-item">
            <img src="/uploads/${encodeURIComponent(g.filename)}" alt="${g.caption || 'Realizacja CARSPA KATO'}">
            ${g.caption ? `<p>${g.caption}</p>` : ''}
          </div>
        `).join('');
      } else {
        galleryContainer.innerHTML = '<p class="muted">Wkrótce pojawią się tutaj zdjęcia naszych realizacji.</p>';
      }
    }

    // 2. Ładowanie usług i cennika
    const servicesContainer = document.querySelector('#servicesPublicGrid');
    const serviceSelect = document.querySelector('#contactServiceSelect');

    if (data.services && data.services.length > 0) {
      if (servicesContainer) {
        servicesContainer.innerHTML = data.services.map(s => `
          <div class="service-card">
            <h3>${s.name}</h3>
            <p class="price">${s.price}</p>
            <p>${s.description || ''}</p>
            <span class="duration">Czas: ${s.duration || 'ustalany indywidualnie'}</span>
          </div>
        `).join('');
      }

      if (serviceSelect) {
        data.services.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.name;
          opt.textContent = `${s.name} (${s.price})`;
          serviceSelect.appendChild(opt);
        });
      }
    }
  } catch (err) {
    console.error("Błąd ładowania danych publicznych:", err);
  }

  // 3. Obsługa formularza kontaktowego / rezerwacji na stronie głównej
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(e.currentTarget));
      try {
        const r = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const result = await r.json();
        if (!r.ok) throw new Error(result.message || "Błąd wysyłania.");
        
        document.querySelector('#contactMsg').textContent = "Wiadomość została wysłana pomyślnie!";
        contactForm.reset();
      } catch (err) {
        document.querySelector('#contactMsg').textContent = err.message;
      }
    });
  }
});
