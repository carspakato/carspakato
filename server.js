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

// Prosta pamięć sesji admina w pamięci serwera
const activeSessions = new Set();

// Automatyczne utworzenie folderu uploads, jeśli go nie ma
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

// --- AUTORYZACJA ADMINA ---
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || "admin";
  const adminPass = process.env.ADMIN_PASS || "admin123";

  if (username === adminUser && password === adminPass) {
    const token = Math.random().toString(36).substring(2);
    activeSessions.add(token);
    // Ustawiamy ciasteczko sesji
    res.setHeader('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; SameSite=Strict`);
    res.json({ success: true, email: adminUser });
  } else {
    res.status(401).json({ error: "Nieprawidłowy login lub hasło." });
  }
});

app.get("/api/admin/me", (req, res) => {
  const cookie = req.headers.cookie || "";
  const tokenMatch = cookie.split('; ').find(row => row.startsWith('admin_token='));
  const token = tokenMatch ? tokenMatch.split('=')[1] : null;

  if (token && activeSessions.has(token)) {
    res.json({ email: process.env.ADMIN_USER || "admin" });
  } else {
    res.status(401).json({ error: "Brak autoryzacji." });
  }
});

app.post("/api/admin/logout", (req, res) => {
  res.setHeader('Set-Cookie', 'admin_token=; Path=/; Max-Age=0');
  res.json({ success: true });
});

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

// Endpoint galerii w panelu admina (chroniony prostym sprawdzeniem sesji)
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
