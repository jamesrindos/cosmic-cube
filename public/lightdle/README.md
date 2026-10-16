# Lightdle

Daily lighting puzzle at `/lightdle`. Static, self-contained (same pattern as `/sands`): no build step, Three.js loaded from jsdelivr.

- `index.html` — markup + CSS
- `app.js` — Three.js set, illumination model, scoring, floor plan, UI, localStorage stats
- `puzzles.js` — the scene library (`PUZZLES`), fixture and gel tables, and `EPOCH` (the date of Lightdle #1)
- `sets.js` — mannequin builder, visible light fixtures, and the environment library (`SETS`: interview, noir, tvstudio, basement, atelier, latenight, scifi, dinner, park, headshot, lineup, warehouse, bar, bedroom, campfire, courtroom)
- `assets/head.glb` — the mannequin head: Lee Perry-Smith scan by Infinite-Realities, CC BY 3.0 (via the three.js examples); `head-normal.jpg` its tangent normal map

## Adding a scene

Append an object to `PUZZLES` with a `set` (a key of `SETS`), a `pose` (`seated` or `standing`) and tinted `subjects`. The director's solution rig *is* the answer key — every target (key angle, contrast ratio, rim strength, colour, exposure, coverage) is derived from it, so there is nothing else to keep in sync. Write a `medium` brief (plain-language director's note), an `expert` brief (just the scene and mood), and a `lesson` for the post-roll explainer. The Easy spec sheet is generated from the solution automatically.

Conventions (camera POV): `az` 0 = at camera, +90 = camera-left, -90 = camera-right, ±180 = behind. `el` is degrees above the eyeline (negative = underlight). `d` metres from the head. `p` output 0–100. `k` kelvin. `t` = subject index to aim at, -1 = the group.

## Daily rotation

Day number = days since `EPOCH` + 1. The first cycle runs the puzzle list in order; later cycles use a seeded shuffle so the order changes but stays identical for everyone.

## URL params

- `?p=<id|number>` — practice a specific scene (not recorded)
- `?day=<n>` — play a specific day number
- `?mode=easy|medium|expert`

`window.__lightdle` exposes `score()`, `solutionScore()`, `scoreFor(puzzle, rig, mode)`, `setRig()` and `analyse()` for tuning in the console.
