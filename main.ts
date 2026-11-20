// Vice City Trophy Guide — the entrypoint (Node 22, standard library only).
// The guide itself is plain static files in app/ (index.html, app.js, style.css and
// data/trophies.json), with 3 or 4 screenshots of it in screenshots/. This program hands
// the entry in: it copies app/ and screenshots/ beside this file into the output
// directory and writes dossier.json there with the vendored make.fun library, which
// the scorer rebuilds byte for byte. vendor/makefun-frontend.ts must stay unchanged.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(name: string): void {
  const from = join(repoRoot, name);
  const to = join(outDir, name);
  if (!existsSync(from)) return;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
copyTree('app');
copyTree('screenshots');

const shotCount = existsSync(join(outDir, 'screenshots'))
  ? readdirSync(join(outDir, 'screenshots')).filter((f) => !f.startsWith('.')).length
  : 0;

writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

console.log(`trophy guide handed in: ${shotCount} screenshot(s), dossier.json written to ${outDir}`);
