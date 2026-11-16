const express = require('express');
const { Resend } = require('resend');
const path = require('path');
const multer = require('multer'); // Wymagane do obsługi przesyłania plików (zdjęć)
const sqlite3 = sqlite3 = require('sqlite3').verbose(); // Jeśli używasz sqlite w ten sposób lub przez sqlite

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname);

// Inicjalizacja Resend kluczem ze zmiennych środowiskowych Render
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(ROOT, "public")));

// Konfiguracja zapisu przesyłanych zdjęć (multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(ROOT, "public", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Endpoint obsługujący formularz kontaktowy
app.post("/api/contact", async (req, res) => {
  const { name, phone, email, service_id, message, consent } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'CARSPA KATO <kontakt@carspakato.pl>',
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

// --- ENDPOINTY DLA PANELU ADMINISTRACYJNEGO I GALERIE ---

// Przykładowy endpoint dodawania zdjęcia do galerii (odbiera plik z formularza admina)
app.post("/api/admin/gallery", upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nie przesłano pliku ze zdjęciem." });
    }
    
    // Tutaj możesz dopisać zapis do bazy danych (np. SQLite) ścieżki pliku: req.file.filename oraz podpisu: req.body.caption
    const filename = req.file.filename;
    const caption = req.body.caption || "";

    console.log("Dodano zdjęcie do galerii:", filename, caption);
    res.json({ success: true, message: "Dodano zdjęcie." });
  } catch (err) {
    console.error("Błąd podczas dodawania zdjęcia:", err);
    res.status(500).json({ error: "Błąd serwera podczas zapisywania zdjęcia." });
  }
});

// Zapasowy catch-all dla frontendu
app.get("*", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
