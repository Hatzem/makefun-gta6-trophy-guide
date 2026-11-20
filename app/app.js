// Vice City Trophy Guide: a checklist, roadmap and source-cited guide for the 55
// GTA VI trophies, saved in localStorage. Everything is local: the only fetch is
// the trophy data file, and no address in the app is ever loaded over the network.
const STORAGE_KEY = 'vice-city-trophy-guide-v1';
const params = new URLSearchParams(location.search);

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;

let earned = new Set();
try {
  earned = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
} catch {
  earned = new Set();
}
earned = new Set([...earned].filter((name) => trophies.some((t) => t.name === name)));

let currentView = params.get('view') || 'checklist';
let openName = params.get('open') || null;
let spoilerOn = params.get('spoiler') === '1';

const stageNotes = {
  1: {
    title: 'Stage 1 — Chapters 1 and 2 (about 30 to 40 hours)',
    body: 'Play the story and enjoy it. Do the one thing that cannot wait: the Chapter 1 meditation at Jason’s house for Positive Mental Attitude, right after the mission Down to Earth. Along the way, meet Cal, Kenton and Billy, scan every new vehicle with the WAiNK app and study every new animal through the binoculars — the 100% checklist counts both later.',
  },
  2: {
    title: 'Stage 2 — Chapters 3 and 4 (about 30 to 40 hours)',
    body: 'Keep the story going and take the questlines as they open: Andy’s Lucia-only line, Tyrone’s Jason-only lab raids, Randy’s sports-car wish list, Bret’s hunts, the jewelry jobs that unlock the Snap Gun, the Key Cloner, and Kingpin Bowling. Bring your partner along for the co-op crime trophies once Coffee Break unlocks duo free-roam.',
  },
  3: {
    title: 'Stage 3 — Chapter 5 and the 100% checklist (about 100 hours)',
    body: 'Finish the story, then open the checklist at Progress, then Stats, then 100% Completion. This is the long grind: 300 stunts, 42 gold shooting-range medals, every drone race, every robbery, 15 of 18 card sets, 100 WAiNK scans, 70 of 80 challenges, and 15 of 18 meditations. Work it in any order you like; the checklist itself tracks what is left.',
  },
  4: {
    title: 'Stage 4 — Cleanup (about 10 hours)',
    body: 'Finish the eight qualifying Strangers & Freaks strands, the last miscellaneous trophies, and anything the checklist left behind. The platinum pops the moment the final trophy lands.',
  },
};

const kindLabels = {
  story: 'Story',
  stranger: 'Strangers & questlines',
  activities: 'Activities',
  collectibles: 'Collectibles',
  crime: 'Crime & robberies',
  exploration: 'Exploration',
  money: 'Money & property',
  completion: '100% completion',
  misc: 'Miscellaneous',
  platinum: 'Platinum',
};

const $ = (id) => document.getElementById(id);
const cardsEl = $('cards');
const detailEl = $('detail');

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

function gradeCounts() {
  const out = {};
  for (const t of trophies) out[t.grade] = (out[t.grade] ?? 0) + (earned.has(t.name) ? 1 : 0);
  return out;
}

function renderProgress() {
  const total = trophies.length;
  const got = earned.size;
  $('progressText').textContent = `${got} of ${total} earned`;
  $('progressPct').textContent = `${Math.round((got / total) * 100)}%`;
  $('progressFill').style.width = `${(got / total) * 100}%`;
  const counts = gradeCounts();
  const totals = {};
  for (const t of trophies) totals[t.grade] = (totals[t.grade] ?? 0) + 1;
  $('progressGrades').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${counts[g] ?? 0}/${totals[g]} ${g}`)
    .join(' · ');
}

function trophyHidden(t) {
  return spoilerOn && t.kind === 'story' && !earned.has(t.name);
}

function cardNode(t) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(t.name) ? ' earned' : '');
  card.dataset.name = t.name;
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', `Mark ${t.name} earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    save();
    renderProgress();
    renderCards();
    if (openName === t.name) showDetail(t);
  });
  const body = document.createElement('div');
  body.className = 'card-body';
  const title = document.createElement('h3');
  title.textContent = trophyHidden(t) ? 'Hidden story trophy' : t.name;
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = trophyHidden(t)
    ? 'Earn this story trophy to reveal its name and description.'
    : t.description;
  const tags = document.createElement('p');
  tags.className = 'tags';
  const grade = document.createElement('span');
  grade.className = `pill grade-${t.grade}`;
  grade.textContent = t.grade;
  tags.append(grade);
  if (t.kind !== 'platinum') {
    const kind = document.createElement('span');
    kind.className = 'pill kind';
    kind.textContent = kindLabels[t.kind] ?? t.kind;
    tags.append(kind);
  }
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'pill missable';
    m.textContent = 'missable';
    tags.append(m);
  }
  if (t.hidden) {
    const h = document.createElement('span');
    h.className = 'pill hidden-tag';
    h.textContent = 'hidden';
    tags.append(h);
  }
  body.append(title, desc, tags);
  card.append(box, body);
  card.addEventListener('click', (event) => {
    if (event.target === box) return;
    openName = t.name;
    showDetail(t);
    document.querySelectorAll('.card.selected').forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');
  });
  return card;
}

function renderCards() {
  const q = $('search').value.trim().toLowerCase();
  const grade = $('gradeFilter').value;
  const kind = $('kindFilter').value;
  const earnedFilter = $('earnedFilter').value;
  cardsEl.replaceChildren();
  let shown = 0;
  for (const t of trophies) {
    if (grade !== 'all' && t.grade !== grade) continue;
    if (kind !== 'all' && t.kind !== kind) continue;
    if (earnedFilter === 'earned' && !earned.has(t.name)) continue;
    if (earnedFilter === 'unearned' && earned.has(t.name)) continue;
    if (earnedFilter === 'missable' && !t.missable) continue;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) continue;
    cardsEl.append(cardNode(t));
    shown += 1;
  }
  if (shown === 0) {
    const empty = document.createElement('p');
    empty.className = 'hint';
    empty.textContent = 'No trophies match these filters. Clear the search or widen the filters.';
    cardsEl.append(empty);
  }
}

function showDetail(t) {
  detailEl.replaceChildren();
  const head = document.createElement('h2');
  head.textContent = trophyHidden(t) ? 'Hidden story trophy' : t.name;
  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  meta.textContent = `${t.grade} · ${kindLabels[t.kind] ?? t.kind}${t.missable ? ' · missable' : ''}${t.hidden ? ' · hidden on PlayStation' : ''}`;
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = trophyHidden(t) ? 'Earn this story trophy to reveal its name and description.' : t.description;
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = t.guide;
  const source = document.createElement('p');
  source.className = 'source';
  const label = document.createElement('strong');
  label.textContent = 'Source: ';
  source.append(label, document.createTextNode(t.source));
  const url = document.createElement('span');
  url.className = 'source-url';
  url.textContent = t.sourceUrl;
  source.append(document.createElement('br'), url);
  const earnedBtn = document.createElement('button');
  earnedBtn.type = 'button';
  earnedBtn.textContent = earned.has(t.name) ? 'Mark as not earned' : 'Mark as earned';
  earnedBtn.addEventListener('click', () => {
    if (earned.has(t.name)) earned.delete(t.name);
    else earned.add(t.name);
    save();
    renderProgress();
    renderCards();
    showDetail(t);
  });
  detailEl.append(head, meta, desc, guide, source, earnedBtn);
}

function renderRoadmap() {
  const root = $('roadmap');
  root.replaceChildren();
  for (const stage of [1, 2, 3, 4]) {
    const section = document.createElement('section');
    section.className = 'stage';
    const title = document.createElement('h2');
    title.textContent = stageNotes[stage].title;
    const body = document.createElement('p');
    body.textContent = stageNotes[stage].body;
    const list = document.createElement('ul');
    for (const t of trophies.filter((x) => x.stage === stage)) {
      const li = document.createElement('li');
      const mark = document.createElement('input');
      mark.type = 'checkbox';
      mark.checked = earned.has(t.name);
      mark.disabled = true;
      const text = document.createElement('span');
      text.textContent = ` ${t.name} — ${t.grade}${t.missable ? ' · missable' : ''}`;
      li.append(mark, text);
      list.append(li);
    }
    section.append(title, body, list);
    root.append(section);
  }
}

function renderMissables() {
  const root = $('missables');
  root.replaceChildren();
  const flagged = trophies.filter((t) => t.missable);
  for (const t of flagged) {
    const card = document.createElement('article');
    card.className = 'missable-card';
    const title = document.createElement('h2');
    title.textContent = `${t.name} — ${t.grade}`;
    const guide = document.createElement('p');
    guide.textContent = t.guide;
    const source = document.createElement('p');
    source.className = 'source';
    source.textContent = `Source: ${t.source}`;
    card.append(title, guide, source);
    root.append(card);
  }
  const note = document.createElement('p');
  note.className = 'hint';
  note.textContent = 'Everything else is safe: all quest givers tied to trophies come back after the story, optional missions that expire do not count toward any trophy, and the 100% checklist can be finished entirely in free-roam. Keep a manual save at the start and end of each chapter anyway, since missions cannot be replayed.';
  root.append(note);
}

function renderSources() {
  const root = $('sources');
  root.replaceChildren();
  const seen = new Map();
  for (const t of trophies) {
    if (!seen.has(t.sourceUrl)) seen.set(t.sourceUrl, { name: t.source, url: t.sourceUrl, count: 0 });
    seen.get(t.sourceUrl).count += 1;
  }
  for (const { name, url, count } of seen.values()) {
    const item = document.createElement('div');
    item.className = 'source-item';
    const title = document.createElement('h3');
    title.textContent = name;
    const addr = document.createElement('p');
    addr.className = 'source-url';
    addr.textContent = url;
    const meta = document.createElement('p');
    meta.className = 'hint';
    meta.textContent = `Cited by ${count} of the 55 trophy guides in this app.`;
    item.append(title, addr, meta);
    root.append(item);
  }
}

function setView(name) {
  currentView = name;
  for (const btn of document.querySelectorAll('.view-btn')) {
    btn.classList.toggle('active', btn.dataset.view === name);
  }
  for (const id of ['checklist', 'roadmap', 'missables', 'sources']) {
    $(`view-${id}`).hidden = id !== name;
  }
  $('toolbar').style.display = name === 'checklist' ? '' : 'none';
  if (name === 'roadmap') renderRoadmap();
  if (name === 'missables') renderMissables();
  if (name === 'sources') renderSources();
}

for (const btn of document.querySelectorAll('.view-btn')) {
  btn.addEventListener('click', () => setView(btn.dataset.view));
}
for (const id of ['search', 'gradeFilter', 'kindFilter', 'earnedFilter']) {
  $(id).addEventListener('input', renderCards);
  $(id).addEventListener('change', renderCards);
}
$('spoilerToggle').addEventListener('change', () => {
  spoilerOn = $('spoilerToggle').checked;
  renderCards();
  if (openName) {
    const t = trophies.find((x) => x.name === openName);
    if (t) showDetail(t);
  }
});
$('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: data.game, earned: [...earned] }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'vice-city-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const names = Array.isArray(parsed) ? parsed : parsed.earned ?? [];
    earned = new Set(names.filter((name) => trophies.some((t) => t.name === name)));
    save();
    renderProgress();
    renderCards();
  } catch {
    alert('That file is not a progress export from this guide.');
  }
  event.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear every earned tick?')) return;
  earned = new Set();
  save();
  renderProgress();
  renderCards();
  detailEl.replaceChildren();
  detailEl.append(Object.assign(document.createElement('p'), { className: 'hint', textContent: 'Pick a trophy to read its guide.' }));
});

// Deep links: ?view=roadmap|missables|sources, ?filter=<kind>, ?spoiler=1,
// ?open=<trophy id or name>, ?seed=1 for a demo set of earned trophies.
if (params.get('filter')) {
  const kind = params.get('filter');
  if ([...$('kindFilter').options].some((o) => o.value === kind)) $('kindFilter').value = kind;
}
if (params.get('seed') === '1') {
  earned = new Set(trophies.filter((t) => [2, 3, 4, 8, 9, 16, 20, 21, 35, 42, 44, 53, 54, 55].includes(t.id) || t.kind === 'story').map((t) => t.name));
  save();
}
if (params.get('spoiler') === '1') $('spoilerToggle').checked = true;
detailEl.append(Object.assign(document.createElement('p'), { className: 'hint', textContent: 'Pick a trophy to read its guide.' }));
renderProgress();
renderCards();
setView(['checklist', 'roadmap', 'missables', 'sources'].includes(currentView) ? currentView : 'checklist');
if (openName) {
  const byId = trophies.find((t) => String(t.id) === openName);
  const byName = trophies.find((t) => t.name.toLowerCase() === openName.toLowerCase());
  const t = byId ?? byName;
  if (t) {
    openName = t.name;
    showDetail(t);
    document.querySelector(`.card[data-name="${CSS.escape(t.name)}"]`)?.classList.add('selected');
  }
}
