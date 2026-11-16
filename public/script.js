<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CARSPA KATO | Studio Detailingu</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <header class="main-header">
        <div class="logo">CARSPA KATO</div>
        <nav class="main-nav">
            <a href="#uslugi">Usługi</a>
            <a href="#galeria">Galeria</a>
            <a href="#kontakt">Kontakt</a>
            <a href="/admin.html" class="admin-link">Panel Admina</a>
        </nav>
    </header>

    <section class="hero">
        <h1>PROFESJONALNY DETAILING SAMOCHODOWY</h1>
        <p>Zadbaj o swój samochód na najwyższym poziomie w Katowicach.</p>
        <a href="#kontakt" class="primary-btn">Zarezerwuj wizytę</a>
    </section>

    <section id="uslugi" class="section">
        <h2>USŁUGI I CENNIK</h2>
        <div id="servicesPublicGrid" class="services-grid">
            <p class="muted">Ładowanie usług...</p>
        </div>
    </section>

    <section id="galeria" class="section dark-bg">
        <h2>GALERIA REALIZACJI</h2>
        <div id="galleryGrid" class="gallery-grid">
            <p class="muted">Wkrótce pojawią się tutaj zdjęcia naszych realizacji.</p>
        </div>
    </section>

    <section id="kontakt" class="section">
        <h2>SKONTAKTUJ SIĘ Z NAMI</h2>
        <form id="contactForm" class="contact-form">
            <label>Imię i nazwisko <input name="name" required></label>
            <label>Telefon <input name="phone" required></label>
            <label>Adres e-mail <input name="email" type="email" required></label>
            <label>Wybierz usługę 
                <select name="service_id" id="contactServiceSelect">
                    <option value="">Wybierz usługę...</option>
                </select>
            </label>
            <label>Wiadomość / Preferowany termin <textarea name="message" placeholder="Napisz wiadomość..."></textarea></label>
            <button type="submit" class="primary-btn">Wyślij zgłoszenie</button>
            <p id="contactMsg" class="success-msg"></p>
        </form>
    </section>

    <footer class="main-footer">
        <p>&copy; 2026 CARSPA KATO. Wszelkie prawa zastrzeżone.</p>
    </footer>

    <script src="/script.js"></script>
</body>
</html>
