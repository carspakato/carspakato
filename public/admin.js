const $ = s => document.querySelector(s);
let servicesCache = [];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function api(url, opts = {}) {
  const r = await fetch(url, opts);
  const d = r.status === 204 ? {} : await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Wystąpił błąd.");
  return d;
}

function showDashboard(email) {
  $("#login").classList.add("hidden");
  $("#dashboard").classList.remove("hidden");
  $("#adminEmail").textContent = email;
  refreshAll();
}

async function check() {
  try {
    const x = await api("/api/admin/me");
    showDashboard(x.email);
  } catch {}
}

// Logowanie
$("#loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.currentTarget));
  try {
    const x = await api("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d)
    });
    showDashboard(x.email);
  } catch (err) {
    $("#loginMsg").textContent = err.message;
  }
});

// Wylogowanie
$("#logout").addEventListener("click", async () => {
  await api("/api/admin/logout", { method: "POST" });
  location.reload();
});

// Zakładki
document.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll("[data-tab]").forEach(x => x.classList.toggle("active", x === b));
  ["bookings", "services", "gallery", "settings"].forEach(t => $("#tab-" + t).classList.toggle("hidden", t !== b.dataset.tab));
}));

async function refreshAll() {
  await Promise.all([loadBookings(), loadServices(), loadGallery(), loadSettings()]);
}

// Rezerwacje
async function loadBookings() {
  const a = await api("/api/admin/bookings");
  $("#bookings").innerHTML = a.length ? `<div style="overflow:auto"><table class="admin-table"><thead><tr><th>Klient</th><th>Usługa</th><th>Termin</th><th>Status</th><th>Akcja</th></tr></thead><tbody>${a.map(b => `<tr><td><b>${esc(b.name)}</b><br>${esc(b.phone)}<br>${esc(b.email)}</td><td>${esc(b.service_name)}</td><td>${esc(b.preferred_date)}<br>${esc(b.preferred_time)}</td><td>${esc(b.status)}</td><td><select data-status="${b.id}">${["Nowa", "Potwierdzona", "Odrzucona", "Zakończona"].map(s => `<option ${s === b.status ? "selected" : ""}>${s}</option>`).join("")}</select><button class="small-btn" data-save="${b.id}">Zapisz</button></td></tr><tr><td colspan="5" class="muted">Wiadomość: ${esc(b.message \vert{}\vert{} "—")} • Zgłoszenie: ${esc(b.created_at)}</td></tr>`).join("")}</tbody></table></div>` : '<p class="muted">Brak rezerwacji.</p>'; document.querySelectorAll("[data-save]").forEach(btn => btn.onclick = async () => { try { await api("/api/admin/bookings/" + btn.dataset.save, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: document.querySelector(`[data-status="${btn.dataset.save}"]`).value })
      });
      $("#adminMsg").textContent = "Zmieniono status rezerwacji.";
      loadBookings();
    } catch (e) {
      $("#adminMsg").textContent = e.message;
    }
  });
}

// Usługi
async function loadServices() {
  servicesCache = await api("/api/admin/services");
  $("#servicesAdmin").innerHTML = servicesCache.map(s => `<div class="admin-card"><form data-edit-service="${s.id}" class="admin-grid"><label>Nazwa<input name="name" value="${esc(s.name)}" required></label><label>Cena<input name="price" value="${esc(s.price)}" required></label><label>Opis<input name="description" value="${esc(s.description)}"></label><label>Czas realizacji<input name="duration" value="${esc(s.duration)}"></label><div><button>Zapisz zmiany</button><button type="button" class="danger" data-delete-service="${s.id}">Usuń</button></div></form></div>`).join("");
  document.querySelectorAll("[data-edit-service]").forEach(f => f.onsubmit = async e => {
    e.preventDefault();
    try {
      await api("/api/admin/services/" + f.dataset.editService, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(f)))
      });
      $("#adminMsg").textContent = "Zapisano usługę.";
      loadServices();
    } catch (e) {
      $("#adminMsg").textContent = e.message;
    }
  });
  document.querySelectorAll("[data-delete-service]").forEach(b => b.onclick = async () => {
    if (confirm("Usunąć tę usługę?")) {
      await api("/api/admin/services/" + b.dataset.deleteService, { method: "DELETE" });
      loadServices();
    }
  });
}

$("#serviceForm").onsubmit = async e => {
  e.preventDefault();
  try {
    await api("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))
    });
    e.currentTarget.reset();
    loadServices();
    $("#adminMsg").textContent = "Dodano usługę.";
  } catch (x) {
    $("#adminMsg").textContent = x.message;
  }
};

// Galeria
async function loadGallery() {
  const d = await api("/api/public-data");
  $("#galleryAdmin").innerHTML = (d.gallery || []).map(g => `<div><img src="/uploads/${encodeURIComponent(g.filename)}"><p>${
