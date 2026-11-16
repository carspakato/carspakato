const express = require("express");
const path = require("path");
const { Resend } = require("resend");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(ROOT, "public")));

const servicesList = [
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

app.get('/api/services', (req, res) => {
  res.json(servicesList);
});

app.post('/api/contact', async (req, res) => {
  console.log("==> ODEBRANO ŻĄDANIE KONTAKTOWE Z FORMULARZA <==");
  console.log("Dane:", req.body);

  const { name, phone, email, service_id, message } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'CARSPA KATO <onboarding@resend.dev>',
      to: "kontakt@carspakato.pl",
      subject: `Nowe zgłoszenie z formularza: ${name || "Klient"}`,
      text: `Masz nowe zgłoszenie ze strony carspakato.pl!\n\nImię: ${name || "brak"}\nTelefon: ${phone || "brak"}\nE-mail: ${email || "brak"}\nWybrana usługa: ${service_id || "brak"}\nWiadomość: ${message || "brak"}`
    });

    console.log("E-mail wysłany pomyślnie przez Resend:", data);
    res.json({ success: true, message: "Zgłoszenie zostało wysłane pomyślnie!" });
  } catch (err) {
    console.error("==> BŁĄD WYSYŁANIA E-MAILA PRZEZ RESEND <==", err);
    res.status(500).json({ success: false, message: "Nie udało się wysłać wiadomości e-mail." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`CARSPA KATO działa na porcie ${PORT}`);
});
