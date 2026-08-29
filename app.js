// ===== CONFIGURATION =====
const LAT = 19.852;
const LON = 105.952;
const TIMEZONE = "Asia/Ho_Chi_Minh";

// ===== WEATHER CODE TO DETAILS MAP =====
const WMO = {
  0:  { desc: "Trời quang đãng",       emoji: "☀️",  glow: "rgba(251, 191, 36, 0.55)" },
  1:  { desc: "Chủ yếu quang đãng",    emoji: "🌤️", glow: "rgba(251, 191, 36, 0.5)" },
  2:  { desc: "Có mây rải rác",         emoji: "⛅",  glow: "rgba(56, 189, 248, 0.5)" },
  3:  { desc: "Trời nhiều mây",         emoji: "☁️",  glow: "rgba(148, 163, 184, 0.45)" },
  45: { desc: "Sương mù",               emoji: "🌫️", glow: "rgba(203, 213, 225, 0.4)" },
  48: { desc: "Sương giá",              emoji: "🌫️", glow: "rgba(203, 213, 225, 0.4)" },
  51: { desc: "Mưa phùn nhẹ",           emoji: "🌦️", glow: "rgba(56, 189, 248, 0.5)" },
  53: { desc: "Mưa phùn vừa",           emoji: "🌦️", glow: "rgba(56, 189, 248, 0.5)" },
  55: { desc: "Mưa phùn dày",           emoji: "🌧️", glow: "rgba(37, 99, 235, 0.55)" },
  61: { desc: "Mưa nhẹ",                emoji: "🌧️", glow: "rgba(56, 189, 248, 0.55)" },
  63: { desc: "Mưa vừa",                emoji: "🌧️", glow: "rgba(37, 99, 235, 0.6)" },
  65: { desc: "Mưa to dồn dập",         emoji: "🌧️", glow: "rgba(29, 78, 216, 0.65)" },
  80: { desc: "Mưa rào nhẹ",            emoji: "🌦️", glow: "rgba(56, 189, 248, 0.55)" },
  81: { desc: "Mưa rào vừa",            emoji: "⛈️",  glow: "rgba(124, 58, 237, 0.6)" },
  82: { desc: "Mưa rào rất to",         emoji: "⛈️",  glow: "rgba(124, 58, 237, 0.7)" },
  95: { desc: "Dông bão",               emoji: "⛈️",  glow: "rgba(124, 58, 237, 0.7)" },
  96: { desc: "Dông bão có mưa đá",     emoji: "🌩️", glow: "rgba(124, 58, 237, 0.75)" },
  99: { desc: "Dông bão mưa đá mạnh",   emoji: "🌩️", glow: "rgba(124, 58, 237, 0.8)" },
};

function getWMO(code) {
  return WMO[code] || { desc: "Có mây", emoji: "⛅", glow: "rgba(56, 189, 248, 0.5)" };
}

function getWindDir(deg) {
  const dirs = ["Bắc", "Đông Bắc", "Đông", "Đông Nam", "Nam", "Tây Nam", "Tây", "Tây Bắc"];
  return dirs[Math.round(deg / 45) % 8];
}

function getUVLevel(uv) {
  uv = Math.round(uv);
  if (uv <= 2) return `${uv} (Thấp)`;
  if (uv <= 5) return `${uv} (Trung bình)`;
  if (uv <= 7) return `${uv} (Cao)`;
  if (uv <= 10) return `${uv} (Rất cao)`;
  return `${uv} (Nguy hại)`;
}

function getHumidityDesc(h) {
  if (h < 40) return "Không khí khô";
  if (h <= 70) return "Độ ẩm dễ chịu";
  return "Độ ẩm cao, có sương";
}

function getTodayVN() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

function getCurrentHourVN() {
  return parseInt(new Date().toLocaleString("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: TIMEZONE
  }), 10);
}

function formatHourLabel(isoStr) {
  const h = parseInt(isoStr.split("T")[1].split(":")[0], 10);
  return `${h.toString().padStart(2, "0")}:00`;
}

function getDayLabel(isoDate) {
  const today = getTodayVN();
  const d = new Date(today);
  d.setDate(d.getDate() + 1);
  const tomorrow = d.toISOString().slice(0, 10);

  if (isoDate === today) return "Hôm nay";
  if (isoDate === tomorrow) return "Ngày mai";

  const [y, mo, day] = isoDate.split("-").map(Number);
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const dt = new Date(y, mo - 1, day);
  return `${days[dt.getDay()]} ${day}/${mo}`;
}

// ===== SKY PARTICLE STARS =====
function initSkyParticles() {
  const canvas = document.getElementById("sky-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      a: Math.random(),
      speed: Math.random() * 0.002 + 0.001,
      phase: Math.random() * Math.PI * 2
    });
  }

  function render(time) {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      const alpha = p.a * (0.4 + 0.6 * Math.sin(time * p.speed * 1000 + p.phase));
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

// ===== API FETCH =====
async function fetchWeatherData() {
  const params = new URLSearchParams({
    latitude: LAT,
    longitude: LON,
    timezone: TIMEZONE,
    forecast_days: 3,
    wind_speed_unit: "kmh",
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "uv_index",
      "precipitation"
    ].join(","),
    hourly: [
      "temperature_2m",
      "weather_code",
      "precipitation_probability"
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max"
    ].join(",")
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

// ===== UI RENDER FUNCTIONS =====
function renderCurrentHero(data) {
  const c = data.current;
  const d = data.daily;
  const w = getWMO(c.weather_code);

  document.getElementById("hero-emoji").textContent = w.emoji;
  document.getElementById("hero-temp").innerHTML = `${Math.round(c.temperature_2m)}<span class="deg-sym">°</span>`;
  document.getElementById("hero-desc").textContent = w.desc;
  document.getElementById("hero-feels").textContent = `Cảm giác ${Math.round(c.apparent_temperature)}°`;

  const todayHigh = Math.round(d.temperature_2m_max[0]);
  const todayLow = Math.round(d.temperature_2m_min[0]);
  document.getElementById("hero-highlow").textContent = `C: ${todayHigh}°  •  T: ${todayLow}°`;

  // Glow color
  const glowEl = document.getElementById("visual-glow");
  if (glowEl) {
    glowEl.style.background = `radial-gradient(circle, ${w.glow}, transparent 70%)`;
  }

  // Metrics cards
  document.getElementById("m-humidity").textContent = `${c.relative_humidity_2m}%`;
  document.getElementById("m-humidity-desc").textContent = getHumidityDesc(c.relative_humidity_2m);

  document.getElementById("m-wind").innerHTML = `${Math.round(c.wind_speed_10m)} <span class="unit">km/h</span>`;
  document.getElementById("m-wind-dir").textContent = `Hướng: ${getWindDir(c.wind_direction_10m)}`;

  document.getElementById("m-uv").textContent = `${Math.round(c.uv_index)}`;
  document.getElementById("m-uv-level").textContent = getUVLevel(c.uv_index);

  document.getElementById("m-precip").innerHTML = `${c.precipitation || 0} <span class="unit">mm</span>`;

  // Update sync timestamp
  const now = new Date();
  const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  document.getElementById("last-sync").textContent = `Cập nhật lúc ${timeStr}`;
}

function renderHourlyTrack(data) {
  const track = document.getElementById("hourly-track");
  track.innerHTML = "";

  const times = data.hourly.time;
  const temps = data.hourly.temperature_2m;
  const codes = data.hourly.weather_code;
  const pops = data.hourly.precipitation_probability;

  const todayVN = getTodayVN();
  const curHour = getCurrentHourVN();

  let startIdx = times.findIndex(t => {
    const isToday = t.startsWith(todayVN);
    const h = parseInt(t.split("T")[1].split(":")[0], 10);
    return isToday && h === curHour;
  });
  if (startIdx < 0) startIdx = 0;

  const count = Math.min(startIdx + 24, times.length);
  for (let i = startIdx; i < count; i++) {
    const isNow = (i === startIdx);
    const w = getWMO(codes[i]);
    const pop = pops[i] ?? 0;

    const pill = document.createElement("div");
    pill.className = `hourly-pill${isNow ? " now" : ""}`;
    pill.innerHTML = `
      <span class="pill-time">${isNow ? "Bây giờ" : formatHourLabel(times[i])}</span>
      <span class="pill-emoji">${w.emoji}</span>
      <span class="pill-temp">${Math.round(temps[i])}°</span>
      <span class="pill-pop">💧${pop}%</span>
    `;
    track.appendChild(pill);
  }
}

function renderDailyTable(data) {
  const table = document.getElementById("daily-table");
  table.innerHTML = "";

  const dates = data.daily.time;
  const codes = data.daily.weather_code;
  const highs = data.daily.temperature_2m_max;
  const lows = data.daily.temperature_2m_min;

  const todayVN = getTodayVN();
  let todayIdx = dates.indexOf(todayVN);
  if (todayIdx < 0) todayIdx = 0;

  const from = todayIdx + 1;
  const to = Math.min(from + 2, dates.length);

  const maxH = Math.max(...highs.slice(from, to));
  const minL = Math.min(...lows.slice(from, to));
  const range = (maxH - minL) || 1;

  for (let i = from; i < to; i++) {
    const w = getWMO(codes[i]);
    const high = Math.round(highs[i]);
    const low = Math.round(lows[i]);
    const barPct = Math.round(((highs[i] - minL) / range) * 100);

    const row = document.createElement("div");
    row.className = "daily-entry";
    row.innerHTML = `
      <span class="daily-col-day">${getDayLabel(dates[i])}</span>
      <span class="daily-col-emoji">${w.emoji}</span>
      <div class="daily-col-bar">
        <div class="daily-bar-fill" style="width: ${barPct}%;"></div>
      </div>
      <div class="daily-col-temps">
        <span class="daily-t-low">${low}°</span>
        <span class="daily-t-high">${high}°</span>
      </div>
    `;
    table.appendChild(row);
  }
}

// ===== MASTER LOAD FUNCTION =====
async function loadWeather() {
  const btn = document.getElementById("btn-refresh");
  if (btn) btn.classList.add("spinning");

  try {
    const data = await fetchWeatherData();
    renderCurrentHero(data);
    renderHourlyTrack(data);
    renderDailyTable(data);
  } catch (err) {
    console.error("Fetch weather failed:", err);
    document.getElementById("hero-desc").textContent = "Không thể tải dữ liệu";
  } finally {
    if (btn) btn.classList.remove("spinning");
  }
}

// ===== PULL TO REFRESH INTERACTION =====
function initPullToRefresh() {
  const ptrBox = document.getElementById("ptr-box");
  const ptrRing = document.getElementById("ptr-ring");
  const ptrLabel = document.getElementById("ptr-label");

  let startY = 0;
  let isPulling = false;
  const PULL_LIMIT = 70;

  window.addEventListener("touchstart", (e) => {
    if (window.scrollY <= 0) {
      startY = e.touches[0].clientY;
      isPulling = true;
    }
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!isPulling) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 15) {
      ptrBox.classList.add("active");
      if (dy >= PULL_LIMIT) {
        ptrLabel.textContent = "Thả tay để làm mới";
        ptrRing.classList.add("spinning");
      } else {
        ptrLabel.textContent = "Kéo xuống để làm mới";
        ptrRing.classList.remove("spinning");
      }
    }
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    if (!isPulling) return;
    isPulling = false;
    if (ptrRing.classList.contains("spinning")) {
      ptrLabel.textContent = "Đang cập nhật...";
      loadWeather().then(() => {
        ptrBox.classList.remove("active");
        ptrRing.classList.remove("spinning");
        ptrLabel.textContent = "Kéo xuống để làm mới";
      });
    } else {
      ptrBox.classList.remove("active");
    }
  }, { passive: true });
}

// ===== INITIALIZATION =====
initSkyParticles();
initPullToRefresh();
loadWeather();
