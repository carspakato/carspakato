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

// Katalog na zdjęcia
const uploadDir = path.join(ROOT, "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Pliki bazy danych JSON dla trwałości danych
const dataDir = path.join(ROOT, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const galleryFile = path.join(dataDir, "gallery.json");
const settingsFile = path.join(dataDir, "settings.json");

// Funkcje pomocnicze do odczytu/zapisu trwałych danych
function getGallery() {
  if (!fs.existsSync(galleryFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(galleryFile, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveGallery(images) {
  fs.writeFileSync(galleryFile, JSON.stringify(images, null, 2));
}

function getSettings() {
  const defaultSettings = {
    phone: "+48 000 000 000",
    email: "kontakt@carspakato.pl",
    address: "Katowice"
  };
  if (!fs.existsSync(settingsFile)) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(fs.readFileSync(settingsFile, 'utf8')) };
  } catch (e) {
    return defaultSettings;
  }
}

function saveSettings(settings) {
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const activeSessions = new Set();

function requireAdmin(req, res, next) {
  const cookie = req.headers.cookie || "";
  const tokenMatch = cookie.split('; ').find(row => row.startsWith('admin_token='));
  const token = tokenMatch ? tokenMatch.split('=')[1] : null;

  if (token && activeSessions.has(token)) {
    next();
  } else {
    res.status(401).json({ error: "Brak autoryzacji." });
  }
}

// Logowanie
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

// --- GALERIA API (ZAPIS TRWAŁY) ---
app.get("/api/gallery", (req, res) => {
  res.json(getGallery());
});

app.post("/api/admin/gallery", requireAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nie przesłano pliku." });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    const gallery = getGallery();
    const newImage = { id: Date.now(), url: imageUrl };
    gallery.unshift(newImage);
    saveGallery(gallery);
    res.json({ success: true, image: newImage });
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera podczas zapisu zdjęcia." });
  }
});

app.delete("/api/admin/gallery/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  let gallery = getGallery();
  const index = gallery.findIndex(img => img.id === id);
  if (index !== -1) {
    const img = gallery[index];
    const filePath = path.join(ROOT, "public", img.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    gallery.splice(index, 1);
    saveGallery(gallery);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Nie znaleziono zdjęcia." });
  }
});

// --- USTAWIENIA / KONTAKT API (ZAPIS TRWAŁY) ---
app.get("/api/settings", (req, res) => {
  res.json(getSettings());
});

app.post("/api/admin/settings", requireAdmin, (req, res) => {
  const { phone, email, address } = req.body;
  const settings = getSettings();
  if (phone) settings.phone = phone;
  if (email) settings.email = email;
  if (address) settings.address = address;
  saveSettings(settings);
  res.json({ success: true, settings });
});

// Jawna ścieżka do panelu admina
app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "admin.html"));
});

// Jawne trasy dla podstron usług (gwarantują natychmiastowe przekierowanie)
app.get("/detailing-wewnetrzny", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "detailing-wewnetrzny.html"));
});
app.get("/detailing-wewnetrzny.html", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "detailing-wewnetrzny.html"));
});

app.get("/detailing-zewnetrzny", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "detailing-zewnetrzny.html"));
});
app.get("/detailing-zewnetrzny.html", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "detailing-zewnetrzny.html"));
});

// Formularz kontaktowy
app.post("/api/contact", async (req, res) => {
  const { name, phone, email, service_id, message } = req.body;
  const settings = getSettings();
  try {
    await resend.emails.send({
      from: 'CARSPA KATO <kontakt@carspakato.pl>',
      to: settings.email,
      subject: `Nowa rezerwacja od: ${name || "Klient"}`,
      text: `Nowe zgłoszenie:\n\nImię: ${name}\nTelefon: ${phone}\nE-mail: ${email}\nUsługa: ${service_id}\nWiadomość: ${message}`
    });
    res.json({ success: true, message: "Wysłano pomyślnie!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Błąd wysyłania e-maila." });
  }
});

// Uniwersalna obsługa dla pozostałych usług
app.get("/uslugi/:slug", (req, res, next) => {
  const rawSlug = decodeURIComponent(req.params.slug);
  const slug = rawSlug.endsWith('.html') ? rawSlug : `${rawSlug}.html`;
  
  const possiblePaths = [
    path.join(ROOT, "public", "uslugi", slug),
    path.join(ROOT, "public", "Usługi", slug),
    path.join(ROOT, "public", slug)
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }
  next();
});

// Domyślny fallback na stronę główną
app.get("*", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
