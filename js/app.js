const ROUTE_OPTIONS = [
  { id: "nr762-out", routeId: "NR762", directionKey: "to_siu_hong", route: "NR762", direction: "豫豐花園 → 兆康站" },
  { id: "nr762-in", routeId: "NR762", directionKey: "from_siu_hong", route: "NR762", direction: "兆康站 → 豫豐花園" },
  { id: "nr762a-out", routeId: "NR762A", directionKey: "to_tuen_mun", route: "NR762A", direction: "豫豐花園 → 屯門市中心" },
  { id: "nr762a-in", routeId: "NR762A", directionKey: "from_tuen_mun", route: "NR762A", direction: "屯門市中心 → 豫豐花園" },
];

const state = {
  optionId: "nr762-out",
  view: "next",
};

function getSelection() {
  return ROUTE_OPTIONS.find((o) => o.id === state.optionId) || ROUTE_OPTIONS[0];
}

function parseTime(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function getNowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function getActiveTimes(routeId, directionKey) {
  const direction = TIMETABLE.routes[routeId].directions[directionKey];
  const cancelled = new Set(direction.cancelled || []);
  return direction.times.filter((t) => !cancelled.has(t));
}

function getNextBuses(routeId, directionKey, count = 4) {
  const times = getActiveTimes(routeId, directionKey);
  const now = getNowMinutes();
  const upcoming = times.filter((t) => parseTime(t) >= now);
  const result = upcoming.slice(0, count);

  if (result.length < count) {
    result.push(...times.slice(0, count - result.length));
  }

  return result.map((time) => {
    let diff = parseTime(time) - now;
    if (diff < 0) diff += 24 * 60;
    return { time, minutesAway: diff, isTomorrow: parseTime(time) < now };
  });
}

function formatWaitText(bus, index) {
  if (bus.minutesAway === 0) return "即將開出";
  if (bus.isTomorrow && index > 0) return `約 ${bus.minutesAway} 分鐘（翌日）`;
  if (bus.minutesAway < 60) return `約 ${bus.minutesAway} 分鐘`;
  const h = Math.floor(bus.minutesAway / 60);
  const m = bus.minutesAway % 60;
  return m ? `約 ${h} 小時 ${m} 分鐘` : `約 ${h} 小時`;
}

function renderRouteOptions() {
  const container = document.getElementById("route-options");
  container.innerHTML = "";

  ROUTE_OPTIONS.forEach((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `route-option${state.optionId === opt.id ? " active" : ""}`;
    btn.innerHTML = `<strong>${opt.route}</strong><span>${opt.direction}</span>`;
    btn.addEventListener("click", () => {
      state.optionId = opt.id;
      render();
    });
    container.appendChild(btn);
  });
}

function renderNextHero(nextBuses, selection) {
  const next = nextBuses[0];
  document.getElementById("hero-route").textContent = selection.route;
  document.getElementById("hero-time").textContent = next ? next.time : "--:--";
  document.getElementById("hero-wait").textContent = next ? formatWaitText(next, 0) : "今日已無班次";
  document.getElementById("hero-direction").textContent = selection.direction;
}

function renderResults() {
  const selection = getSelection();
  const nextBuses = getNextBuses(selection.routeId, selection.directionKey, 4);

  renderNextHero(nextBuses, selection);

  const cards = document.getElementById("next-cards");
  cards.innerHTML = "";

  nextBuses.slice(1).forEach((bus, index) => {
    const item = document.createElement("article");
    item.className = "upcoming-item";
    item.innerHTML = `
      <div>
        <div class="upcoming-time">${bus.time}</div>
        <div class="upcoming-meta">第 ${index + 2} 班</div>
      </div>
      <div class="upcoming-wait">${formatWaitText(bus, index + 1)}</div>
    `;
    cards.appendChild(item);
  });

  if (nextBuses.length <= 1) {
    cards.innerHTML = `<p class="empty">${nextBuses.length === 0 ? "今日此方向已無班次" : "之後再無其他班次"}</p>`;
  }
}

function renderTimetable() {
  const selection = getSelection();
  const direction = TIMETABLE.routes[selection.routeId].directions[selection.directionKey];
  const cancelled = new Set(direction.cancelled || []);
  const now = getNowMinutes();
  const grid = document.getElementById("timetable-grid");
  grid.innerHTML = "";

  direction.times.forEach((time) => {
    const cell = document.createElement("div");
    const isCancelled = cancelled.has(time);
    const isPast = !isCancelled && parseTime(time) < now;
    const isNext =
      !isCancelled &&
      time === getNextBuses(selection.routeId, selection.directionKey, 1)[0]?.time;

    cell.className = [
      "time-cell",
      isCancelled ? "cancelled" : "",
      isPast ? "past" : "",
      isNext ? "next" : "",
    ]
      .filter(Boolean)
      .join(" ");
    cell.textContent = time;
    if (isCancelled) cell.title = "已取消";
    grid.appendChild(cell);
  });

  document.getElementById("timetable-caption").textContent =
    `${selection.route} · ${selection.direction}（共 ${getActiveTimes(selection.routeId, selection.directionKey).length} 班）`;
}

function renderRemarks() {
  document.getElementById("remarks-list").innerHTML =
    TIMETABLE.remarks.map((r) => `<li>${r}</li>`).join("");
}

function bindControls() {
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.view = btn.dataset.view;
      document.querySelectorAll("[data-view]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("next-panel").hidden = state.view !== "next";
      document.getElementById("full-panel").hidden = state.view !== "full";
    });
  });
}

function renderClock() {
  const el = document.getElementById("live-clock");
  const tick = () => {
    el.textContent = new Date().toLocaleString("zh-HK", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  tick();
  setInterval(tick, 1000);
}

function render() {
  renderRouteOptions();
  renderResults();
  renderTimetable();
  renderRemarks();
}

document.addEventListener("DOMContentLoaded", () => {
  bindControls();
  renderClock();
  render();
  setInterval(() => {
    renderResults();
    renderTimetable();
  }, 30000);
});
