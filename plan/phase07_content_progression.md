# Phase 07 – Content & Progression

## Objectives
- Author at least 20 levels with rising `targetPercent` thresholds and varied enemy mixes.
- Introduce hazard density modifiers, timers, and power-up frequency curves per level.
- Implement level select UI reflecting completion state and progression gating.

## Key Risks & Mitigations
- **Difficulty spikes**: run playtests and review capture statistics to smooth curves.
- **Content fatigue**: use procedural templates and seed-based variations to reduce manual labour.
- **Data integrity**: validate JSON schema before commits with lint scripts or unit tests.

## Agent Responsibilities
- **Architect**: define level metadata schema and validation routines.
- **Gameplay Developer**: tune enemy behaviours, timers, and power-up logic per level.
- **Graphics Developer**: ensure each level theme adjusts palette and overlay reactivity.
- **UI Designer**: build the level select carousel/grid with completion badges.
- **QA Engineer**: run integration simulations verifying target percent thresholds and progression locks.

## Acceptance Tests
- Completing a level unlocks the next while preserving captured percentage stats.
- Level data loads without crashes and respects required percentage increments.
- Timer-enabled levels fail correctly when countdowns expire.
