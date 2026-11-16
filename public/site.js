document.addEventListener("DOMContentLoaded", () => {
  // Obsługa menu mobilnego
  const menuToggle = document.querySelector("#menuToggle");
  const nav = document.querySelector("#nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => nav.classList.toggle("open"));
    nav.querySelectorAll("a").forEach(a => {
      if (!a.closest('.nav-dropdown')) {
        a.addEventListener("click", () => nav.classList.remove("open"));
      }
    });
  }

  // Obsługa rozwijanego menu "Usługi" na desktopie i mobile
  const servicesDropdownBtn = document.getElementById('servicesDropdownBtn');
  const servicesDropdownMenu = document.getElementById('servicesDropdownMenu');
  if (servicesDropdownBtn && servicesDropdownMenu) {
    servicesDropdownBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      servicesDropdownMenu.classList.toggle('show');
    });

    servicesDropdownMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        servicesDropdownMenu.classList.remove('show');
        if (nav) nav.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!servicesDropdownMenu.contains(e.target) && e.target !== servicesDropdownBtn) {
        servicesDropdownMenu.classList.remove('show');
      }
    });
  }

  // Rok w stopce
  const yearEl = document.querySelector("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Definicja 6 głównych usług do kafelków na stronie głównej
  const services = [
    { name: "Detailing zewnętrzny", description: "Kompleksowe, bezpieczne mycie i wieloetapowe odświeżenie karoserii.", link: "/detailing-zewnetrzny.html" },
    { name: "Detailing wewnętrzny", description: "Dogłębne czyszczenie kabiny, pranie tapicerki i impregnacja.", link: "/detailing-wewnetrzny.html" },
    { name: "Korekty lakieru", description: "Usuwanie rys, hologramów i przywracanie głębokiego połysku.", link: "/korekty-lakieru.html" },
    { name: "Ochrona lakieru", description: "Powłoki ceramiczne i grafenowe zabezpieczające lakier.", link: "/ochrona-lakieru.html" },
    { name: "Zabezpieczenie lakieru", description: "Folie ochronne bezbarwne lub kolorowe z 10-letnią gwarancją.", link: "/zabezpieczenie-lakieru.html" },
    { name: "Zmiana koloru auta", description: "Folie PPF kolorowe oraz folie winylowe (wrapy) + stylizacja wnętrza.", link: "/zmiana-koloru-auta.html" }
  ];

  // Renderowanie kafelków usług na stronie głównej
  const servicesContainer = document.querySelector("#services");
  if (servicesContainer) {
    servicesContainer.innerHTML = services.map(s => `
      <article class="service-card" style="cursor: pointer;" onclick="window.location.href='${s.link}'">
        <h3>${s.name}</h3>
        <p>${s.description}</p>
        <span style="display: inline-block; margin-top: 12px; color: #ccff00; font-size: 14px; font-weight: 600;">Sprawdź szczegóły →</span>
      </article>
    `).join("");
  }

  // Pobieranie danych galerii i ustawień kontaktowych
  async function loadHomePageData() {
    try {
      const res = await fetch('/api/gallery');
      const images = await res.json();
      const grid = document.getElementById('gallery');
      if (grid && images && images.length > 0) {
        grid.innerHTML = images.map(img => `
          <div style="border-radius: 8px; overflow: hidden; background: #181818; border: 1px solid #333; cursor: pointer;" onclick="openLightbox('${img.url}')">
            <img src="${img.url}" alt="Realizacja CARSPA KATO" style="width: 100%; height: 240px; object-fit: cover; display: block;">
          </div>
        `).join('');
      }
    } catch (err) {
      console.error("Błąd ładowania galerii:", err);
    }

    try {
      const res = await fetch('/api/settings');
      const settings = await res.json();
      if (settings) {
        if (settings.phone) {
          const phoneEl = document.getElementById('contactPhone');
          if (phoneEl) {
            phoneEl.textContent = settings.phone;
            phoneEl.href = `tel:${settings.phone.replace(/\s+/g, '')}`;
          }
        }
        if (settings.email) {
          const emailEl = document.getElementById('contactEmail');
          if (emailEl) {
            emailEl.textContent = settings.email;
            emailEl.href = `mailto:${settings.email}`;
          }
        }
        if (settings.address) {
          const addressEl = document.getElementById('contactAddress');
          if (addressEl) addressEl.textContent = settings.address;
        }
      }
    } catch (err) {
      console.error("Błąd ładowania ustawień:", err);
    }
  }

  loadHomePageData();

  // Obsługa formularza rezerwacji
  const bookingForm = document.querySelector("#bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", async e => {
      e.preventDefault();
      const msg = document.querySelector("#formMessage");
      if (msg) {
        msg.textContent = "Wysyłanie zgłoszenia...";
        msg.style.color = "#ccff00";
      }
      try {
        const formData = new FormData(bookingForm);
        const dataObj = Object.fromEntries(formData.entries());
        dataObj.consent = formData.get("consent") === "on";

        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataObj)
        });
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error("Nie udało się wysłać zgłoszenia");
        
        if (msg) {
          msg.textContent = "Zgłoszenie zostało wysłane pomyślnie! Skontaktujemy się wkrótce.";
          msg.style.color = "#ccff00";
        }
        bookingForm.reset();
      } catch (err) {
        if (msg) {
          msg.textContent = "Błąd podczas wysyłania. Spróbuj ponownie.";
          msg.style.color = "#ff4d4d";
        }
      }
    });
  }
});
