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

  const services = [
    { id: 1, name: "Mycie – Premium wash", description: "Dokładne, bezpieczne mycie wstępne i właściwe.", price: "od 200 zł", duration: "2-3 godz." },
    { id: 2, name: "Mycie – Detailing wnętrza", description: "Dokładne czyszczenie i pielęgnacja elementów wnętrza.", price: "od 300 zł", duration: "4-6 godz." },
    { id: 3, name: "Podstawowe sprzątanie wnętrza", description: "Szybkie odświeżenie i odkurzenie kabiny.", price: "od 100 zł", duration: "1-2 godz." },
    { id: 4, name: "Pranie kompleksowe tapicerki", description: "Głębokie czyszczenie wszystkich elementów materiałowych.", price: "od 400 zł", duration: "1 dzień" },
    { id: 5, name: "Korekty lakieru", description: "Odświeżenie lakieru, usunięcie rys i poprawa połysku.", price: "od 600 zł", duration: "1 dzień" },
    { id: 6, name: "Zabezpieczenie karoserii woskiem", description: "Aplikacja trwałego wosku nadającego głęboki połysk.", price: "od 300 zł", duration: "3-4 godz." },
    { id: 7, name: "Zabezpieczenie karoserii powłoką ceramiczną", description: "Trwała ochrona lakieru przed czynnikami zewnętrznymi.", price: "od 700 zł", duration: "1 dzień" },
    { id: 8, name: "Zabezpieczenie lakieru folią PPF", description: "Najwyższy stopień ochrony lakieru przed odpryskami.", price: "do uzgodnienia", duration: "1-3 dni" },
    { id: 9, name: "Zabezpieczenie szyb powłoką ceramiczną", description: "Hydrofobowa niewidzialna wycieraczka.", price: "od 300 zł", duration: "2 godz." },
    { id: 10, name: "Renowacja reflektorów", description: "Usunięcie zmatowień i przywrócenie przejrzystości.", price: "od 100 zł/szt", duration: "1-2 godz." },
    { id: 11, name: "Ozonowanie wnętrza", description: "Dezynfekcja i neutralizacja przykrych zapachów.", price: "od 250 zł", duration: "1 godz." },
    { id: 12, name: "Przygotowanie auta hatchback do sprzedaży", description: "Kompleksowy detailing podnoszący wartość rynkową auta.", price: "od 600 zł", duration: "1 dzień" },
    { id: 13, name: "Przygotowanie auta combi do sprzedaży", description: "Kompleksowe odświeżenie wersji kombi przed sprzedażą.", price: "od 800 zł", duration: "1 dzień" },
    { id: 14, name: "Przygotowanie auta SUV do sprzedaży", description: "Pełny pakiet przygotowawczy dla dużych aut typu SUV.", price: "od 1 000 zł", duration: "1-2 dni" }
  ];

  // Kafelki usług – tylko nazwa i opis (bez cen i czasu)
  const servicesContainer = document.querySelector("#services");
  if (servicesContainer) {
    servicesContainer.innerHTML = services.map(s => `
      <article class="service-card">
        <h3>${s.name}</h3>
        <p>${s.description}</p>
      </article>
    `).join("");
  }

  // Cennik (tutaj ceny zostają, żeby klient widział koszty)
  const priceList = document.querySelector("#priceList");
  if (priceList) {
    priceList.innerHTML = services.map(s => `
      <div class="price-row">
        <span>${s.name}</span>
        <strong>${s.price}</strong>
      </div>
    `).join("");
  }

  const serviceSelect = document.querySelector("#serviceSelect");
  if (serviceSelect) {
    serviceSelect.innerHTML = '<option value="">Wybierz usługę</option>' + services.map(s => `
      <option value="${s.id}">${s.name} - ${s.price}</option>
    `).join("");
  }

  const bookingForm = document.querySelector("#bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", async e => {
      e.preventDefault();
      const msg = document.querySelector("#formMessage");
      if (msg) msg.textContent = "Wysyłanie zgłoszenia...";
      try {
        const formData = new FormData(bookingForm);
        const dataObj = Object.fromEntries(formData.entries());
        dataObj.consent = formData.get("consent") === "on";

        const res = await fetch("/api/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataObj)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Nie udało się wysłać");
        
        if (msg) msg.textContent = "Dziękujemy! Zgłoszenie zostało wysłane.";
        bookingForm.reset();
      } catch (err) {
        if (msg) msg.textContent = err.message;
      }
    });
  }

  const dateInput = document.querySelector('input[name="preferred_date"]');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }
});
