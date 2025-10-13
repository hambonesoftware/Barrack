# Phase 03_Physics_Fill

## Objectives
- Implement enemy physics including reflections, acceleration variants, and splitter spawning.
- Integrate flood-fill capture detection and convert enclosed regions into permanent walls.
- Update captured percentage each time a region is sealed and notify ProgressMeter.

## Risks & Mitigation
- **Physics tunnelling** – clamp velocity per frame and test with unit cubes to avoid skipping collisions.
- **Flood-fill performance** – optimise BFS with reusable buffers and benchmark on large grids.
- **Splitter enemy explosion** – limit recursion depth and enforce max enemy counts.

## Tasks by Agent
- **Architect:** Ensure Engine module exposes deterministic physics hooks and cell grid abstractions.
- **Gameplay Dev:** Code flood-fill pipeline, integrate with BeamManager anchoring, and emit capture metrics.
- **Graphics Dev:** Create capture burst particles and update scene to remove filled areas visually.
- **UI Designer:** Surface combo multipliers and capture streaks in HUD (placeholder numbers acceptable).
- **QA Engineer:** Add unit tests for Physics.reflect, flood-fill correctness, and regression scenarios for enemies hitting beams.

## Acceptance Tests
- Enemies bounce predictably off walls, respecting velocities and unique behaviours per type.
- Flood-fill marks only regions without active enemies as captured and increments percentage accurately.
- Beam break on enemy collision deducts a life and resets active beam state.
