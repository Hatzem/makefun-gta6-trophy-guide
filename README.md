# Vice City Trophy Guide

[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/Hatzem/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/Hatzem/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

The best offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — built for [make.fun's "Build the best GTA 6 trophy guide" bounty](https://make.fun/bounty/gta6-trophy-guide-01), $250 in USDC.

## What it is

A static web app under `app/` with no build step and no network: open `app/index.html` in desktop Chrome and it works with the network off. Every trophy shows its official name, description and grade exactly as PlayStation lists them, plus a guide written for this app that names its source.

## Features

- **Tracker** — all 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden) as cards you tick off. Progress saves in localStorage and can be exported to a file and imported back, or reset.
- **Filters** — search by name or keyword, filter by grade, by kind (story, strangers & questlines, activities, collectibles, crime & robberies, exploration, money & property, 100% completion, miscellaneous), by earned state, and by missable only.
- **Spoiler setting** — hides the names and descriptions of un-earned story trophies behind "Hidden story trophy" placeholders until you earn them.
- **Roadmap to the platinum** — four stages over about 200 hours: story and the one missable meditation first, the stranger questlines in Chapters 3–4, the 100% completion checklist after the story, then cleanup.
- **Missables page** — the single trophy that can be missed (Positive Mental Attitude, Chapter 1 meditation) with the exact moment to do it, plus why everything else is safe.
- **Cited guides** — every trophy's guide names its source beside it, with the source address as plain text. The app itself fetches nothing.

## Facts the guide is built on

- Difficulty about 4/10, roughly 200 hours, one playthrough, no online trophies, no mission replay, no New Game+.
- Cheats disable trophies and saving. Keep a manual save at the start and end of each chapter (15 manual slots).
- The 100% checklist is forgiving: closer to 60% true completion. Only the robberies, underwater discoveries, shooting ranges, drone races and Bret's hunts must be done in full.
- Two methods are still unconfirmed and the guide says so: Bad Luck, I Guess (believed tied to the Payday Loans store from the prologue) and Fair Game (which exact animal pops it). Nothing is invented for either.

## Sources

Guides were written from PowerPyx's GTA 6 Trophy Guide & Roadmap (primary source, read in full), cross-checked against KeenGamer, GTA Spotter, eGamers and Push Square. Each trophy's card names its source.

## Running it

Serve `app/` with any static server, or run `node serve.ts` and open http://localhost:8080. To hand the entry in, run `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`, which copies `app/` and `screenshots/` to the output directory and writes `dossier.json` there.
