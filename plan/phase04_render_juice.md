# Phase 04 – Render & Juice

## Objectives
- Add shader-driven glow, bloom, and screen-shake effects for captures and failures.
- Implement particle emitters for capture bursts, beam shatters, and enemy spawns.
- Introduce dynamic background colour cycling that responds to combo multipliers.

## Key Risks & Mitigations
- **Performance spikes**: profile emitter counts and rely on pooled nodes for iPad hardware.
- **Accessibility conflicts**: honor reduced-motion settings and disable shake when toggled.
- **Shader portability**: test Metal shaders on macOS and iPadOS with SKAction fallbacks.

## Agent Responsibilities
- **Architect**: wire build flags for debug overlays and reduced-motion toggles.
- **Gameplay Developer**: emit capture, failure, and combo events for the renderer to consume.
- **Graphics Developer**: implement effects helpers, attach `SKEffectNode` chains, and tune palettes.
- **UI Designer**: align HUD styling with dynamic palettes while keeping text legible.
- **QA Engineer**: add snapshot tests or checklists ensuring animations respect accessibility settings.

## Acceptance Tests
- Capture events trigger particles and glow without dropping below 60 FPS in profiling builds.
- Reduced-motion toggle dampens shake and particle intensity while gameplay stays clear.
- HUD palette updates reflect the active colour scheme during runtime.
