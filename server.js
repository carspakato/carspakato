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

// Pamięć sesji administratora
const activeSessions = new Set();

// Przechowywanie danych w pamięci (galeria, usługi, ustawienia, rezerwacje)
let galleryDB = [];
let servicesDB = [
  { id: 1, name: "Mycie detailingowe", price: "250 zł", description: "Dokładne mycie ręczne", duration: "2h" },
  { id: 2, name: "Korekta lakieru", price: "1200 zł", description: "Usuwanie rys i polerowanie", duration: "2 dni" }
];
let bookingsDB = [];
let settingsDB = {
  phone: "+48 000 000 000",
  email: "kontakt@carspakato.pl",
  address: "Katowice, Polska"
};

// Automatyczne utworzenie folderu uploads
const uploadDir = path.join(ROOT, "public", "uploads");
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfiguracja Multer dla galerii
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

// --- ENDPOINTY LOGOWANIA ---
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || "admin";
  const adminPass = process.env.ADMIN_PASS || "Hania2022.";

  if (username === adminUser && password === adminPass) {
    const token = Math.random().toString(36).substring(2);
    activeSessions.add(token);
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

// --- DANE PUBLICZNE I STRONY ---
app.get("/api/public-data", (req, res) => {
  res.json({
    gallery: galleryDB,
    services: servicesDB,
    settings: settingsDB
  });
});

// Formularz kontaktowy
app.post("/api/contact", async (req, res) => {
  const { name, phone, email, service_id, message } = req.body;

  try {
    await resend.emails.send({
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

// --- GALERIA ADMINA ---
app.post("/api/admin/gallery", upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nie przesłano pliku." });
    }
    const newPhoto = {
      id: Date.now().toString(),
      filename: req.file.filename,
      caption: req.body.caption || ""
    };
    galleryDB.unshift(newPhoto); // Dodaj na początek listy
    res.json({ success: true, message: "Dodano zdjęcie.", photo: newPhoto });
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera." });
  }
});

app.delete("/api/admin/gallery/:id", (req, res) => {
  const photoId = req.params.id;
  galleryDB = galleryDB.filter(g => g.id !== photoId);
  res.json({ success: true });
});

// --- USŁUGI I REZERWACJE ---
app.get("/api/admin/services", (req, res) => {
  res.json(servicesDB);
});

app.post("/api/admin/services", (req, res) => {
  const newService = { id: Date.now(), ...req.body };
  servicesDB.push(newService);
  res.json({ success: true, service: newService });
});

app.put("/api/admin/services/:id", (req, res) => {
  const id = Number(req.params.id);
  servicesDB = servicesDB.map(s => s.id === id ? { ...s, ...req.body } : s);
  res.json({ success: true });
});

app.delete("/api/admin/services/:id", (req, res) => {
  const id = Number(req.params.id);
  servicesDB = servicesDB.filter(s => s.id !== id);
  res.json({ success: true });
});

app.get("/api/admin/bookings", (req, res) => {
  res.json(bookingsDB);
});

app.patch("/api/admin/bookings/:id", (req, res) => {
  res.json({ success: true });
});

app.put("/api/admin/settings", (req, res) => {
  settingsDB = { ...settingsDB, ...req.body };
  res.json({ success: true });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
