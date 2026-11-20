// Vice City Trophy Guide — handover program (Node 22, standard library only).
// The guide itself is plain static files in app/ (index.html, app.js, style.css
// and data/trophies.json) plus 3–4 screenshots in screenshots/. This program
// copies both folders into the output directory and writes dossier.json with
// the vendored make.fun library, which is the summary the judge reads.
// vendor/makefun-frontend.ts is the kit's copy and stays untouched.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Folder this file lives in — app/ and screenshots/ sit beside it.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy a folder only when it is there, so a missing screenshots/ folder
// fails loudly later at the dossier step instead of here.
function copyIfPresent(name) {
  const from = join(repoRoot, name);
  if (!existsSync(from)) return false;
  cpSync(from, join(outDir, name), { recursive: true });
  return true;
}

function handIn() {
  mkdirSync(outDir, { recursive: true });
  const appCopied = copyIfPresent('app');
  const shotsCopied = copyIfPresent('screenshots');
  // Same caps the scorer enforces: at most 4 screenshots of 256 KiB, app/
  // at most 993 files and 48 MiB, and the dossier text capped at 160 KiB.
  writeFileSync(
    join(outDir, 'dossier.json'),
    buildDossier(outDir, {
      text_max_bytes: 163840,
      screenshots: { max: 4, max_bytes: 262144 },
      app_max_files: 993,
      app_max_bytes: 50331648,
    }),
  );
  console.log(`trophy guide handed in: app/ ${appCopied ? 'copied' : 'missing'}, screenshots/ ${shotsCopied ? 'copied' : 'missing'}, dossier.json written to ${outDir}`);
}

handIn();
