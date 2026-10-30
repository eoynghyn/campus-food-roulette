const MOOD_LABELS = { spicy: "🌶️ 매운", quick: "⚡ 빠른", hearty: "🍚 든든한", babyak: "🤝 밥약" };
const COLORS = ["#8b0029", "#c9a227", "#b23a5a", "#e0c36a", "#5e0a22", "#d9786f"];
const SPIN_TURNS = 5;
const HISTORY_KEY = "food-roulette-history";
const EXCLUDE_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

const filtersEl = document.getElementById("filters");
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spin");
const countEl = document.getElementById("match-count");
const resultEl = document.getElementById("result");
const overrideBtn = document.getElementById("override");
const historyEl = document.getElementById("history");
const historyListEl = document.getElementById("history-list");

let candidates = [];
let rotation = 0;
let spinning = false;
let ignoreHistory = false;

const won = (n) => n.toLocaleString("ko-KR") + "원";

// 최근 기록은 브라우저(localStorage)에 [{ name, at }] 형태로 저장한다.
// 시크릿 모드처럼 저장소를 못 쓰는 환경에서도 앱이 멈추지 않도록 try/catch로 감싼다.
function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY)) ?? [];
    return saved.filter((h) => Date.now() - h.at < EXCLUDE_DAYS * DAY_MS);
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // 저장하지 못해도 룰렛은 계속 쓸 수 있다
  }
}

function addToHistory(name) {
  const history = loadHistory().filter((h) => h.name !== name);
  history.unshift({ name, at: Date.now() });
  saveHistory(history);
}

function daysAgoLabel(at) {
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const days = Math.ceil((startOfToday - at) / DAY_MS);
  return days <= 0 ? "오늘" : days === 1 ? "어제" : `${days}일 전`;
}

function renderHistory() {
  const history = loadHistory();
  historyEl.hidden = history.length === 0;
  historyListEl.innerHTML = history
    .map((h) => `<li><span>${h.name}</span><span class="when">${daysAgoLabel(h.at)}</span></li>`)
    .join("");
}

function readFilters() {
  return {
    budget: Number(filtersEl.querySelector("input[name=budget]:checked").value),
    moods: [...filtersEl.querySelectorAll("input[name=mood]:checked")].map((el) => el.value),
  };
}

// 예산은 꼭 만족해야 하고, 기분은 하나라도 맞으면 통과 (선택 안 하면 전부 통과)
function getCandidates({ budget, moods }) {
  return RESTAURANTS.filter(
    (r) =>
      (budget === 0 || r.price <= budget) &&
      (moods.length === 0 || moods.some((m) => r.moods.includes(m)))
  );
}

function shortName(name) {
  return name.length > 9 ? name.slice(0, 8) + "…" : name;
}

function drawWheel(items, emptyLabel = "후보 없음") {
  const size = canvas.width;
  const c = size / 2;
  const radius = c - 6;
  ctx.clearRect(0, 0, size, size);

  if (items.length === 0) {
    ctx.beginPath();
    ctx.arc(c, c, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#cfc6ca";
    ctx.fill();
    ctx.fillStyle = "#4a4145";
    ctx.font = "bold 30px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emptyLabel, c, c);
    return;
  }

  // 0번 칸이 맨 위(포인터 위치)에서 시작해 시계 방향으로 이어진다
  const seg = (Math.PI * 2) / items.length;
  items.forEach((r, i) => {
    const start = -Math.PI / 2 + i * seg;
    ctx.beginPath();
    ctx.moveTo(c, c);
    ctx.arc(c, c, radius, start, start + seg);
    ctx.closePath();
    // 칸 수가 홀수면 첫 칸과 마지막 칸 색이 겹치지 않게 조정
    const colorIndex = i === items.length - 1 && i % COLORS.length === 0 && i > 0 ? 1 : i % COLORS.length;
    ctx.fillStyle = COLORS[colorIndex];
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();
    ctx.translate(c, c);
    ctx.rotate(start + seg / 2);
    ctx.fillStyle = colorIndex % 2 === 1 ? "#2a1a1f" : "#ffffff";
    ctx.font = `bold ${items.length > 10 ? 22 : 28}px sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(shortName(r.name), radius - 24, 0);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(c, c, 36, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

// 돌릴 필요가 없는 상태(후보 0~1곳)에서는 글자가 기울어 보이지 않게 회전을 애니메이션 없이 되돌린다
function resetRotation() {
  canvas.style.transition = "none";
  rotation = 0;
  canvas.style.transform = "rotate(0deg)";
  canvas.getBoundingClientRect();
  canvas.style.transition = "";
}

// 조건에 맞는 식당 중 최근에 뽑힌 곳을 뺀 목록을 만든다 ("기록 무시"를 누르면 빼지 않는다)
function computeCandidates() {
  const matched = getCandidates(readFilters());
  const recent = new Set(loadHistory().map((h) => h.name));
  const fresh = matched.filter((r) => !recent.has(r.name));
  const list = ignoreHistory ? matched : fresh;
  return { list, matched: matched.length, excluded: matched.length - list.length };
}

function updateControls({ list, matched, excluded }) {
  const allRecent = matched > 0 && list.length === 0;
  overrideBtn.hidden = !allRecent;
  spinBtn.disabled = list.length === 0;
  spinBtn.textContent = list.length === 1 ? "결과 보기" : "룰렛 돌리기";

  if (matched === 0) {
    countEl.textContent = "조건에 맞는 식당이 없어요. 조건을 조금 넓혀 보세요.";
  } else if (allRecent) {
    countEl.textContent = `조건에 맞는 ${matched}곳을 최근 ${EXCLUDE_DAYS}일 안에 모두 뽑았어요.`;
  } else {
    const note = excluded > 0 ? ` · 최근에 뽑힌 ${excluded}곳 제외` : "";
    countEl.textContent =
      (list.length === 1 ? "조건에 맞는 식당이 딱 1곳이에요!" : `후보 ${list.length}곳`) + note;
  }
}

function render() {
  const state = computeCandidates();
  candidates = state.list;
  if (candidates.length <= 1) resetRotation();
  drawWheel(candidates, state.matched > 0 ? "모두 최근에 뽑음" : "후보 없음");
  resultEl.hidden = true;
  updateControls(state);
  renderHistory();
}

function showResult(r) {
  const moods = r.moods.map((m) => MOOD_LABELS[m] ?? m).join(" ");
  const map = r.mapUrl
    ? `<a class="map-link" href="${r.mapUrl}" target="_blank" rel="noopener">지도에서 보기 →</a>`
    : "";
  resultEl.innerHTML = `
    <p class="result-label">오늘의 점심은</p>
    <h2 class="result-name">${r.name}</h2>
    <p class="result-meta">${r.category} · 1인 약 ${won(r.price)} · 정문에서 도보 ${r.walk}분</p>
    <p class="result-moods">${moods}</p>
    ${map}`;
  resultEl.hidden = false;
  resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // 결과는 기록에 남기고, 룰렛은 그대로 둔 채 다음에 돌릴 후보 수만 갱신한다
  addToHistory(r.name);
  renderHistory();
  updateControls(computeCandidates());
}

function spin() {
  if (spinning) return;
  // 직전 결과가 기록에 추가됐을 수 있으니 돌리기 전에 후보를 다시 계산한다
  render();
  if (candidates.length === 0) return;
  if (candidates.length === 1) {
    showResult(candidates[0]);
    return;
  }

  // 당첨 식당을 먼저 균등하게 뽑고, 포인터가 그 칸 안쪽에 멈추도록 회전 각도를 계산한다
  const n = candidates.length;
  const seg = 360 / n;
  const winner = Math.floor(Math.random() * n);
  const picked = candidates[winner];
  const target = (winner + 0.2 + Math.random() * 0.6) * seg;
  const current = ((rotation % 360) + 360) % 360;
  const delta = (((360 - target) - current) % 360 + 360) % 360;
  rotation += SPIN_TURNS * 360 + delta;

  spinning = true;
  spinBtn.disabled = true;
  filtersEl.disabled = true;
  resultEl.hidden = true;
  canvas.style.transform = `rotate(${rotation}deg)`;

  // transitionend는 탭이 백그라운드일 때 오지 않을 수 있어서, 애니메이션 시간만큼 타이머로 기다린다
  const duration = parseFloat(getComputedStyle(canvas).transitionDuration) * 1000;
  setTimeout(() => {
    spinning = false;
    spinBtn.disabled = false;
    filtersEl.disabled = false;
    showResult(picked);
  }, duration + 50);
}

filtersEl.addEventListener("change", () => {
  ignoreHistory = false;
  render();
});
spinBtn.addEventListener("click", spin);
overrideBtn.addEventListener("click", () => {
  ignoreHistory = true;
  render();
});
document.getElementById("clear-history").addEventListener("click", () => {
  if (spinning) return;
  saveHistory([]);
  ignoreHistory = false;
  render();
});
render();
