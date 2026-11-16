const express = require('express');
const { Resend } = require('resend');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname);

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(ROOT, "public")));

const activeSessions = new Set();

// Endpoint logowania
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

// Formularz kontaktowy
app.post("/api/contact", async (req, res) => {
  const { name, phone, email, service_id, message } = req.body;

  try {
    await resend.emails.send({
      from: 'CARSPA KATO <kontakt@carspakato.pl>',
      to: "kontakt@carspakato.pl",
      subject: `Nowa rezerwacja od: ${name || "Klient"}`,
      text: `Nowe zgłoszenie ze strony:\n\nImię: ${name}\nTelefon: ${phone}\nE-mail: ${email}\nUsługa: ${service_id}\nWiadomość: ${message}`
    });
    res.json({ success: true, message: "Wysłano pomyślnie!" });
  } catch (err) {
    console.error("Błąd Resend:", err);
    res.status(500).json({ success: false, message: "Błąd wysyłania e-maila." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
