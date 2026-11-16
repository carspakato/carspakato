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

const uploadDir = path.join(ROOT, "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const dataDir = path.join(ROOT, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const galleryFile = path.join(dataDir, "gallery.json");
const settingsFile = path.join(dataDir, "settings.json");

function getGallery() {
  if (!fs.existsSync(galleryFile)) return [];
  try { return JSON.parse(fs.readFileSync(galleryFile, 'utf8')); } catch (e) { return []; }
}
function saveGallery(images) { fs.writeFileSync(galleryFile, JSON.stringify(images, null, 2)); }

function getSettings() {
  const defaultSettings = { phone: "+48 000 000 000", email: "kontakt@carspakato.pl", address: "Katowice" };
  if (!fs.existsSync(settingsFile)) return defaultSettings;
  try { return { ...defaultSettings, ...JSON.parse(fs.readFileSync(settingsFile, 'utf8')) }; } catch (e) { return defaultSettings; }
}
function saveSettings(settings) { fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2)); }

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
  if (token && activeSessions.has(token)) { next(); } else { res.status(401).json({ error: "Brak autoryzacji." }); }
}

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === (process.env.ADMIN_USER || "admin") && password === (process.env.ADMIN_PASS || "Hania2022.")) {
    const token = Math.random().toString(36).substring(2);
    activeSessions.add(token);
    res.setHeader('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; SameSite=Strict`);
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Nieprawidłowy login lub hasło." });
  }
});

app.get("/api/admin/me", (req, res) => {
  const cookie = req.headers.cookie || "";
  const token = (cookie.split('; ').find(row => row.startsWith('admin_token=')) || "").split('=')[1];
  if (token && activeSessions.has(token)) { res.json({ email: process.env.ADMIN_USER || "admin" }); } else { res.status(401).json({ error: "Brak autoryzacji." }); }
});

app.post("/api/admin/logout", (req, res) => {
  res.setHeader('Set-Cookie', 'admin_token=; Path=/; Max-Age=0');
  res.json({ success: true });
});

app.get("/api/gallery", (req, res) => { res.json(getGallery()); });
app.post("/api/admin/gallery", requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Brak pliku" });
  const gallery = getGallery();
  const newImage = { id: Date.now(), url: `/uploads/${req.file.filename}` };
  gallery.unshift(newImage);
  saveGallery(gallery);
  res.json({ success: true, image: newImage });
});
app.delete("/api/admin/gallery/:id", requireAdmin, (req, res) => {
  let gallery = getGallery();
  const id = Number(req.params.id);
  const index = gallery.findIndex(img => img.id === id);
  if (index !== -1) {
    const filePath = path.join(ROOT, "public", gallery[index].url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    gallery.splice(index, 1);
    saveGallery(gallery);
    res.json({ success: true });
  } else { res.status(404).json({ error: "Nie znaleziono" }); }
});

app.get("/api/settings", (req, res) => { res.json(getSettings()); });
app.post("/api/admin/settings", requireAdmin, (req, res) => {
  const settings = getSettings();
  if (req.body.phone) settings.phone = req.body.phone;
  if (req.body.email) settings.email = req.body.email;
  if (req.body.address) settings.address = req.body.address;
  saveSettings(settings);
  res.json({ success: true, settings });
});

app.get("/admin.html", (req, res) => { res.sendFile(path.join(ROOT, "public", "admin.html")); });

// Jawne trasy dla podstron
app.get("/detailing-zewnetrzny", (req, res) => { res.sendFile(path.join(ROOT, "public", "detailing-zewnetrzny.html")); });
app.get("/detailing-zewnetrzny.html", (req, res) => { res.sendFile(path.join(ROOT, "public", "detailing-zewnetrzny.html")); });

app.get("/detailing-wewnetrzny", (req, res) => { res.sendFile(path.join(ROOT, "public", "detailing-wewnetrzny.html")); });
app.get("/detailing-wewnetrzny.html", (req, res) => { res.sendFile(path.join(ROOT, "public", "detailing-wewnetrzny.html")); });
app.get("/detailing-wnetrzny", (req, res) => { res.sendFile(path.join(ROOT, "public", "detailing-wewnetrzny.html")); });
app.get("/detailing-wnetrzny.html", (req, res) => { res.sendFile(path.join(ROOT, "public", "detailing-wewnetrzny.html")); });

app.get("/korekty-lakieru", (req, res) => { res.sendFile(path.join(ROOT, "public", "korekty-lakieru.html")); });
app.get("/korekty-lakieru.html", (req, res) => { res.sendFile(path.join(ROOT, "public", "korekty-lakieru.html")); });

app.get("/ochrona-lakieru", (req, res) => { res.sendFile(path.join(ROOT, "public", "ochrona-lakieru.html")); });
app.get("/ochrona-lakieru.html
