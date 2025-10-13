# Phase 01_Scaffold

## Objectives
- Generate the Swift Playgrounds project structure with SpriteKit scene bootstrap and SwiftUI container view.
- Ensure the game launches into a blank but responsive 60 FPS scene with debug HUD available.
- Integrate deterministic RNG and level loading stubs for upcoming phases.

## Risks & Mitigation
- **Playgrounds resource resolution issues** – keep assets inside `Sources` with relative bundle lookups, test on device and Mac.
- **Performance regressions** – enable SpriteKit preferred frame rate and profile early.
- **Missing tests** – introduce unit test targets even with placeholder assertions to confirm harness.

## Tasks by Agent
- **Architect:** Wire `BarrackPlusApp`, `GameView`, and `GameScene` with environment objects and build flags.
- **Gameplay Dev:** Create `GameState` skeleton, stub managers, and confirm lifecycle hooks for step/update loops.
- **Graphics Dev:** Prepare placeholder particle and shader files to validate bundle loading.
- **UI Designer:** Build SwiftUI HUD overlay showing level, captured %, and lives (static values acceptable).
- **QA Engineer:** Add smoke tests verifying level JSON loads and physics helpers behave deterministically.

## Acceptance Tests
- Playgrounds build opens to SpriteKit scene without runtime errors.
- HUD overlays the scene and reacts to published state updates in previews or simulator.
- Unit tests compile and execute within Playgrounds or `xcodebuild test` harness.
