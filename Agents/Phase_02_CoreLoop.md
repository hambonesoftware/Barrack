# Phase 02_CoreLoop

## Objectives
- Implement player beam input for touch and keyboard controls with anchoring logic.
- Transition GameState through Start → Play → Pause/Win/Lose states while updating HUD messaging.
- Track captured cell counts and integrate with ProgressMeter for live percentage feedback.

## Risks & Mitigation
- **Input ambiguity between touch and keyboard** – normalise to direction enums and build simulator toggles for testing.
- **Beam anchoring bugs** – add debug overlays and log instrumentation to confirm endpoints.
- **State machine complexity** – model states explicitly and cover with tests for transitions.

## Tasks by Agent
- **Architect:** Define GameState finite-state machine and update `GameLoop` to respect paused scenes.
- **Gameplay Dev:** Flesh out `BeamManager` growth/anchor/cancel flows and connect to fill triggering hooks.
- **Graphics Dev:** Render provisional beam sprites and highlight fragile vs anchored visuals.
- **UI Designer:** Add pause menu overlay and update HUD to include target percentage callout.
- **QA Engineer:** Write tests for win/lose logic thresholds and beam anchoring regression cases.

## Acceptance Tests
- Player can start a beam, anchor it against existing walls, and see lives decrement on cancellation.
- Game pauses/resumes correctly from HUD or keyboard and updates overlayMessage text.
- Automated tests verify `capturedPercent >= targetPercent` triggers the win condition exactly once.
