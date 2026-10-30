const won = (n) => n.toLocaleString("ko-KR") + "원";

function renderList(items) {
  const list = document.getElementById("list");
  list.innerHTML = items
    .map((r) => `<li><strong>${r.name}</strong><span>${r.category} · ${won(r.price)} · 도보 ${r.walk}분</span></li>`)
    .join("");
}

renderList(RESTAURANTS);
