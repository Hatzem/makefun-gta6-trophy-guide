# Vice City Trophy Guide

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Hatzem/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Hatzem/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for [make.fun's "Build the best GTA 6 trophy guide" bounty](https://make.fun/bounty/gta6-trophy-guide-01) ($250 in USDC).

## What it is

A static web app in `app/` — no build step, no libraries, no network requests. Open `app/index.html` from any static server with `app/` at its root and it works with the network off. Your progress is stored only in your browser (localStorage).

- **Checklist** — every trophy with its official name, description and grade exactly as PlayStation publishes them, a guide in this guide's own words, and the source it draws on. Tick a trophy when you earn it; click any card to open its guide.
- **Filters and search** — by grade, by kind (story, missable, collectibles, activities, side quests, crime, other), by earned or unearned, plus free-text search.
- **Spoiler setting** — hides the names and descriptions of un-earned story trophies until you earn them.
- **Export, import, reset** — save your progress to a file and bring it back.
- **Roadmap** — four stages to the platinum in about 200 hours, one playthrough, plus the 100% Completion Checklist at a glance.
- **Missables** — only one trophy is potentially missable (Positive Mental Attitude, Chapter 1), and the guide says so plainly, with two more honest unknowns flagged instead of guessed.

## The road to the platinum

1. **The story, 60–80 hours.** Play the five chapters, do optional missions as they appear, scan vehicles and study animals along the way. Do the Chapter 1 meditation at Jason's house while you can.
2. **The 100% Completion Checklist, about 100 hours.** After the story, under Progress, Stats, 100% Completion. Closer to 60% true completion, but the robberies, shooting ranges, drone races and Bret's quests demand everything.
3. **Strangers & Freaks and questline finals, about 10 hours.** Andy, Kenton, Billy, Randy, Tyrone, Bret, and the 8 stranger strands that count.
4. **Cleanup.** The UFO easter egg, the tank, the bowling alley, the showroom Banshee, the marked bills and the garages — then the platinum.

## Sources

Every guide names its source beside it. The words are this guide's own; the facts were checked against:

- PowerPyx — GTA 6 Trophy Guide & Roadmap — https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap, All 55 Trophies — https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/
- GTA Spotter — GTA VI trophies and achievements: the full official list — https://gtaspotter.com/en/guides/gta-6-trophies-and-achievements/

## Handing it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Serve it locally with `node serve.ts`, then open http://localhost:8080.

## License

MIT — see `LICENSE`. Not affiliated with Rockstar Games. No Rockstar logo, artwork or game screenshot is used anywhere in this guide.
