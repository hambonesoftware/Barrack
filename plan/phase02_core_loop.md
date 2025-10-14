# Phase 02 – Core Loop

## Objectives
- Implement player beam input for touch and keyboard with reliable anchoring logic.
- Drive GameState transitions through Start → Play → Pause/Win/Lose while updating HUD messaging.
- Track captured cell counts and connect them to the ProgressMeter for live feedback.

## Key Risks & Mitigations
- **Input ambiguity across devices**: normalize controls into direction enums and expose simulator toggles.
- **Beam anchoring bugs**: add debug overlays and instrumentation to confirm endpoints.
- **Complex state machine**: model states explicitly and cover transitions with tests.

## Agent Responsibilities
- **Architect**: define the GameState finite-state machine and ensure the game loop respects pause states.
- **Gameplay Developer**: flesh out BeamManager growth, anchor, and cancel flows tied to fill triggers.
- **Graphics Developer**: render provisional beam sprites, highlighting fragile versus anchored visuals.
- **UI Designer**: add the pause menu overlay and update HUD with target percentage messaging.
- **QA Engineer**: write tests for win/lose thresholds and beam anchoring regressions.

## Acceptance Tests
- Player can start, anchor, and cancel beams with lives decrementing appropriately.
- Game pauses and resumes from HUD or keyboard while updating overlay messaging.
- Automated tests confirm `capturedPercent >= targetPercent` triggers the win condition exactly once.
