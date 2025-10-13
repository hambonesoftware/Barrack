# Phase 08_Testing_Perf

## Objectives
- Expand unit, snapshot, and integration tests covering all subsystems.
- Profile the game to maintain 60 FPS on target devices with instrumentation logs.
- Automate perf regressions using scripted simulations.

## Risks & Mitigation
- **Instrumentation overhead** – wrap logging under debug flags to avoid release impact.
- **Test flakiness** – use deterministic RNG seeds and environment resets between runs.
- **Perf tooling gaps on Playgrounds** – supplement with Xcode Instruments traces on Mac builds.

## Tasks by Agent
- **Architect:** Define CI plan (manual or automated) and ensure tests run via command line.
- **Gameplay Dev:** Create deterministic enemy/beam simulations for perf scenarios.
- **Graphics Dev:** Tune shader/particle cost, providing fallback code paths where necessary.
- **UI Designer:** Validate dynamic type and layout performance under stress scenarios.
- **QA Engineer:** Build regression suite, including fps sampling and memory leak detection.

## Acceptance Tests
- All automated tests pass consistently with seeded RNG.
- Performance profiling shows average frame time ≤ 16 ms on benchmark hardware.
- Memory usage remains stable after extended (10+ minute) play sessions.
