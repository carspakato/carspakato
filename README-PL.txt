CARSPA KATO – STRONA INTERNETOWA I PANEL ADMINISTRATORA
=====================================================

CO ZNAJDZIESZ W PACZCE
- Responsywną stronę po polsku (telefon + komputer).
- Sekcje: usługi, cennik, galeria, rezerwacja i kontakt.
- Formularz rezerwacji zapisujący zgłoszenia w bazie SQLite.
- Panel administratora: /admin
- Zarządzanie rezerwacjami, usługami/cenami, zdjęciami galerii i danymi kontaktowymi.
- Przygotowaną integrację powiadomień e-mail (SMTP) i SMS (Twilio).

WAŻNE – TO JEST PROJEKT DO URUCHOMIENIA, NIE GOTOWA PUBLIKACJA
Strona nie jest jeszcze opublikowana w internecie. Nie ma też skonfigurowanych
danych Twojej skrzynki e-mail ani dostawcy SMS. Powiadomienia zaczną działać
dopiero po wpisaniu własnych danych SMTP i Twilio w pliku .env.

URUCHOMIENIE NA KOMPUTERZE
1. Zainstaluj Node.js w wersji 20 lub nowszej: https://nodejs.org/
2. Rozpakuj ZIP do wybranego folderu.
3. Otwórz terminal / Wiersz polecenia w tym folderze.
4. Skopiuj plik .env.example jako .env.
5. Otwórz .env i ustaw:
   - SESSION_SECRET – długi, losowy sekret.
   - ADMIN_EMAIL – swój e-mail administratora.
   - ADMIN_PASSWORD – własne, mocne hasło.
   - dane SMTP i Twilio, gdy będziesz gotowy na SMS/e-mail.
6. W terminalu wpisz:
   npm install
   npm start
7. Otwórz w przeglądarce:
   http://localhost:3000
   Panel: http://localhost:3000/admin

BAZA DANYCH
Po pierwszym uruchomieniu powstanie plik carspa-kato.sqlite. Zawiera usługi,
rezerwacje, ustawienia i konta administratorów. Zdjęcia trafiają do folderu
uploads. Przy wdrożeniu na hosting trzeba zapewnić trwały dysk i kopie zapasowe.

POWIADOMIENIA
- E-mail: wpisz dane serwera SMTP w .env.
- SMS: skonfiguruj konto Twilio i wpisz SID, token oraz numer nadawcy.
- Obecna integracja wysyła powiadomienie o nowym zgłoszeniu do firmy oraz
  potwierdzenie otrzymania zgłoszenia e-mailem do klienta. SMS jest wysyłany
  do numeru firmowego. Wiadomości o późniejszej zmianie statusu i automatyczne
  przypomnienia przed wizytą wymagają kolejnego etapu rozbudowy.

PRZED PUBLIKACJĄ
- Zmień hasło administratora i SESSION_SECRET.
- Uzupełnij prawdziwy numer telefonu, e-mail, adres/obszar działania i profile.
- Zweryfikuj cennik – wartości startowe są przykładowo przeniesione z wcześniejszych
  ustaleń i mogą wymagać zmiany.
- Skonfiguruj HTTPS, kopie zapasowe i trwałe przechowywanie bazy oraz zdjęć.
- Dodaj politykę prywatności i pełną informację RODO dla formularza.
- Nie publikuj strony z przykładowymi danymi kontaktowymi.

DANE STARTOWE
Pierwsze konto administratora tworzone jest z ADMIN_EMAIL i ADMIN_PASSWORD
z pliku .env. Jeśli ich nie zmienisz, serwer użyje wartości domyślnych
z server.js – dlatego koniecznie skonfiguruj .env przed udostępnieniem strony.

W razie wdrożenia na publicznym hostingu zalecana jest konfiguracja HTTPS,
limitów prób logowania, kopii zapasowych i monitorowania błędów.

WDROŻENIE NA RAILWAY – WAŻNE
W ustawieniach usługi dodaj zmienną DATA_DIR=/app/data.
Następnie utwórz Volume i ustaw Mount Path dokładnie na /app/data.
Dzięki temu baza SQLite, sesje i zdjęcia będą zapisywane na trwałym wolumenie.
