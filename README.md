# Barrack+

Barrack+ is a modern, procedurally-juiced homage to Barrack/JezzBall built for the Swift Playgrounds app. The project blends SpriteKit moment-to-moment action with SwiftUI menus and HUDs, optionally augmented by a p5.js overlay. The repository ships with the complete multi-phase delivery plan for the Barrack+ swarm team.

## Controls
- **iPad (touch/pencil):** Tap and drag to seed beams along the nearest axis.
- **Mac (keyboard):** Use arrow keys plus space bar to grow beams, press Esc to pause.
- **All platforms:** Two-finger tap or Esc pauses, long-press start for charged beams.

## Objective
Seal off at least the target percentage of each arena by drawing beams that convert into walls. When both ends of a beam connect, the enclosed area is flood-filled; if no enemies occupy it, the space is captured. Reach or exceed the target percentage to win the level. Losing conditions include enemies striking an active beam, running out of lives, or expiring timers on advanced stages.

## Settings & Accessibility
- Three colour-blind friendly palettes (default, tritan, protan).
- Reduced motion toggle that disables screen shake and damps particle intensity.
- Dynamic type-aware HUD elements and AppStorage-backed preferences.

## Build & Run
1. Open **BarrackPlus.playground** within the Swift Playgrounds app (iPad or Mac).
2. Run the playground; the SpriteKit scene and SwiftUI HUD will appear immediately.
3. Optional: enable the WKWebView overlay by toggling `BuildFlags.RENDER_P5_OVERLAY` or via settings.

## Development Notes
- Source code is organised by domain: `App/`, `Engine/`, `Gameplay/`, `Render/`, `OverlayP5/`, `Data/`, and `Support/`.
- Deterministic RNG ensures reliable unit tests and repeatable simulation captures.
- The `Agents/` directory contains phase-by-phase objectives, risks, and acceptance criteria for the swarm team.

## Phase 0 Developer Bootstrap
1. Review the architecture, style, and retro UI documentation under `docs/` to understand technology and aesthetic guardrails.
2. Validate data schemas with the reference payloads in `docs/data/levels.phase0.json` and `docs/data/palettes.phase0.json`.
3. Demonstrate deterministic behaviour by running `swift tools/rng_spike.swift`; the first two runs must emit identical obstacle and spawn sequences.
4. Keep automation clean by executing `ruff .`, `black --check .`, and `mypy .` from the repository root before submitting changes.

## Testing
Example tests live under `BarrackPlus.playground/Tests/` and cover physics reflection, flood-fill behaviour, level loading, and win condition thresholds. Additional integration and performance automation should be added in later phases.

## Credits
All gameplay code, shaders, and overlay sketches are procedural and contained within the repository. Inspired by the original Barrack by Ambrosia Software and JezzBall by Microsoft.
