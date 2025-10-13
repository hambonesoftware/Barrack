# Phase 07_Content_Progression

## Objectives
- Author at least 20 levels with increasing targetPercent (65% → 85%) and varied enemy mixes.
- Introduce hazard density modifiers, timers, and power-up frequency curves per level.
- Implement level select UI that reflects completion state and unlock progression.

## Risks & Mitigation
- **Difficulty spikes** – run playtests and collect capture statistics to smooth curves.
- **Content fatigue** – build procedural templates and seed-based variations to reduce manual labour.
- **Data integrity** – validate JSON schema before commits with lint script or unit tests.

## Tasks by Agent
- **Architect:** Define level metadata schema and validation routines.
- **Gameplay Dev:** Tune enemy behaviours, timers, and power-up logic per level.
- **Graphics Dev:** Ensure each level theme adjusts palette/overlay reactivity.
- **UI Designer:** Create level select carousel/grid with completion badges.
- **QA Engineer:** Run integration simulations verifying targetPercent thresholds and progression gating.

## Acceptance Tests
- Completing a level unlocks the next, preserving captured percent stats.
- Level data loads without crashes and respects required percentage increments.
- Timer-enabled levels fail correctly when countdown reaches zero.
