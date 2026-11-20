// Vice City Trophy Guide — tracker logic. Loads the trophy list from data/trophies.json,
// keeps earned ticks and the spoiler setting in localStorage, and renders the checklist,
// the roadmap, the missables page and the sources page. Deep links: ?view=checklist|roadmap|
// missables|sources, ?filter=<kind>, ?spoiler=1, ?open=<trophy id>, ?seed=1 (loads a demo
// progress set when nothing is saved yet, for screenshots).
const STORAGE_KEY = 'gta6-trophy-guide-v1';
const DEMO_EARNED = [2, 3, 4, 5, 8, 14, 16, 20, 21, 35, 42, 53];

const params = new URLSearchParams(location.search);
const state = loadState();
if (params.get('seed') === '1' && Object.keys(state.earned).length === 0) {
  for (const id of DEMO_EARNED) state.earned[id] = true;
  saveState();
}
if (params.get('spoiler') === '1') state.spoiler = true;

let DATA = null;

const KIND_LABELS = {
  story: 'Story',
  collectible: 'Collectible',
  activity: 'Activity',
  side: 'Side quest',
  crime: 'Crime',
  misc: 'Other',
  other: 'Other',
};

const STAGES = [
  { n: 1, title: 'Stage 1 — Play the story, Chapters 1 to 5', note: 'Finish the story first (60 to 80 hours). The 12 story trophies pop as you go, and the Chapter 1 meditation below is the only thing in the whole game you can miss — do it the moment it appears.' },
  { n: 2, title: 'Stage 2 — Character questlines', note: 'The side questlines for Andy, Kenton, Billy, Randy, Tyrone and Bret, plus the 8 stranger strands. All of them stay available after the story, so there is no rush — but they introduce features (Key Cloner, Snap Gun, fences) that the later stages need.' },
  { n: 3, title: 'Stage 3 — The 100% Completion Checklist', note: 'After the story, open Progress, then Stats, then 100% Completion and work the list: 70 of 80 challenges, 300 stunts, 200 vehicles scanned, 100 animals studied, all robberies, underwater discoveries, shooting ranges, drone races and Bret’s quests. This is the long grind — about 100 hours — and it pops most of the remaining trophies on the way.' },
  { n: 4, title: 'Stage 4 — Cleanup', note: 'Whatever is left: the crime trophies, the odd one-off moments (the UFO, the plane, the tank, the showroom) and the platinum itself. Check the Missables page once more before you call it done.' },
];

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return { earned: raw.earned ?? {}, spoiler: raw.spoiler ?? false };
  } catch {
    return { earned: {}, spoiler: false };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function earnedCount() {
  return DATA.trophies.filter((t) => state.earned[t.id]).length;
}

function isHiddenBySpoiler(t) {
  return state.spoiler && t.kind === 'story' && !state.earned[t.id];
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function trophyCard(t, { open = false } = {}) {
  const card = el('article', 'trophy-card' + (state.earned[t.id] ? ' earned' : ''));
  card.dataset.trophyId = String(t.id);

  const head = el('div', 'card-head');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = Boolean(state.earned[t.id]);
  box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
  box.addEventListener('change', () => {
    if (box.checked) state.earned[t.id] = true;
    else delete state.earned[t.id];
    saveState();
    refreshProgress();
    card.classList.toggle('earned', box.checked);
    renderList();
  });
  head.append(box);

  const titleWrap = el('div', 'card-titles');
  if (isHiddenBySpoiler(t)) {
    titleWrap.append(el('h3', 'trophy-name', 'Hidden story trophy'));
    titleWrap.append(el('p', 'trophy-desc', 'Earn it to reveal its name and description.'));
  } else {
    titleWrap.append(el('h3', 'trophy-name', t.name));
    titleWrap.append(el('p', 'trophy-desc', t.description));
  }
  head.append(titleWrap);

  const badges = el('div', 'badges');
  badges.append(el('span', 'grade grade-' + t.grade, t.grade));
  if (t.hidden) badges.append(el('span', 'badge hidden-badge', 'Hidden'));
  if (t.missable) badges.append(el('span', 'badge missable-badge', 'Potentially missable'));
  badges.append(el('span', 'badge kind-badge', KIND_LABELS[t.kind] ?? t.kind));
  if (t.count !== null && t.count !== undefined) {
    badges.append(el('span', 'badge count-badge', '0 / ' + formatCount(t)));
  }
  head.append(badges);
  card.append(head);

  if (!isHiddenBySpoiler(t)) {
    const guideBtn = el('button', 'guide-toggle', open ? 'Hide guide' : 'Show guide');
    guideBtn.type = 'button';
    const guideBox = el('div', 'guide-box' + (open ? '' : ' collapsed'));
    guideBox.append(el('p', 'guide-text', t.guide));
    const src = el('p', 'guide-source');
    src.append(el('strong', null, 'Source: '));
    src.append(document.createTextNode(t.source + ' — ' + t.sourceUrl));
    guideBox.append(src);
    guideBtn.addEventListener('click', () => {
      const hidden = guideBox.classList.toggle('collapsed');
      guideBtn.textContent = hidden ? 'Show guide' : 'Hide guide';
    });
    card.append(guideBtn, guideBox);
  }
  return card;
}

function formatCount(t) {
  if (t.id === 52) return '$250,000';
  if (t.id === 53) return '$100,000';
  return String(t.count);
}

function currentFilters() {
  return {
    q: (document.getElementById('search').value ?? '').trim().toLowerCase(),
    grade: document.getElementById('grade-filter').value,
    earned: document.getElementById('earned-filter').value,
    kind: document.querySelector('.kind-filters .kind.active')?.dataset.kind ?? 'all',
  };
}

function matchesKind(t, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return t.missable;
  if (kind === 'other') return t.kind === 'other' || t.kind === 'misc';
  return t.kind === kind;
}

function renderList() {
  const list = document.getElementById('trophy-list');
  const f = currentFilters();
  const openId = Number(params.get('open') ?? '0');
  list.replaceChildren();
  let shown = 0;
  for (const t of DATA.trophies) {
    if (f.grade !== 'all' && t.grade !== f.grade) continue;
    if (f.earned === 'earned' && !state.earned[t.id]) continue;
    if (f.earned === 'unearned' && state.earned[t.id]) continue;
    if (!matchesKind(t, f.kind)) continue;
    if (f.q) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + (KIND_LABELS[t.kind] ?? '')).toLowerCase();
      if (!hay.includes(f.q)) continue;
    }
    list.append(trophyCard(t, { open: t.id === openId }));
    shown += 1;
  }
  document.getElementById('result-count').textContent =
    shown + ' of ' + DATA.trophies.length + ' trophies shown';
  document.getElementById('empty-state').hidden = shown !== 0;
  if (openId) {
    const card = list.querySelector('[data-trophy-id="' + openId + '"]');
    if (card) {
      const rect = card.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        card.scrollIntoView({ block: 'nearest' });
      }
    }
  }
}

function renderMissables() {
  const list = document.getElementById('missable-list');
  list.replaceChildren();
  for (const t of DATA.trophies.filter((x) => x.missable)) {
    list.append(trophyCard(t, { open: true }));
  }
}

function renderRoadmap() {
  const wrap = document.getElementById('roadmap-stages');
  wrap.replaceChildren();
  for (const stage of STAGES) {
    const box = el('div', 'stage');
    box.append(el('h3', null, stage.title));
    box.append(el('p', null, stage.note));
    const chips = el('ul', 'stage-trophies');
    for (const t of DATA.trophies.filter((x) => x.stage === stage.n)) {
      const li = el('li', null);
      li.append(el('span', 'grade grade-' + t.grade, t.grade));
      li.append(document.createTextNode(' ' + (isHiddenBySpoiler(t) ? 'Hidden story trophy' : t.name)));
      if (state.earned[t.id]) li.classList.add('done');
      chips.append(li);
    }
    box.append(chips);
    wrap.append(box);
  }
}

function renderSources() {
  const list = document.getElementById('source-list');
  list.replaceChildren();
  for (const s of DATA.sources ?? []) {
    const li = el('li');
    li.textContent = s;
    list.append(li);
  }
}

function refreshProgress() {
  const n = earnedCount();
  const total = DATA.trophies.length;
  document.getElementById('progress-text').textContent = n + ' of ' + total + ' earned';
  document.getElementById('progress-pct').textContent = Math.round((100 * n) / total) + '%';
  document.getElementById('progress-fill').style.width = (100 * n) / total + '%';
}

function showView(name) {
  for (const btn of document.querySelectorAll('.tabs .tab')) {
    btn.classList.toggle('active', btn.dataset.view === name);
  }
  for (const section of document.querySelectorAll('main .view')) {
    section.classList.toggle('active', section.id === 'view-' + name);
  }
}

function bindControls() {
  for (const btn of document.querySelectorAll('.tabs .tab')) {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  }
  for (const btn of document.querySelectorAll('.kind-filters .kind')) {
    btn.addEventListener('click', () => {
      for (const b of document.querySelectorAll('.kind-filters .kind')) b.classList.remove('active');
      btn.classList.add('active');
      renderList();
    });
  }
  document.getElementById('search').addEventListener('input', renderList);
  document.getElementById('grade-filter').addEventListener('change', renderList);
  document.getElementById('earned-filter').addEventListener('change', renderList);

  const spoilerBox = document.getElementById('spoiler-check');
  spoilerBox.checked = state.spoiler;
  spoilerBox.addEventListener('change', () => {
    state.spoiler = spoilerBox.checked;
    saveState();
    renderList();
    renderMissables();
    renderRoadmap();
  });

  document.getElementById('export-btn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: Object.keys(state.earned).map(Number).sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gta6-trophy-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById('import-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      const ids = Array.isArray(raw) ? raw : raw.earned;
      if (!Array.isArray(ids)) throw new Error('bad file');
      state.earned = {};
      for (const id of ids) {
        if (DATA.trophies.some((t) => t.id === id)) state.earned[id] = true;
      }
      saveState();
      refreshProgress();
      renderList();
      renderMissables();
      renderRoadmap();
    } catch {
      alert('That file is not a trophy progress export from this guide.');
    }
    e.target.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (!confirm('Clear every earned tick? This cannot be undone.')) return;
    state.earned = {};
    saveState();
    refreshProgress();
    renderList();
    renderMissables();
    renderRoadmap();
  });
}

async function init() {
  DATA = await (await fetch('data/trophies.json')).json();
  const kindParam = params.get('filter');
  if (kindParam && document.querySelector('.kind-filters .kind[data-kind="' + kindParam + '"]')) {
    for (const b of document.querySelectorAll('.kind-filters .kind')) {
      b.classList.toggle('active', b.dataset.kind === kindParam);
    }
  }
  bindControls();
  renderList();
  renderMissables();
  renderRoadmap();
  renderSources();
  refreshProgress();
  const view = params.get('view');
  if (view && document.getElementById('view-' + view)) showView(view);
}

init();
