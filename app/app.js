// Vice City Trophy Guide: checklist tracker for the 55 GTA VI trophies.
// Loads app/data/trophies.json, renders the cards, and keeps progress in
// localStorage. No network beyond this one local file; no libraries.

const STORE_KEY = "vctg-progress-v1";
const KIND_LABELS = {
  story: "Story",
  side: "Side quests",
  collectibles: "Collectibles",
  activities: "Activities",
  crime: "Crime",
  other: "Other",
};
const DEMO_EARNED = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 35];

let trophies = [];
let earned = new Set();
let spoilerOn = false;
let openId = null;

const $ = (id) => document.getElementById(id);

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    earned = new Set(Array.isArray(saved.earned) ? saved.earned : []);
    spoilerOn = !!saved.spoiler;
  } catch (e) {
    earned = new Set();
    spoilerOn = false;
  }
}

function saveState() {
  localStorage.setItem(
    STORE_KEY,
    JSON.stringify({ earned: [...earned].sort((a, b) => a - b), spoiler: spoilerOn }),
  );
}

function readQuery() {
  const q = new URLSearchParams(location.search);
  return {
    view: q.get("view") || "checklist",
    filter: q.get("filter") || "",
    spoiler: q.get("spoiler") === "1",
    open: q.get("open") ? Number(q.get("open")) : null,
    seed: q.get("seed") === "1",
  };
}

function applyQuery(q) {
  if (q.seed) {
    DEMO_EARNED.forEach((id) => earned.add(id));
    saveState();
  }
  if (q.spoiler) {
    spoilerOn = true;
    $("spoilerBox").checked = true;
  }
  if (q.filter && KIND_LABELS[q.filter]) {
    $("kindFilter").value = q.filter;
  }
  if (q.open) openId = q.open;
  showView(q.view);
}

function showView(name) {
  const views = ["checklist", "roadmap", "missables", "sources"];
  const wanted = views.includes(name) ? name : "checklist";
  views.forEach((v) => {
    $("view-" + v).hidden = v !== wanted;
  });
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === wanted);
  });
}

function matchesFilters(t) {
  const query = $("searchBox").value.trim().toLowerCase();
  const grade = $("gradeFilter").value;
  const kind = $("kindFilter").value;
  const progress = $("earnedFilter").value;
  if (grade && t.grade !== grade) return false;
  if (kind === "missable") {
    if (!t.missable) return false;
  } else if (kind && t.kind !== kind) {
    return false;
  }
  if (progress === "earned" && !earned.has(t.id)) return false;
  if (progress === "unearned" && earned.has(t.id)) return false;
  if (query) {
    const hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
    if (!hay.includes(query)) return false;
  }
  return true;
}

function storyHidden(t) {
  return spoilerOn && t.kind === "story" && !earned.has(t.id);
}

function renderList() {
  const list = $("trophyList");
  list.innerHTML = "";
  const shown = trophies.filter(matchesFilters);
  shown.forEach((t) => {
    const li = document.createElement("li");
    li.className = "trophy-card" + (earned.has(t.id) ? " earned" : "");
    li.dataset.trophyId = String(t.id);

    const head = document.createElement("div");
    head.className = "trophy-head";

    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = earned.has(t.id);
    box.setAttribute("aria-label", "Mark " + t.name + " earned");
    box.addEventListener("change", () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      saveState();
      renderProgress();
      renderList();
    });
    head.appendChild(box);

    const title = document.createElement("div");
    title.className = "trophy-title";
    const name = document.createElement("p");
    name.className = "trophy-name";
    name.textContent = storyHidden(t) ? "Hidden story trophy" : t.name;
    name.addEventListener("click", () => {
      openId = openId === t.id ? null : t.id;
      renderList();
    });
    title.appendChild(name);
    const desc = document.createElement("p");
    desc.className = "trophy-desc";
    desc.textContent = storyHidden(t)
      ? "Earn this trophy to reveal its name and description."
      : t.description;
    title.appendChild(desc);

    const kind = document.createElement("span");
    kind.className = "kind-tag";
    kind.textContent = KIND_LABELS[t.kind] || t.kind;
    title.appendChild(kind);
    if (t.missable) {
      const flag = document.createElement("span");
      flag.className = "missable-tag";
      flag.textContent = "Missable";
      title.appendChild(flag);
    }
    head.appendChild(title);

    const pill = document.createElement("span");
    pill.className = "pill " + t.grade;
    pill.textContent = t.grade;
    head.appendChild(pill);
    li.appendChild(head);

    if (openId === t.id && !storyHidden(t)) {
      const guide = document.createElement("div");
      guide.className = "trophy-guide";
      const body = document.createElement("p");
      body.textContent = t.guide;
      guide.appendChild(body);
      const src = document.createElement("p");
      src.className = "trophy-source";
      src.textContent = "Source: " + t.source + " — ";
      const url = document.createElement("span");
      url.className = "source-url";
      url.textContent = t.sourceUrl;
      src.appendChild(url);
      guide.appendChild(src);
      li.appendChild(guide);
    }
    list.appendChild(li);
  });
  $("emptyNote").hidden = shown.length > 0;
  $("countLine").textContent =
    "Showing " + shown.length + " of " + trophies.length + " trophies.";
}

function renderProgress() {
  const total = trophies.length || 55;
  const done = earned.size;
  $("earnedCount").textContent = String(done);
  $("progressFill").style.width = Math.round((done / total) * 100) + "%";
  const counts = {};
  trophies.forEach((t) => {
    if (earned.has(t.id)) counts[t.grade] = (counts[t.grade] || 0) + 1;
  });
  $("gradeCounts").textContent = ["platinum", "gold", "silver", "bronze"]
    .map((g) => (counts[g] || 0) + " " + g)
    .join(" · ");
}

function exportProgress() {
  const blob = new Blob(
    [JSON.stringify({ earned: [...earned].sort((a, b) => a - b) }, null, 2)],
    { type: "application/json" },
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "vice-city-trophy-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (!Array.isArray(data.earned)) throw new Error("bad file");
      earned = new Set(data.earned.filter((id) => Number.isInteger(id)));
      saveState();
      renderProgress();
      renderList();
    } catch (e) {
      alert("That file does not look like exported progress.");
    }
  };
  reader.readAsText(file);
}

function wireUp() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => showView(tab.dataset.view));
  });
  ["searchBox", "gradeFilter", "kindFilter", "earnedFilter"].forEach((id) => {
    $(id).addEventListener("input", renderList);
    $(id).addEventListener("change", renderList);
  });
  $("spoilerBox").addEventListener("change", () => {
    spoilerOn = $("spoilerBox").checked;
    saveState();
    renderList();
  });
  $("exportBtn").addEventListener("click", exportProgress);
  $("importBtn").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = "";
  });
  $("resetBtn").addEventListener("click", () => {
    if (!confirm("Clear all earned trophies?")) return;
    earned = new Set();
    saveState();
    renderProgress();
    renderList();
  });
}

fetch("data/trophies.json")
  .then((r) => r.json())
  .then((data) => {
    trophies = data.trophies || data;
    loadState();
    wireUp();
    applyQuery(readQuery());
    renderProgress();
    renderList();
  });
