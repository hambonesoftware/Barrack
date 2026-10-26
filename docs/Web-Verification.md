# Browser arcade verification — 2026-10-26

## Executed engine checks

`node --test tests/engine.test.mjs`: 13 tests passed.

- Deterministic spawn and evolution.
- Empty-side capture and preservation of both occupied sides.
- Active beam collision, exactly one lost life, and protective shield consumption.
- Power duration, inventory limits, and Classic power restrictions.
- 80% victory threshold, next stage, and campaign completion.
- Survival timeout, pause, and one-time +30-second award.
- Invalid placements and repeated firing.
- All 12 layouts at three difficulties, 60 seconds each, maintaining containment.
- 100 seeded random-input runs: 717 successful barriers, 462 hits, 18 stage clears;
  no invalid regions, escaped balls, or non-finite state.

`node tests/campaign.mjs`: predictive simulation completed all 12 sectors at
Arcade difficulty, seed 20261026; 95 barriers, score 122473, 154.4 simulated seconds.
This planner looks ahead at outcomes. It is a progression regression test, not
human playtesting or evidence of human-level difficulty balance.

## Browser QA

Desktop main menu, mode selection, start, barrier firing, shield activation,
settings and responsive layout inspected in Chromium. Phone/tablet CSS layouts
are tested using 390px and 768px iframe viewports. These do not emulate physical
mobile hardware or prove iOS Safari behavior.

## Known limits

No online leaderboard, server account, cloud saves, or mid-run resume.
Enemy balls bounce off region boundaries independently rather than colliding
with each other. Special enemies are original reinterpretations, not identical
copies of the 1996 game. Further human playtesting is needed for difficulty tuning.
