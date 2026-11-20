// Vice City Trophy Guide — hand-in program (Node 22, standard library only).
//
// The guide itself is plain static files in app/ next to this file: index.html
// opens in a browser with app/ at the server root, loads nothing over the
// network, and reads its trophy list from app/data/trophies.json. This program
// does the hand-in: it copies app/ and screenshots/ into the output directory
// and writes dossier.json there, the summary the judge reads, using the
// vendored make.fun library. vendor/makefun-frontend.ts is left untouched —
// the scorer requires the dossier to be byte for byte what its copy writes.
//
// Run it locally with:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice and the two dossiers must be byte-identical.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const shotsDir = join(repoRoot, "screenshots");

// An entry with no screenshots is invalid, so refuse to hand one in rather
// than writing a dossier the gate would reject.
if (!existsSync(shotsDir)) {
  throw new Error("screenshots/ is missing: take the screenshots first");
}

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, "screenshots"), { recursive: true });
}

// Caps mirror the scorer's gate: at most 4 screenshots of 256 KiB each,
// app/ at most 993 files and 48 MiB, and the dossier text at most 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);

console.log("trophy guide handed in: dossier.json written to " + outputDir);
