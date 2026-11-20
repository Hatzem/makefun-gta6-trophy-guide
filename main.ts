// Vice City Trophy Guide — the program that hands the entry in.
//
// It runs on Node 22 with the standard library only, in a container with no
// network. It copies the guide (app/) and its screenshots (screenshots/) from
// this directory into the output directory, then writes dossier.json with the
// vendored make.fun library. The dossier is what the judge reads: the
// screenshots, the first load's files and bytes, and the guide's source.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used instead.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(source, target) {
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
}

function checkScreenshots(dir) {
  const shots = readdirSync(dir).filter((name) => !name.startsWith('.'));
  if (shots.length < 3 || shots.length > 4) {
    throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
  }
  for (const name of shots) {
    const size = statSync(join(dir, name)).size;
    if (size > 262144) throw new Error(`screenshot ${name} is ${size} bytes, over the 256 KiB cap`);
  }
  return shots.length;
}

function checkTrophyData(dir) {
  const data = JSON.parse(readFileSync(join(dir, 'data', 'trophies.json'), 'utf8'));
  if (!Array.isArray(data.trophies) || data.trophies.length !== 55) {
    throw new Error(`expected 55 trophies, found ${data.trophies?.length ?? 0}`);
  }
  return data.trophies.length;
}

copyTree(join(repoRoot, 'app'), join(outDir, 'app'));
const trophyCount = checkTrophyData(join(outDir, 'app'));
console.log(`trophy guide handed in: ${trophyCount} trophies`);
const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) {
  copyTree(shotsDir, join(outDir, 'screenshots'));
  const count = checkScreenshots(join(outDir, 'screenshots'));
  console.log(`trophy guide handed in: ${count} screenshot(s), dossier.json written to ${outDir}`);
}

writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
