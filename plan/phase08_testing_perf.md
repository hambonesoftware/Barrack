# Phase 08 – Testing & Performance

## Objectives
- Expand unit, snapshot, and integration coverage across all subsystems.
- Profile the game to maintain 60 FPS on target devices with instrumentation logs.
- Automate performance regression checks using scripted simulations.

## Key Risks & Mitigations
- **Instrumentation overhead**: guard logging with debug flags to avoid release impact.
- **Test flakiness**: use deterministic RNG seeds and reset environments between runs.
- **Perf tooling gaps**: supplement Playgrounds with Xcode Instruments traces on Mac builds.

## Agent Responsibilities
- **Architect**: define the CI approach and ensure tests can run from the command line.
- **Gameplay Developer**: build deterministic enemy/beam simulations for performance scenarios.
- **Graphics Developer**: tune shader and particle costs with fallback code paths.
- **UI Designer**: validate dynamic type and layout performance under stress.
- **QA Engineer**: construct the regression suite, including FPS sampling and memory leak detection.

## Acceptance Tests
- All automated tests pass consistently with seeded RNG.
- Performance profiling shows average frame time ≤ 16 ms on benchmark hardware.
- Memory usage remains stable after extended (10+ minute) sessions.
