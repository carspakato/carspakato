const express = require('express');
const { Resend } = require('resend');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname);

// Inicjalizacja Resend kluczem ze zmiennych środowiskowych Render
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(ROOT, "public")));

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

app.get("*", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
