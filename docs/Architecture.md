# Barrack+ Architecture – Phase 0 Blueprint

## Overview
Barrack+ is a Swift Playgrounds experience targeting iPad and Mac that blends SpriteKit-driven arcade action with SwiftUI overlays. Phase 0 finalizes the product vision, locks repository structure, and confirms the hybrid technology stack so subsequent phases can safely build mechanics around closed-off percentage win conditions and procedural art requirements.

## Phase 0 Goals
- Finalize the Barrack+ product vision with emphasis on closed-off territory percentages and bespoke procedural visuals.
- Approve the Swift Playgrounds repository layout, Agents documentation, and shared JSON data files (`levels.json`, `palettes.json`).
- Confirm iPad + Mac delivery targets along with the SpriteKit/SwiftUI hybrid stack and supporting tooling.

## Module Boundaries & Build Flags
- **Dependency graph**: `App` (SwiftUI shell) depends on `Gameplay` (state machines, beam orchestration) which in turn depends on `Engine` (fill detection, RNG, simulation). `Render` (SpriteKit scenes, particles, shaders) consumes services from both `Gameplay` and `Engine`, while `Support` (diagnostics, persistence, tooling bridges) sits alongside with one-way dependencies into the other modules.
- **Build flags**:
  - `BuildFlags.RENDER_P5_OVERLAY` enables the optional WKWebView overlay so designers can iterate on p5.js effects without impacting the deterministic SpriteKit loop.
  - `BuildFlags.ENABLE_DIAGNOSTICS_SERVER` spins up the lightweight FastAPI harness described for QA automation; disabled in production builds.
  - `BuildFlags.INSTRUMENT_BEAM_DEBUG` activates overlay geometry, heatmaps, and seed logging for in-development beam tuning.
- **Shared data packages**: `docs/data/levels.phase0.json` and `docs/data/palettes.phase0.json` are authoritative references until Phase 1 introduces generated bundles. Schema ownership remains with the Engine module.
- **Glossary & backlog hooks**: Phase 0 documentation owns terminology definition; future scope creep is captured in a `BACKLOG.md` appendix once code scaffolding begins.

## System Context
```
+-------------------+          Telemetry / Analytics (future)
|    Player (iPad/Mac)  |-------------------------------+
+----------+--------+                                |
           |                                         |
           v                                         |
+-------------------+       Game State Updates       |
| Barrack+ App      |--------------------------------+
| - SwiftUI Shell   |
| - SpriteKit Scene |
+----------+--------+
           |
           v
+-------------------+
| Core Engine Layer |
| - Beam Fill Logic |
| - Deterministic RNG
| - Level/Palette IO |
+----------+--------+
           |
           v
+-------------------+
| Persistence Layer |
| - Local JSON (dev) |
| - CloudKit/Postgres (prod, future)
+-------------------+
```

## Frontend Surface (SwiftUI + SpriteKit)
- **View hierarchy**: SwiftUI orchestrates the app shell (menus, HUD, accessibility toggles) and embeds a SpriteKit view hosting the arcade playfield.
- **Game loop**: SpriteKit maintains a fixed timestep for deterministic beam propagation. SwiftUI reacts to published state changes for UI elements (score, target percent, timer).
- **Scenes**: Core scenes planned for Phase 1 include Title, Tutorial, Campaign Mission, Endless, and Results overlays. Navigation uses SwiftUI's `NavigationStack` to maintain clarity.
- **Accessibility**: Provide palette switching, reduced motion toggles, and dynamic type scaling surfaces, stubbed in Phase 0 documentation.

## Backend & Engine Responsibilities
- **Engine module boundaries**: Split into Beam Logic (handles growth, collision, closed-area detection), Fill Detection (flood-fill/scanline algorithms), RNG Service (seeded PRNG API), and State Snapshotting (records progress for undo/redo/testing).
- **Data handling**: During development the engine loads `levels.json` and `palettes.json` from the app bundle. Phase 0 ships reference payloads in `docs/data/levels.phase0.json` and `docs/data/palettes.phase0.json` to lock structure before tooling automation. Production will migrate to a lightweight synced store (CloudKit with Postgres mirror) to enable live ops without App Store updates.
- **Deterministic RNG API (Phase 0 spike)**:
  - Provide a `RNGService` struct with initializer `init(seed: UInt64, stream: RNGStream)` to create deterministic sub-streams per system (level layout, enemy spawn, particle jitter).
  - Expose functions `nextUnit() -> Double`, `nextInt(max:)`, and `shuffle<T>(_:)` to ensure reproducible simulations.
  - The runnable spike lives in `tools/rng_spike.swift` and prints repeatable obstacle coordinates and spawn orders when executed with `swift tools/rng_spike.swift`.
  - Documented usage for testing: QA can record a seed in `levels.json` to replay mission outcomes exactly.
- **Beam completion semantics**: A mission completes when the filled area meets or exceeds `targetPercent`. The engine reports `currentPercent` continuously so the HUD can display progress.

### Beam Growth Algorithm Outline
1. **Initialization** – Gameplay injects the player intent (axis, origin cell, and seed) into the Beam Logic service. The service acquires a deterministic step duration from the RNG stream assigned to beam propagation.
2. **Propagation loop** – At each fixed-timestep tick SpriteKit requests the next cell candidate. Beam Logic queries the board occupancy grid and resolves collisions against walls, enemies, and player trail ghosts. Growth stops when the beam head hits an occupied tile or collides with an enemy.
3. **Closure detection** – When both ends of the beam anchor to solid surfaces, the service emits a closure event tagged with the mission seed, beam identifier, and timestamp for audit logging.
4. **Failure handling** – Active beams struck by enemies trigger an interruption event that decrements lives, rewinds the beam state, and logs the failure cause for QA reproducibility.

### Fill Detection Workflow
1. **Region identification** – Upon beam closure the Fill Detection module runs a seeded flood-fill starting from each open cell adjacent to the beam to detect enclosed regions.
2. **Enemy validation** – Regions containing enemy entities remain unclaimed; others compute their area in grid units and update `currentPercent`.
3. **Area conversion** – Valid regions are promoted to solid tiles, register particle burst requests with the Render module, and queue HUD updates for SwiftUI.
4. **Performance safeguards** – Scanline optimization ensures flood-fill stays O(n) with predictable memory usage. Deterministic ordering guarantees consistent replay results.

### Deterministic RNG Expectations
- **Seed management**: Each mission stores a canonical `seed` and optional `subseeds` for modifiers. Streams (`levelLayout`, `enemySpawn`, `particleJitter`, `beamPropagation`) derive from the base seed via indexed offsets, guaranteeing isolation between systems.
- **Logging**: All RNG consumers emit seed + stream identifiers into debug traces when `BuildFlags.INSTRUMENT_BEAM_DEBUG` is enabled to support QA reproduction.
- **Testing**: Unit tests pass explicit seeds and assert both numerical outputs and derived artefacts (e.g., shuffled enemy orders) to avoid hidden randomness.
- **Tooling**: `tools/rng_spike.swift` doubles as reference output; `tools/ui_audit.py` may ingest the same seeds when validating deterministic texture jitter in later phases.

## Graphics & Shader Concepts
- **SpriteKit shader strategy**: Employ Metal-based fragment shaders for CRT-inspired bloom, beam glow, and palette cycling. Shaders read mission seeds to synchronize animation offsets.
- **Particle systems**: Configure deterministic SKEmitterNode templates for capture bursts, enemy hits, and UI confetti. Emitters consume the `particleJitter` RNG stream to align with gameplay determinism.
- **Asset policy**: All visuals remain procedural. No external bitmap imports are allowed; gradients, textures, and sprites are generated on demand and cached per seed.
- **Pipeline alignment**: Render module exposes toggles so the QA automation harness can disable high-cost shaders when running performance sweeps without diverging from mission seeds.

## Example Level Data (Phase 0 Review)
```json
{
  "id": "tutorial-01",
  "title": "Training Grounds",
  "targetPercent": 0.75,
  "seed": 123456789,
  "board": {
    "width": 64,
    "height": 64,
    "obstacles": [[12, 8], [20, 22]],
    "startPosition": [32, 4]
  },
  "palette": "aurora",
  "modifiers": ["reduced-speed"]
}
```
- `targetPercent` specifies the closed-off coverage required to trigger the win overlay.
- `seed` binds to the deterministic RNG service for reproducible obstacle placement and enemy patterns.

## API Surface Outline (MVP)
- `GET /health` – ensures the embedded diagnostics server is reachable during development.
- `POST /run-simulation` – Accepts level + seed payload to simulate outcomes for QA automation.
- `GET /leaderboard` – Fetches top completion percentages (Phase 2+ integration).
- `POST /telemetry` – Uploads session stats (played missions, crash data) for analytics.

## Observability Hooks
- Capture per-mission completion times, crash-free play sessions, and average filled percentage vs. target to tune difficulty.
- Instrument RNG seeds and outcomes for reproducibility audits.
- Integrate os_log channels and SpriteKit frame timing counters to identify performance regressions.

## Deployment & Environment Strategy
- **Local Development**: Swift Playgrounds on macOS/iPad with package dependencies managed via Swift Package Manager. Optional Docker Compose service to host the diagnostics FastAPI server for QA simulations.
- **Staging**: TestFlight builds pulling configuration via environment-specific JSON bundles and connecting to a staging analytics endpoint.
- **Production**: App Store release using 12-factor principles—runtime configuration delivered via remote JSON, secrets injected through encrypted configuration profiles.
- **Secrets & Configuration**: Avoid hard-coded secrets; use `.env` (ignored) for local CLI tooling and Keychain/CloudKit for runtime credentials.

## Security Assumptions
- Gameplay data considered non-sensitive but leaderboard and telemetry endpoints must use HTTPS.
- Deterministic seeds must not expose personally identifiable data; generate using cryptographically secure random values when creating new missions.
- Follow Apple platform privacy guidelines for data collection disclosures.

## Risks & Mitigations (Phase 0)
1. **Legacy Scope Creep** – Maintain `BACKLOG.md` (Phase 1 action) and enforce documentation updates before accepting new features.
2. **Unclear Data Schemas** – Example `levels.json` snippet above validated with stakeholders; establish JSON Schema in Phase 1.
3. **Coordination Gaps** – Agents directory remains authoritative; asynchronous stand-ups recorded in respective phase docs.

## Phase Boundaries
- **Phase 1 – Scaffold**: Implement project structure, initial SpriteKit scene, RNG service skeleton, and JSON loading utilities.
- **Phase 2 – Core Loop**: Execute beam growth mechanics, collision detection, and closed-area resolution.
- **Phase 3 – Physics & Fill Polish**: Refine fill algorithms, integrate particle systems, and handle edge cases.
- **Phase 4+**: Add render juice, overlays, accessibility enhancements, testing/performance automation, and final polish per existing plan documents.
