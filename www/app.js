// ===== CONFIG =====
const LAT = 19.852;
const LON = 105.952;
const TIMEZONE = "Asia/Ho_Chi_Minh";

// ===== WEATHER CODE MAP =====
const WMO = {
  0:  { desc: "Trời quang đãng",       emoji: "☀️",  glow: "#FFD700" },
  1:  { desc: "Chủ yếu quang đãng",    emoji: "🌤️", glow: "#FFD700" },
  2:  { desc: "Có mây rải rác",         emoji: "⛅",  glow: "#87CEEB" },
  3:  { desc: "Trời nhiều mây",         emoji: "☁️",  glow: "#A9A9A9" },
  45: { desc: "Sương mù",               emoji: "🌫️", glow: "#C0C0C0" },
  48: { desc: "Sương giá",              emoji: "🌫️", glow: "#C0C0C0" },
  51: { desc: "Mưa phùn nhẹ",           emoji: "🌦️", glow: "#4682B4" },
  53: { desc: "Mưa phùn vừa",           emoji: "🌦️", glow: "#4682B4" },
  55: { desc: "Mưa phùn dày",           emoji: "🌧️", glow: "#4169E1" },
  61: { desc: "Mưa nhẹ",                emoji: "🌧️", glow: "#4682B4" },
  63: { desc: "Mưa vừa",                emoji: "🌧️", glow: "#4169E1" },
  65: { desc: "Mưa to",                 emoji: "🌧️", glow: "#1E40AF" },
  80: { desc: "Mưa rào nhẹ",            emoji: "🌦️", glow: "#4682B4" },
  81: { desc: "Mưa rào vừa",            emoji: "⛈️",  glow: "#6B21A8" },
  82: { desc: "Mưa rào nặng",           emoji: "⛈️",  glow: "#6B21A8" },
  95: { desc: "Dông bão",               emoji: "⛈️",  glow: "#7C3AED" },
  96: { desc: "Dông bão có mưa đá",     emoji: "🌩️", glow: "#7C3AED" },
  99: { desc: "Dông bão mưa đá mạnh",   emoji: "🌩️", glow: "#7C3AED" },
};
function getWMO(code) {
  return WMO[code] || { desc: "Không xác định", emoji: "🌡️", glow: "#888" };
}

// ===== HELPERS =====
function getWindDir(deg) {
  const dirs = ["B","ĐB","Đ","ĐN","N","TN","T","TB"];
  return dirs[Math.round(deg / 45) % 8];
}
function getUVLabel(uv) {
  uv = Math.round(uv);
  if (uv <= 2) return uv + " Thấp";
  if (uv <= 5) return uv + " TB";
  if (uv <= 7) return uv + " Cao";
  return uv + " Rất cao";
}
function getTodayVN() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}
function getCurrentHourVN() {
  return parseInt(new Date().toLocaleString("en-US", {
    hour: "numeric", hour12: false, timeZone: TIMEZONE
  }), 10);
}
function formatDateTime(dt) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long", day: "2-digit", month: "2-digit",
    year: "numeric", hour: "2-digit", minute: "2-digit",
    timeZone: TIMEZONE
  }).format(dt);
}
function formatStatusTime(dt) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit", minute: "2-digit", timeZone: TIMEZONE
  }).format(dt);
}
function parseDateFromISO(s) { return s.split("T")[0]; }
function parseHourFromISO(s) { return parseInt(s.split("T")[1].split(":")[0], 10); }
function formatHourLabel(s)  {
  const h = parseHourFromISO(s);
  return h.toString().padStart(2, "0") + ":00";
}
function getDayLabel(isoDate) {
  const today = getTodayVN();
  const d = new Date(today); d.setDate(d.getDate() + 1);
  const tomorrow = d.toISOString().slice(0, 10);
  if (isoDate === today)    return "Hôm nay";
  if (isoDate === tomorrow) return "Ngày mai";
  const [y, mo, day] = isoDate.split("-").map(Number);
  const days = ["CN","T2","T3","T4","T5","T6","T7"];
  return days[new Date(y, mo - 1, day).getDay()] + " " + day + "/" + mo;
}

// ===== PARTICLES =====
function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  const ctx = canvas.getContext("2d");
  let W, H, stars = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.5 + 0.3,
      a: Math.random(),
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      const alpha = s.a * (0.5 + 0.5 * Math.sin(t * s.speed * 1000 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

// ===== FETCH =====
async function fetchWeather() {
  const params = new URLSearchParams({
    latitude: LAT, longitude: LON,
    timezone: TIMEZONE, forecast_days: 3, wind_speed_unit: "kmh",
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,precipitation",
    hourly:  "temperature_2m,weather_code,precipitation_probability",
    daily:   "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
  });
  const res = await fetch("https://api.open-meteo.com/v1/forecast?" + params);
  if (!res.ok) throw new Error("API " + res.status);
  return res.json();
}

// ===== RENDER CURRENT =====
function renderCurrent(data) {
  const c = data.current;
  const w = getWMO(c.weather_code);

  document.getElementById("hero-emoji").textContent = w.emoji;
  document.getElementById("hero-temp").textContent  = Math.round(c.temperature_2m) + "°";
  document.getElementById("hero-desc").textContent  = w.desc;
  document.getElementById("hero-feels").textContent = "Cảm giác " + Math.round(c.apparent_temperature) + "°";

  document.getElementById("s-humidity").textContent = c.relative_humidity_2m + "%";
  document.getElementById("s-wind").textContent     = Math.round(c.wind_speed_10m) + " km/h\n" + getWindDir(c.wind_direction_10m);
  document.getElementById("s-uv").textContent       = getUVLabel(c.uv_index);
  document.getElementById("s-precip").textContent   = c.precipitation + " mm";

  // Glow effect
  document.getElementById("hero-glow").style.background =
    "radial-gradient(circle, " + w.glow + "88, transparent)";

  // Nav dot color
  document.getElementById("nav-dot").style.boxShadow =
    "0 0 14px " + w.glow;
  document.getElementById("nav-dot").style.background = w.glow;

  // Show data
  document.getElementById("skeleton").classList.add("hidden");
  document.getElementById("hero-data").classList.remove("hidden");
}

// ===== RENDER HOURLY =====
function renderHourly(data) {
  const track = document.getElementById("hourly-track");
  track.innerHTML = "";

  const times = data.hourly.time;
  const temps = data.hourly.temperature_2m;
  const codes = data.hourly.weather_code;
  const probs = data.hourly.precipitation_probability;

  const todayVN   = getTodayVN();
  const curHourVN = getCurrentHourVN();

  let startIdx = times.findIndex(t =>
    parseDateFromISO(t) === todayVN && parseHourFromISO(t) === curHourVN
  );
  if (startIdx < 0) startIdx = 0;

  const end = Math.min(startIdx + 24, times.length);
  for (let i = startIdx; i < end; i++) {
    const w     = getWMO(codes[i]);
    const isNow = (i === startIdx);
    const delay = (i - startIdx) * 0.03;

    const el = document.createElement("div");
    el.className = "hourly-item" + (isNow ? " now" : "");
    el.style.animationDelay = delay + "s";
    el.innerHTML =
      '<span class="hourly-time">' + (isNow ? "Bây giờ" : formatHourLabel(times[i])) + "</span>" +
      '<span class="hourly-emoji">' + w.emoji + "</span>" +
      '<span class="hourly-temp">' + Math.round(temps[i]) + "°</span>" +
      '<span class="hourly-rain">💧' + (probs[i] ?? 0) + "%</span>";
    track.appendChild(el);
  }
}

// ===== RENDER DAILY =====
function renderDaily(data) {
  const list  = document.getElementById("daily-list");
  list.innerHTML = "";

  const dates = data.daily.time;
  const codes = data.daily.weather_code;
  const highs = data.daily.temperature_2m_max;
  const lows  = data.daily.temperature_2m_min;

  const todayVN = getTodayVN();
  let todayIdx  = dates.indexOf(todayVN);
  if (todayIdx < 0) todayIdx = 0;

  const from = todayIdx + 1;
  const to   = Math.min(from + 2, dates.length);

  const maxH = Math.max(...highs.slice(from, to));
  const minL = Math.min(...lows.slice(from, to));
  const range = (maxH - minL) || 1;

  for (let i = from; i < to; i++) {
    const w      = getWMO(codes[i]);
    const barPct = Math.round(((highs[i] - minL) / range) * 100);
    const delay  = (i - from) * 0.1;

    const el = document.createElement("div");
    el.className = "daily-row";
    el.style.animationDelay = delay + "s";
    el.innerHTML =
      '<span class="daily-name">' + getDayLabel(dates[i]) + "</span>" +
      '<span class="daily-emoji">' + w.emoji + "</span>" +
      '<div class="daily-bar-zone"><div class="daily-bar-fill" style="width:' + barPct + '%"></div></div>' +
      '<div class="daily-temps">' +
        '<span class="daily-high">' + Math.round(highs[i]) + "°</span>" +
        '<span class="daily-low">'  + Math.round(lows[i])  + "°</span>" +
      "</div>";
    list.appendChild(el);
  }
}

// ===== CLOCK =====
function updateClock() {
  const now = new Date();
  document.getElementById("status-time").textContent  = formatStatusTime(now);
  document.getElementById("hero-datetime").textContent = formatDateTime(now);
}

// ===== SHARE =====
function shareWeather() {
  const temp  = document.getElementById("hero-temp").textContent;
  const desc  = document.getElementById("hero-desc").textContent;
  const emoji = document.getElementById("hero-emoji").textContent;
  const text  = "Thời tiết Hoằng Tiến, Thanh Hóa\n" + emoji + " " + temp + " – " + desc;
  if (navigator.share) {
    navigator.share({ title: "Thời Tiết", text });
  } else {
    navigator.clipboard.writeText(text).then(() => alert("Đã sao chép!"));
  }
}

// ===== MAIN =====
async function loadWeather() {
  // Spin both refresh buttons
  const btnBottom  = document.getElementById("btn-refresh");
  const btnHeader  = document.getElementById("header-refresh-btn");
  if (btnBottom) btnBottom.classList.add("spinning");
  if (btnHeader) btnHeader.classList.add("spinning");

  try {
    const data = await fetchWeather();
    renderCurrent(data);
    renderHourly(data);
    renderDaily(data);
    document.getElementById("last-update").textContent =
      new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  } catch (err) {
    console.error(err);
    document.getElementById("hero-data").classList.remove("hidden");
    document.getElementById("skeleton").classList.add("hidden");
    document.getElementById("hero-emoji").textContent = "⚠️";
    document.getElementById("hero-temp").textContent  = "--°";
    document.getElementById("hero-desc").textContent  = "Không tải được dữ liệu";
  } finally {
    if (btnBottom) btnBottom.classList.remove("spinning");
    if (btnHeader) btnHeader.classList.remove("spinning");
  }
}

// ===== INIT =====
initParticles();
updateClock();
setInterval(updateClock, 15000);
loadWeather();

// ===== PULL-TO-REFRESH =====
(function initPullToRefresh() {
  const scrollEl  = document.querySelector(".scroll-content");
  const ptrEl     = document.getElementById("ptr-indicator");
  const ptrSpinner = document.getElementById("ptr-spinner");
  const ptrText   = document.getElementById("ptr-text");

  let startY = 0;
  let pulling = false;
  let triggered = false;
  const THRESHOLD = 65;

  scrollEl.addEventListener("touchstart", function(e) {
    if (scrollEl.scrollTop === 0) {
      startY  = e.touches[0].clientY;
      pulling = true;
      triggered = false;
    }
  }, { passive: true });

  scrollEl.addEventListener("touchmove", function(e) {
    if (!pulling) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 10) {
      ptrEl.classList.add("visible");
      if (dy >= THRESHOLD && !triggered) {
        ptrText.textContent = "Thả để làm mới";
        ptrSpinner.classList.add("spinning");
        triggered = true;
      } else if (dy < THRESHOLD) {
        ptrText.textContent = "Kéo để làm mới";
        ptrSpinner.classList.remove("spinning");
      }
    }
  }, { passive: true });

  scrollEl.addEventListener("touchend", function() {
    if (!pulling) return;
    pulling = false;
    if (triggered) {
      ptrText.textContent = "Đang tải...";
      loadWeather().then(() => {
        ptrEl.classList.remove("visible");
        ptrSpinner.classList.remove("spinning");
        ptrText.textContent = "Kéo để làm mới";
      });
    } else {
      ptrEl.classList.remove("visible");
    }
    triggered = false;
  }, { passive: true });
})();

