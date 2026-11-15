Const express = require("express");
Const path = require("path");
Const nodemailer = require("nodemailer");

Const app = express();
Const PORT = process.env.PORT || 3000;
Const ROOT = __dirname;

// Konfiguracja poczty home.pl dla Car Spa Kato
Const transporter = nodemailer.createTransport({
  Host: "poczta2686890.home.pl",
  Port: 465, // lub 587 dla TLS
  Secure: true, // true dla portu 465, false dla 587
  Auth: {
    User: "kontakt@carspakato.pl",
    Pass: process.env.MAIL_PASS || "TUTAJ_WPISZ_HASLO" // Zmień lub ustaw w zmiennych Render
  }
});

App.use(express.urlencoded({ extended: true }));
App.use(express.json());
App.use(express.static(path.join(ROOT, "public")));

Const servicesList = [
  { id:1, name: "Mycie – Premium wash", description: "Dokładne, bezpieczne mycie wstępne i właściwe.", price: "od 200 zł", duration: "2-3 godz." },
  { id:2, name: "Mycie – Detailing wnętrza", description: "Dokładne czyszczenie i pielęgnacja elementów wnętrza.", price: "od 300 zł", duration: "4-6 godz." },
  { id:3, name: "Podstawowe sprzątanie wnętrza", description: "Szybkie odświeżenie i odkurzenie kabiny.", price: "od 100 zł", duration: "1-2 godz." },
  { id:4, name: "Pranie kompleksowe tapicerki", description: "Głębokie czyszczenie wszystkich elementów materiałowych.", price: "od 400 zł", duration: "1 dzień" },
  { id:5, name: "Korekty lakieru", description: "Odświeżenie lakieru, usunięcie rys i poprawa połysku.", price: "od 600 zł", duration: "1 dzień" },
  { id:6, name: "Zabezpieczenie karoserii woskiem", description: "Aplikacja trwałego wosku nadającego głęboki połysk.", price: "od 300 zł", duration: "3-4 godz." },
  { id:7, name: "Zabezpieczenie karoserii powłoką ceramiczną", description: "Trwała ochrona lakieru przed czynnikami zewnętrznymi.", price: "od 700 zł", duration: "1 dzień" },
  { id:8, name: "Zabezpieczenie lakieru folią PPF", description: "Najwyższy stopień ochrony lakieru przed odpryskami.", price: "do uzgodnienia", duration: "1-3 dni" },
  { id:9, name: "Zabezpieczenie szyb powłoką ceramiczną", description: "Hydrofobowa niewidzialna wycieraczka.", price: "od 300 zł", duration: "2 godz." },
  { id:10, name: "Renowacja reflektorów", description: "Usunięcie zmatowień i przywrócenie przejrzystości.", price: "od 100 zł/szt", duration: "1-2 godz." },
  { id:11, name: "Ozonowanie wnętrza", description: "Dezynfekcja i neutralizacja przykrych zapachów.", price: "od 250 zł", duration: "1 godz." },
  { id:12, name: "Przygotowanie auta hatchback do sprzedaży", description: "Kompleksowy detailing podnoszący wartość rynkową auta.", price: "od 600 zł", duration: "1 dzień" },
  { id:13, name: "Przygotowanie auta combi do sprzedaży", description: "Kompleksowe odświeżenie wersji kombi przed sprzedażą.", price: "od 800 zł", duration: "1 dzień" },
  { id:14, name: "Przygotowanie auta SUV do sprzedaży", description: "Pełny pakiet przygotowawczy dla dużych aut typu SUV.", price: "od 1 000 zł", duration: "1-2 dni" }
];

App.get('/api/services', (req, res) => {
  Res.json(servicesList);
});

// Endpoint dopasowany do /api/contact, przyjmuje zgłoszenia bez restrykcyjnych wzorców
App.post('/api/contact', async (req, res) => {
  Const { name, phone, email, service_id, message } = req.body;

  Try {
    Await transporter.sendMail({
      From: '"CARSPA KATO" <kontakt@carspakato.pl>',
      To: "kontakt@carspakato.pl",
      Subject: `Nowe zgłoszenie z formularza: ${name || "Klient"}`,
      Text: `Masz nowe zgłoszenie ze strony carspakato.pl!\n\nImię: ${name || "brak"}\nTelefon: ${phone || "brak"}\nE-mail: ${email || "brak"}\nWybrana usługa: ${service_id || "brak"}\nWiadomość: ${message || "brak"}`
    });

    Res.json({ success: true, message: "Zgłoszenie zostało wysłane pomyślnie!" });
  } catch (err) {
    Console.error("Błąd wysyłania e-maila:", err);
    Res.status(500).json({ success: false, message: "Nie udało się wysłać wiadomości e-mail." });
  }
});

App.get("*", (req, res) => {
  Res.sendFile(path.join(ROOT, "public", "index.html"));
});

App.listen(PORT, () => {
  Console.log(`CARSPA KATO działa na: http://localhost:${PORT}`);
});
