const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "carspakato@gmail.com",
    pass: "epglqkeatpsavcwo"
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(ROOT, "public")));

const servicesList = [
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

app.get('/api/services', (req, res) => {
  res.json(servicesList);
});

// Endpoint rezerwacji bez daty i godziny
app.post('/api/booking', async (req, res) => {
  const { name, phone, email, service_id, notes } = req.body;
  
  if (!name || !phone || !service_id) {
    return res.status(400).json({ error: "Wypełnij wymagane pola." });
  }

  try {
    await transporter.sendMail({
      from: '"CARSPA KATO" <carspakato@gmail.com>',
      to: "carspakato@gmail.com",
      subject: `Nowe zgłoszenie: ${name} (${phone})`,
      text: `Masz nowe zgłoszenie rezerwacji ze strony!\n\nImię i nazwisko: ${name}\nTelefon: ${phone}\nE-mail klienta: ${email || "brak"}\nWybrana usługa (ID): ${service_id}\nDodatkowe informacje: ${notes || "brak"}`
    });

    res.json({ success: true, message: "Zgłoszenie zostało wysłane!" });
  } catch (err) {
    console.error("Błąd wysyłania e-maila:", err);
    res.status(500).json({ error: "Nie udało się wysłać wiadomości e-mail." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`CARSPA KATO działa na: http://localhost:${PORT}`);
});