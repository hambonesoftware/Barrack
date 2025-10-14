# Phase 01 – Scaffold

## Objectives
- Generate the Swift Playgrounds project with a SpriteKit scene bootstrapped inside a SwiftUI container.
- Launch into a blank yet responsive 60 FPS scene that exposes a debug HUD.
- Integrate deterministic RNG hooks and level-loading stubs to support later phases.

## Key Risks & Mitigations
- **Resource resolution issues**: keep assets inside `Sources` with bundle-relative lookups and test on device plus Mac.
- **Early performance regressions**: enable preferred frame rate controls and profile builds immediately.
- **Missing test harness**: add unit test targets, even with placeholder assertions, to verify the pipeline.

## Agent Responsibilities
- **Architect**: wire `BarrackPlusApp`, `GameView`, and `GameScene` with environment objects and build flags.
- **Gameplay Developer**: create the `GameState` skeleton, stub managers, and confirm step/update loop hooks.
- **Graphics Developer**: prepare placeholder particle and shader files to validate bundle loading.
- **UI Designer**: build a SwiftUI HUD overlay showing level, captured percentage, and lives (static values acceptable).
- **QA Engineer**: add smoke tests that validate level JSON loading and deterministic physics helpers.

## Acceptance Tests
- Playgrounds build opens to the SpriteKit scene without runtime errors.
- HUD overlays the scene and reacts to published state updates in previews or simulator.
- Unit tests compile and execute via Playgrounds or `xcodebuild test`.
