# Phase 03 – Physics & Fill

## Objectives
- Implement enemy physics with reflections, acceleration variants, and splitter spawning.
- Integrate flood-fill capture detection that converts enclosed regions into permanent walls.
- Update captured percentage after each seal and notify the ProgressMeter.

## Key Risks & Mitigations
- **Physics tunneling**: clamp per-frame velocity and test against unit cube scenarios to avoid skipped collisions.
- **Flood-fill performance**: optimize BFS with reusable buffers and benchmark large grids.
- **Splitter explosion loops**: cap recursion depth and enforce maximum enemy counts.

## Agent Responsibilities
- **Architect**: expose deterministic physics hooks and grid abstractions from the engine module.
- **Gameplay Developer**: code the flood-fill pipeline, integrate with BeamManager anchoring, and emit capture metrics.
- **Graphics Developer**: create capture burst particles and remove filled areas visually in-scene.
- **UI Designer**: surface combo multipliers and capture streaks in the HUD (placeholder values allowed).
- **QA Engineer**: add tests for physics reflection, flood-fill correctness, and enemy-beam collision regressions.

## Acceptance Tests
- Enemies bounce predictably off walls with behavior variations respected.
- Flood-fill captures only regions without active enemies and increments percentage accurately.
- Beam breaks on enemy collision deduct a life and reset the active beam state.
