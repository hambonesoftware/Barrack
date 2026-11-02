# Gameplay fidelity pass: collectables and live balls

This pass recreates gameplay *ideas* associated with Ambrosia's Barrack with new, original code and procedural artwork. It does not copy original copyrighted sprites, music, or proprietary logic.

## Game modes

- Enhanced: 12 sectors, inventory powers and bonus pickups.
- Classic: existing pure endless territory game; no pickups and no inventory powers.
- Survival: timed levels, inventory powers and bonus pickups.
- Authentic Classic: endless rounds with arena pickups and persistent surviving balls. The current two-way point-and-fire beam controls are deliberately retained. **This is not yet the original perimeter-travel shooter**, so the name refers to ball persistence and pickups rather than exact mechanical equivalence.

## Pickup rules

Every eligible stage starts rolling for its first item after about 3.5–6 seconds; subsequent attempts follow every 10–15 seconds. At most two pickups are active. A pickup expires after 13 seconds. Pickups can be gathered only by *successfully completing* a beam that crosses their center (±16 game units) or that fills the empty partition containing them. Interrupted shots do not award pickups.

| Pickup | Effect |
| --- | --- |
| Lightning | Barrier growth 410 → 730 units/second, 8 seconds |
| Laser | Barrier growth to 1550 units/second, 6 seconds |
| Cluster magnet | Bounded force pulling balls toward the nearest region boundary, 7 seconds |
| Extra life | +1–3 lives, up to nine |
| Multiplier | Double capture and stage-clear points, 12 seconds |
| Nuke charge | Removes balls within 165 game units, +300 per removal |

Each pickup adds 150 points. These values are game-design approximations; no claim is made that the original used the same values.

## Ball mechanics

- Baseline movement increases from 100 + 8 per level to 125 + 10 per level before type/difficulty multipliers.
- Gravity accelerates downward up to a speed cap and rebounds off the arena.
- Sentry continuously steers toward the active aim point; existing Watchers pursue when no beam exists.
- Glass spheres fracture after five wall impacts into two fast shards.
- Nuke spheres are dangerous until trapped inside an area smaller than 36,000 square game units, when they and nearby enclosed balls detonate.
- Pulse, Ember and Heavy behaviors remain available.
- In Authentic Classic, surviving balls keep their types and directional trajectories across stages. One new ball is added per stage, capped at 14. Destroyed balls do not return; only replacement arrivals enter.

## Technical and quality checks

- Procedural animated artwork is shared by both Chrome and '96 HD renderers; no external asset downloads.
- Engine, renderer and deterministic special-mechanics tests run in CI.
- A 60-seed simulation stresses ball containment and non-finite state.
- Playwright Chromium uses mobile touch, tablet touch and desktop pointer contexts, launches both visual editions, fires shots, pauses, and captures screenshots for review. Emulated mobile browsers do **not** prove physical iOS Safari performance. Physical-device testing remains recommended.
