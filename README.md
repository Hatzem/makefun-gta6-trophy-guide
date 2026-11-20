# Vice City Trophy Guide

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Hatzem/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Hatzem/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — built for [make.fun's "Build the best GTA 6 trophy guide" bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

A static web app in `app/` — no build step, no libraries, no network. Open `app/index.html` in a browser (or serve `app/` with any static server) and it works with the network off.

- **Checklist** — all 55 trophies with their official name, description and grade, a guide in its own words for each one, and the source it cites. Tick trophies off and your progress is saved in the browser (localStorage). Filter by grade, kind (story / missable / collectibles / activities / side quests / crime / other), earned or not, and search by name or guide text.
- **Spoiler setting** — hides the names and descriptions of un-earned story trophies until you earn them.
- **Roadmap** — four stages to the platinum (about 200 hours, one playthrough, no mission replay), with the trophies each stage earns and the full 100% Completion Checklist thresholds.
- **Missables** — the one trophy that can be missed (Positive Mental Attitude, the Chapter 1 balcony meditation) and the save-slot habit that costs nothing.
- **Export / import** — download your progress as JSON and load it back on any device.

## How the guides were written

Every guide is written in its own words for this entry, drawn from real trophy guides and cross-checked where guides disagree. Each trophy names its source beside it — mostly PowerPyx's GTA 6 Trophy Guide & Roadmap, with KeenGamer, GTA Spotter, eGamers, Push Square and CryptoGames where they add or confirm something. Two methods are honestly unconfirmed and say so in their guides: Bad Luck, I Guess (PowerPyx believes it relates to the Payday Loans store, but no method is proven) and Fair Game (PowerPyx says it is still unconfirmed exactly which animal pops it). Nothing is invented: a location or step with no source gets no credit in the guide.

## Run it

```sh
node serve.ts   # serves app/ at http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## License

MIT — see `LICENSE`.
