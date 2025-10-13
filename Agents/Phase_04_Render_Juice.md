# Phase 04_Render_Juice

## Objectives
- Add shader-driven glow, bloom, and screen shake effects during captures and failures.
- Implement particle emitters for capture bursts, beam shatter, and enemy spawn events.
- Introduce dynamic background colour cycling that responds to combo multiplier.

## Risks & Mitigation
- **Performance spikes** – profile emitter counts and fallback to pooled nodes for iPad hardware.
- **Accessibility conflicts** – respect reduced-motion flag and disable camera shake when toggled.
- **Shader portability** – test custom Metal shader on both macOS and iPadOS, provide fallback SKActions.

## Tasks by Agent
- **Architect:** Wire build flags allowing debug toggles for overlay and reduced motion.
- **Gameplay Dev:** Emit events for capture, fail, and combo changes for renderer to listen to.
- **Graphics Dev:** Implement `Effects` helpers, attach `SKEffectNode` chain, and tune palettes.
- **UI Designer:** Align HUD styling with dynamic palettes and ensure text remains legible on bright backgrounds.
- **QA Engineer:** Add snapshot tests or manual checklists verifying animations respect reduced-motion preference.

## Acceptance Tests
- Capture events trigger particle bursts and glow without dropping below 60 FPS in profiling builds.
- Reduced-motion toggle disables shake/particle intensity while keeping gameplay readable.
- HUD palette updates reflect the active colour scheme at runtime.
