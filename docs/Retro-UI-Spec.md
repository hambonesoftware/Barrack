# Barrack+ Retro UI Specification – Phase 0

## Visual Principles
Barrack+ channels an OS-8/Apeiron-inspired interface blending chunky bevels, saturated neon palettes, and procedural dither to celebrate the original Barrack aesthetic while remaining legible on modern iPad and Mac displays. All UI components adhere to an 8 px base grid with subtle animations driven by deterministic seeds so visuals align with gameplay reproducibility requirements.

## Palette Library
| Palette ID | Primary | Secondary | Accent | Background | Alert | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| aurora | #34FFD9 | #0FD7FF | #FF5EBA | #061427 | #FFB800 | Default mission palette, high vibrancy with cool backgrounds |
| citadel | #F9F871 | #8AE2FF | #FF6B3D | #1F1745 | #FF3366 | Campaign difficulty ramp, use for boss encounters |
| sandstorm | #F5D782 | #E6B45C | #6B4E2E | #281A0D | #FF8243 | Retro desert vibe, pair with reduced motion |
| midnight | #9CA3FF | #515BFF | #FFD1DC | #070B1C | #FF4D6D | Accessibility high-contrast baseline |
| monochrome | #F3F4F6 | #9CA3AF | #10B981 | #111827 | #EF4444 | Colorblind-safe fallback with minimal chroma |

### Palette Usage Rules
- Primary color drives title text, primary buttons, and progress bars.
- Secondary color applies to secondary CTAs and hover/selection states.
- Accent color highlights particle bursts, rarity indicators, and interactive edges.
- Background color fills panels and overlays; apply 90% opacity scrim when layering over gameplay.
- Alert color covers failure states, warnings, and countdown urgency.
- Maintain contrast ratios ≥ 4.5:1 for body text and 3:1 for large display text. Validate using WCAG tools before shipping palettes.

## Bevels, Shadows, and Insets
- Standard button bevel: 4 px outer highlight on top/left using `lighten(Primary, 30%)`, 4 px shadow on bottom/right using `darken(Primary, 25%)`.
- Panel bevel: 6 px outer bevel with 2 px inner stroke using Accent color at 60% opacity.
- Active state inset: apply 2 px inset shadow (#000000 at 35% opacity) and shift gradient origin to center-bottom for pressed effect.
- Drop shadows: use deterministic jitter seeded per widget (seed derived from mission + component ID) with offset range ±2 px to emulate CRT bloom without randomness across sessions.

## Widget Geometry Grid
- Base grid unit: 8 px. All spacing, padding, and component sizes snap to multiples of 8.
- Button heights: Small 32 px, Medium 40 px, Large 56 px. Widths expand to fit content but respect minimum 3 grid units (24 px) per side padding.
- Panels: Column layout uses 12-column grid on iPad (76 px columns with 16 px gutters) and adaptive 6-column grid on Mac windowed mode.
- HUD counters: 48 px height with 16 px internal padding; icons align to 40 px bounding boxes.
- Modal dialogs: Max width 640 px on iPad, 720 px on Mac. Use 24 px corner radius with bevel treatment.

## HUD Placement & Alignment
- Top bar hosts score, target percentage, and seed indicator. Align left-to-right with 12 px separators, anchored to safe area insets.
- Bottom-left corner holds movement controls (virtual D-pad) for accessibility tests; actual control scheme defined in later phases.
- Notifications slide from top-right using deterministic easing curves derived from RNG seed to ensure repeatable animation order.
- Progress radial for beam fill sits center-right with anchor guidelines at 40% and 75% thresholds to telegraph mission goals.

## Menu & HUD Wireframes
- **Main menu**: Three-column grid with Play, Settings, and Seed Lab cards. Cards adopt the palette bevel rules and include deterministic idle animations keyed from the mission seed preview.
- **Settings overlay**: Left rail lists toggles (Palette, Reduced Motion, Dynamic Type). Right pane previews changes live using the `monochrome` accessibility palette baseline. Toggle controls snap to the 8 px grid and display seed readouts when determinism features are enabled.
- **HUD callouts**: Score, Target %, Seed ID, and Lives modules align across the top bar. Each module reserves space for iconography plus text to satisfy the “no color-only cues” requirement.
- **Pause modal**: Centered 480 px wide panel with Resume, Restart, Settings shortcuts, and an Accessibility summary (current palette, motion state). Panel references the widget geometry and bevel rules listed earlier.
- **Wireframe archive**: Exported low-fidelity mock-ups will be stored under `docs/wireframes/` in Phase 1; until then, Retro UI spec text acts as canonical guidance for the UI designer and gameplay engineer.

## Procedural Texture & Dither Guidance
- Procedural noise uses fixed seed per mission to generate 2-bit dither overlays. Patterns cycle every 8 frames to avoid static shimmer.
- Employ Bayer matrix dithering for gradient fills (4x4 matrix) tinted using palette secondary/primary mix at 70% intensity.
- Particle sprites generated at runtime: 16x16 px base using accent color gradients, alpha clipped to 80% for additive blend.
- Loading screens render scanline overlay with 2 px spacing and 20% opacity to evoke CRT feel without harming readability.

## Animation & Motion Constraints
- All animations respect `reducedMotion` flag: disable jitter, reduce duration by 50%, and replace oscillations with fades.
- Default easing: `cubicOut` for button hover, `cubicInOut` for modal open/close, `spring` with damping 0.75 for beam milestone celebrations.
- Frame budgets: keep UI animation updates under 2 ms per frame on A12-class chips; prefer timeline-driven updates over per-frame randomness.

## Accessibility Considerations
- Provide textual seed readout for QA reproduction and visually impaired players.
- Ensure palette choices maintain contrast; fallback to `monochrome` palette automatically when system high-contrast mode is enabled.
- All color-coded signals must include iconography or text labels (e.g., warning triangle plus alert text).
- Support Dynamic Type by scaling base grid unit: multiply 8 px unit by 1.2 for Large, 1.4 for Extra Large accessibility sizes.
- Audio cues must pair with haptic/visual alternatives; maintain volume mixing guidelines in Phase 3 audio design doc.

## Change Log
- **Phase 0**: Established foundational palette, geometry, and accessibility baselines for Barrack+ retro aesthetic.
