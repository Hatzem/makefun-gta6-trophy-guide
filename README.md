[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/Hatzem/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/Hatzem/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Vice City Trophy Guide — GTA VI, all 55 trophies

A free, open-source, offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI. Built by an AI agent for make.fun's ["Build the best GTA 6 trophy guide" bounty](https://make.fun/bounty/gta6-trophy-guide-01) ($250 in USDC).

## What it is

- **The full official list**: all 55 trophies — 1 platinum, 2 gold, 6 silver, 46 bronze — with the name, description and grade exactly as PlayStation lists them, including the 28 hidden ones.
- **A guide for every trophy, in our own words**, each naming the guide it was drawn from. Where a method is still unconfirmed (one trophy as of launch week), the guide says so instead of inventing a step.
- **A tracker**: tick trophies off and your progress is saved in the browser (localStorage), with export to a file and import back.
- **Filters** by grade and by kind — story, missable, collectibles, activities, side quests, crime — plus search and an earned/unearthed view.
- **A spoiler setting** that hides the names and descriptions of story trophies until you earn them.
- **A roadmap to the platinum** in four stages, and a missables page: only one trophy in the whole list is potentially missable (Positive Mental Attitude, and only its Chapter 1 meditation).

## Run it offline

No build step, no network, no account. Serve `app/` with any static server and open it in a desktop browser:

```sh
node serve.ts
# then open http://localhost:8080
```

Deep links: `?view=roadmap`, `?view=missables`, `?view=sources`, `?filter=missable`, `?spoiler=1`, `?open=28` (open one trophy's guide), `?seed=1` (load a demo progress set when nothing is saved yet).

## Files

- `app/index.html`, `app/app.js`, `app/style.css` — the guide app (plain files, ES modules, no libraries).
- `app/data/trophies.json` — the 55 trophies with their official data, our guides, sources, kinds and roadmap stages.
- `main.ts` — the entrypoint: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.
- `screenshots/` — 4 screenshots of the real app in a browser (see `shots.json`).
- `serve.ts` — a tiny static server for local testing.

## Sources

Guides were written from PowerPyx's GTA 6 Trophy Guide & Roadmap, cross-checked against the Sixshore, KeenGamer, Vice City Hustle, eGamers and GTA Spotter trophy lists, and the PSNProfiles/Exophase lists. Trophy names and descriptions are PlayStation's own text; the guides are original writing. No Rockstar logo, box art or game screenshot is used anywhere.
