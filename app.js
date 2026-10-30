const MOOD_LABELS = { spicy: "🌶️ 매운", quick: "⚡ 빠른", hearty: "🍚 든든한", light: "🥗 가벼운" };
const COLORS = ["#8b0029", "#c9a227", "#b23a5a", "#e0c36a", "#5e0a22", "#d9786f"];
const SPIN_TURNS = 5;

const filtersEl = document.getElementById("filters");
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spin");
const countEl = document.getElementById("match-count");
const resultEl = document.getElementById("result");

let candidates = [];
let rotation = 0;
let spinning = false;

const won = (n) => n.toLocaleString("ko-KR") + "원";

function readFilters() {
  return {
    budget: Number(filtersEl.querySelector("input[name=budget]:checked").value),
    group: Number(filtersEl.querySelector("input[name=group]:checked").value),
    moods: [...filtersEl.querySelectorAll("input[name=mood]:checked")].map((el) => el.value),
  };
}

// 예산·인원은 모두 만족해야 하고, 기분은 하나라도 맞으면 통과 (선택 안 하면 전부 통과)
function getCandidates({ budget, group, moods }) {
  return RESTAURANTS.filter(
    (r) =>
      (budget === 0 || r.price <= budget) &&
      r.maxGroup >= group &&
      (moods.length === 0 || moods.some((m) => r.moods.includes(m)))
  );
}

function shortName(name) {
  return name.length > 9 ? name.slice(0, 8) + "…" : name;
}

function drawWheel(items) {
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
    ctx.fillText("후보 없음", c, c);
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

function render() {
  candidates = getCandidates(readFilters());
  if (candidates.length <= 1) resetRotation();
  drawWheel(candidates);
  resultEl.hidden = true;

  if (candidates.length === 0) {
    countEl.textContent = "조건에 맞는 식당이 없어요. 조건을 조금 넓혀 보세요.";
    spinBtn.disabled = true;
  } else if (candidates.length === 1) {
    countEl.textContent = "조건에 맞는 식당이 딱 1곳이에요!";
    spinBtn.disabled = false;
    spinBtn.textContent = "결과 보기";
  } else {
    countEl.textContent = `후보 ${candidates.length}곳`;
    spinBtn.disabled = false;
    spinBtn.textContent = "룰렛 돌리기";
  }
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
}

function spin() {
  if (spinning || candidates.length === 0) return;
  if (candidates.length === 1) {
    showResult(candidates[0]);
    return;
  }

  // 당첨 식당을 먼저 균등하게 뽑고, 포인터가 그 칸 안쪽에 멈추도록 회전 각도를 계산한다
  const n = candidates.length;
  const seg = 360 / n;
  const winner = Math.floor(Math.random() * n);
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
    showResult(candidates[winner]);
  }, duration + 50);
}

filtersEl.addEventListener("change", render);
spinBtn.addEventListener("click", spin);
render();
