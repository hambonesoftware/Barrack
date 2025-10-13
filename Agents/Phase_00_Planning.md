# Phase 00_Planning

## Objectives
- Finalise the Barrack+ product vision, including the closed-off percentage win mechanic and procedural art mandate.
- Approve the repository layout for the Swift Playgrounds app, including Agents documentation and data files.
- Lock target device capabilities (iPad + Mac) and confirm SpriteKit + SwiftUI hybrid stack.

## Risks & Mitigation
- **Scope creep from legacy Barrack behaviours** – keep a shared glossary and defer non-core ideas to backlog.
- **Unclear data schemas** – prototype `levels.json` and `palettes.json` during this phase to remove ambiguity.
- **Coordination gaps between agents** – schedule asynchronous stand-ups documented in Agents/README notes.

## Tasks by Agent
- **Architect:** Define module boundaries, build flags, and base dependency graph between App/Engine/Gameplay/Render layers.
- **Gameplay Dev:** Outline beam growth algorithm, fill detection workflow, and deterministic RNG expectations.
- **Graphics Dev:** Specify shader/particle concepts and confirm no external art assets will be imported.
- **UI Designer:** Sketch menu/HUD wireframes and accessibility toggles (color palettes, reduced motion, dynamic type).
- **QA Engineer:** Draft acceptance checklist and test categories (unit, integration, snapshot, perf).

## Acceptance Tests
- Sign-off on the repository map that mirrors the phase plan.
- Example level data reviewed by the team with confirmed targetPercent semantics.
- Engineering spike demonstrating deterministic RNG API for repeatable simulations.
