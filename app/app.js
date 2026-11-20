// Vice City Trophy Guide — tracker and guide viewer, no libraries, no network.
// Loads app/data/trophies.json once, keeps earned ticks in localStorage, and
// renders the checklist, roadmap, missables and sources views from that data.

const EARNED_KEY = 'vice-city-trophy-guide-earned-v1';
const SPOILER_KEY = 'vice-city-trophy-guide-spoiler-v1';

const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABEL = {
  story: 'Story', missable: 'Missable', collectibles: 'Collectibles',
  activities: 'Activities', 'side quests': 'Side quests', crime: 'Crime', other: 'Other'
};

// Demo progress for screenshots (?seed=1): a plausible early-game set.
const SEED_EARNED = [2, 3, 4, 8, 9, 15, 16, 20, 21, 31, 35, 42, 44, 53];

const STAGES = [
  {
    n: 1, title: 'Play the story', time: '60–80 hours',
    text: 'Finish the five chapters and enjoy it. Do the Chapter 1 balcony meditation the moment it appears, scan new vehicles with WAiNK and study new animals with the binoculars as you go — the 100% checklist counts progress made during the story. Take optional missions as they appear; they introduce robberies, fishing, hunting and the rest.'
  },
  {
    n: 2, title: 'The 100% checklist', time: 'about 100 hours',
    text: 'After the story, the checklist opens under Progress > Stats > 100% Completion. Work through the box below — robberies, stunts, scans, collections and 70 of the 80 challenges. This is where A Long Road and most of the silver trophies land.'
  },
  {
    n: 3, title: 'Strangers & Freaks and the questlines', time: 'about 10 hours',
    text: 'Finish the eight counting stranger strands and the final missions for Andy, Kenton, Billy, Randy, Tyrone and Bret. Everything is still available after the story, so mop them up in any order.'
  },
  {
    n: 4, title: 'Whatever is left', time: 'a few hours',
    text: 'Partner trophies, crime trophies, money trophies and the odd ones — the UFO, the still-unconfirmed Bad Luck, I Guess, maximum strength for both characters, and 500 profile actions. When the last of these pops, the platinum follows.'
  }
];

const CHECKLIST_100 = [
  '100 optional missions (purple icons, and black icons with pink letters)',
  '300 of 397 stunts',
  '200 of 277 base-model vehicles scanned',
  '100 of 255 animals studied',
  '15 of 18 meditations',
  '15 of 18 collectible card sets',
  '100 WAiNK locations',
  '33 underwater discoveries',
  '100 Cocaine Flamingos',
  '39 gang operations',
  '22 bank jobs — 14 small banks + 8 large vaults',
  '7 payday loan jobs',
  '42 shooting range gold medals',
  '14 Top Fun drone race locations',
  '15 Target Decks (Bret’s hunts)',
  'Any 70 of the 80 challenges'
];

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);

let doc = null;
let earned = new Set();
let spoiler = false;

function loadState() {
  try { earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) || '[]')); }
  catch (e) { earned = new Set(); }
  try { spoiler = localStorage.getItem(SPOILER_KEY) === '1'; }
  catch (e) { spoiler = false; }
  if (params.get('seed') === '1') {
    for (const id of SEED_EARNED) earned.add(id);
  }
  if (params.get('spoiler') === '1') spoiler = true;
}

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function fmt(n) {
  return Number(n).toLocaleString('en-US');
}

function updateProgress() {
  const total = doc.trophies.length;
  const done = doc.trophies.filter((t) => earned.has(t.id)).length;
  $('earned-count').textContent = done + ' / ' + total + ' earned';
  $('earned-pct').textContent = Math.round((done / total) * 100) + '%';
  $('earned-fill').style.width = (done / total) * 100 + '%';
  const counts = $('grade-counts');
  counts.replaceChildren();
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    const have = doc.trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    const all = doc.trophies.filter((t) => t.grade === g).length;
    counts.append(el('span', 'grade-count grade-' + g, GRADE_LABEL[g] + ' ' + have + '/' + all));
  }
}

function sourceLine(t) {
  const wrap = el('p', 'source');
  wrap.append(el('span', 'source-label', 'Source: '));
  wrap.append(el('span', null, t.source));
  wrap.append(el('span', 'source-url', ' — ' + t.sourceUrl));
  if (t.source2) {
    wrap.append(el('span', null, ' · Also: ' + t.source2));
    wrap.append(el('span', 'source-url', ' — ' + t.sourceUrl2));
  }
  return wrap;
}

function trophyCard(t) {
  const card = el('article', 'card grade-' + t.grade);
  card.id = 'trophy-' + t.id;
  const hiddenStory = spoiler && t.kind === 'story' && !earned.has(t.id);

  const head = el('div', 'card-head');
  const tick = document.createElement('input');
  tick.type = 'checkbox';
  tick.checked = earned.has(t.id);
  tick.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
  tick.addEventListener('change', () => {
    if (tick.checked) earned.add(t.id); else earned.delete(t.id);
    saveEarned();
    updateProgress();
    renderChecklist();
  });
  head.append(tick);
  head.append(el('span', 'pill grade-' + t.grade, GRADE_LABEL[t.grade]));
  head.append(el('span', 'pill kind', KIND_LABEL[t.kind] || t.kind));
  if (t.missable && t.kind !== 'missable') head.append(el('span', 'pill missable', 'Missable'));
  if (t.target !== undefined) head.append(el('span', 'pill target', 'Target: ' + fmt(t.target)));
  if (earned.has(t.id)) head.append(el('span', 'pill earned', 'Earned'));
  card.append(head);

  if (hiddenStory) {
    card.append(el('h3', 'card-name hidden-name', 'Hidden story trophy'));
    card.append(el('p', 'card-desc', 'Turn off “Hide story spoilers” or earn this trophy to see its name and guide.'));
  } else {
    card.append(el('h3', 'card-name', t.name));
    card.append(el('p', 'card-desc', t.description));
    card.append(el('p', 'card-guide', t.guide));
    card.append(sourceLine(t));
  }
  return card;
}

function renderChecklist() {
  const grid = $('card-grid');
  grid.replaceChildren();
  const q = ($('search').value || '').trim().toLowerCase();
  const grade = $('filter-grade').value;
  const kind = $('filter-kind').value;
  const prog = $('filter-earned').value;
  let shown = 0;
  for (const t of doc.trophies) {
    if (grade && t.grade !== grade) continue;
    if (kind && t.kind !== kind) continue;
    if (prog === 'earned' && !earned.has(t.id)) continue;
    if (prog === 'unearned' && earned.has(t.id)) continue;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) continue;
    grid.append(trophyCard(t));
    shown += 1;
  }
  $('result-line').textContent = 'Showing ' + shown + ' of ' + doc.trophies.length + ' trophies.';
  $('empty-note').hidden = shown !== 0;
}

function renderRoadmap() {
  const host = $('roadmap-stages');
  host.replaceChildren();
  for (const s of STAGES) {
    const box = el('div', 'stage');
    const head = el('div', 'stage-head');
    head.append(el('span', 'stage-num', 'Stage ' + s.n));
    head.append(el('h3', null, s.title));
    head.append(el('span', 'stage-time', s.time));
    box.append(head);
    box.append(el('p', null, s.text));
    const chips = el('div', 'stage-trophies');
    for (const t of doc.trophies.filter((x) => x.stage === s.n)) {
      const chip = el('span', 'trophy-chip grade-' + t.grade + (earned.has(t.id) ? ' chip-earned' : ''), t.name);
      chip.title = t.description;
      chips.append(chip);
    }
    box.append(chips);
    host.append(box);
  }
  const list = $('checklist-items');
  list.replaceChildren();
  for (const item of CHECKLIST_100) list.append(el('li', null, item));
}

function renderMissables() {
  const host = $('missable-list');
  host.replaceChildren();
  const found = doc.trophies.filter((t) => t.missable);
  if (!found.length) {
    host.append(el('p', null, 'No missable trophies are known for this game.'));
    return;
  }
  for (const t of found) {
    const box = el('div', 'missable-card');
    box.append(el('h3', null, t.name + ' — ' + GRADE_LABEL[t.grade]));
    box.append(el('p', null, t.description));
    box.append(el('p', null, t.guide));
    box.append(sourceLine(t));
    host.append(box);
  }
  host.append(el('p', 'safe-note', 'Every other trophy stays earnable in free-roam after the story, including all stranger questlines and all collectibles.'));
}

function renderSources() {
  const host = $('source-list');
  host.replaceChildren();
  const seen = new Map();
  for (const t of doc.trophies) {
    if (!seen.has(t.source)) seen.set(t.source, t.sourceUrl);
    if (t.source2 && !seen.has(t.source2)) seen.set(t.source2, t.sourceUrl2);
  }
  for (const [name, url] of seen) {
    const li = el('li', 'source-item');
    li.append(el('strong', null, name));
    li.append(el('span', 'source-url', ' — ' + url));
    host.append(li);
  }
}

function showView(name) {
  for (const b of document.querySelectorAll('.tab')) {
    b.classList.toggle('active', b.dataset.view === name);
  }
  for (const s of document.querySelectorAll('.view')) {
    s.classList.toggle('active', s.id === 'view-' + name);
  }
}

function bindToolbar() {
  for (const id of ['search', 'filter-grade', 'filter-kind', 'filter-earned']) {
    $(id).addEventListener('input', renderChecklist);
    $(id).addEventListener('change', renderChecklist);
  }
  $('spoiler-toggle').addEventListener('change', (e) => {
    spoiler = e.target.checked;
    saveSpoiler();
    renderChecklist();
  });
  for (const b of document.querySelectorAll('.tab')) {
    b.addEventListener('click', () => showView(b.dataset.view));
  }
  $('btn-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vice-city-trophy-guide-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('btn-import').addEventListener('click', () => $('file-import').click());
  $('file-import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const ids = Array.isArray(data) ? data : data.earned;
      const valid = new Set(doc.trophies.map((t) => t.id));
      earned = new Set((ids || []).filter((id) => valid.has(Number(id))).map(Number));
      saveEarned();
      updateProgress();
      renderChecklist();
    } catch (err) {
      alert('That file could not be read as trophy progress.');
    }
    e.target.value = '';
  });
  $('btn-reset').addEventListener('click', () => {
    if (confirm('Clear all earned ticks?')) {
      earned = new Set();
      saveEarned();
      updateProgress();
      renderChecklist();
    }
  });
}

async function boot() {
  loadState();
  const res = await fetch('data/trophies.json');
  doc = await res.json();
  $('spoiler-toggle').checked = spoiler;
  const kindParam = params.get('filter');
  if (kindParam && KIND_LABEL[kindParam]) $('filter-kind').value = kindParam;
  const viewParam = params.get('view');
  if (viewParam && ['checklist', 'roadmap', 'missables', 'sources'].includes(viewParam)) showView(viewParam);
  bindToolbar();
  updateProgress();
  renderChecklist();
  renderRoadmap();
  renderMissables();
  renderSources();
  const openId = Number(params.get('open'));
  if (openId) {
    const target = document.getElementById('trophy-' + openId);
    if (target) {
      target.classList.add('highlight');
      target.scrollIntoView({ block: 'center' });
    }
  }
}

boot();
