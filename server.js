const express = require('express');
const { Resend } = require('resend');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname);

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(ROOT, "public")));

// Sprawdzenie i automatyczne utworzenie folderu uploads, jeśli go nie ma
const uploadDir = path.join(ROOT, "public", "uploads");
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfiguracja zapisu zdjęć przez multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Formularz kontaktowy
app.post("/api/contact", async (req, res) => {
  const { name, phone, email, service_id, message } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'CARSPA KATO <kontakt@carspakato.pl>',
      to: "kontakt@carspakato.pl",
      subject: `Nowe zgłoszenie z formularza: ${name || "Klient"}`,
      text: `Masz nowe zgłoszenie ze strony carspakato.pl!\n\nImię: ${name || "brak"}\nTelefon: ${phone || "brak"}\nE-mail: ${email || "brak"}\nUsługa: ${service_id || "brak"}\nWiadomość: ${message || "brak"}`
    });
    res.json({ success: true, message: "Wysłano pomyślnie!" });
  } catch (err) {
    console.error("Błąd Resend:", err);
    res.status(500).json({ success: false, message: "Błąd wysyłania e-maila." });
  }
});

// Endpoint galerii w panelu admina (odbiera plik pod kluczem 'photo')
app.post("/api/admin/gallery", upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nie przesłano pliku." });
    }
    res.json({ success: true, message: "Dodano zdjęcie." });
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
