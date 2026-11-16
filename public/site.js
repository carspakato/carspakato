document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector("#menuToggle");
  const nav = document.querySelector("#nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => nav.classList.toggle("open"));
    nav.querySelectorAll("a").forEach(a => 
      a.addEventListener("click", () => nav.classList.remove("open"))
    );
  }

  const yearEl = document.querySelector("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Główne usługi odpowiadające podstronom i formularzowi
  const services = [
    { id: 1, name: "Detailing zewnętrzny", description: "Kompleksowe, bezpieczne mycie i wieloetapowe odświeżenie karoserii.", link: "/detailing-zewnetrzny.html" },
    { id: 2, name: "Detailing wewnętrzny", description: "Dogłębne czyszczenie kabiny, pranie tapicerki i impregnacja.", link: "/detailing-wewnetrzny.html" },
    { id: 3, name: "Korekty lakieru", description: "Usuwanie rys, hologramów i przywracanie głębokiego połysku.", link: "/korekty-lakieru.html" },
    { id: 4, name: "Ochrona lakieru", description: "Powłoki ceramiczne i grafenowe zabezpieczające lakier.", link: "/ochrona-lakieru.html" },
    { id: 5, name: "Zabezpieczenie lakieru", description: "Folie ochronne bezbarwne lub kolorowe z 10-letnią gwarancją.", link: "/zabezpieczenie-lakieru.html" },
    { id: 6, name: "Zmiana koloru auta", description: "Folie PPF kolorowe oraz folie winylowe (wrapy) + stylizacja wnętrza.", link: "/zmiana-koloru-auta.html" }
  ];

  // Przywrócenie kafelków usług na stronie głównej
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
