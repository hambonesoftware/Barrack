# Phase 06 – UI & Accessibility

## Objectives
- Implement SwiftUI menus (start, pause, settings) alongside dynamic HUD elements.
- Add colour-blind palettes, dynamic type scaling, and a reduced-motion toggle.
- Persist settings with AppStorage/UserDefaults for cross-session retention.

## Key Risks & Mitigations
- **Dynamic type layout breakage**: use flexible layouts and test extreme accessibility sizes.
- **Colour contrast issues**: validate palettes against WCAG AA using simulator tooling.
- **State persistence bugs**: write snapshot tests covering AppStorage round-trips.

## Agent Responsibilities
- **Architect**: define persistence keys and ensure settings propagate to the SpriteKit scene.
- **Gameplay Developer**: hook HUD bindings to live captured percentage, combo multipliers, and timers.
- **Graphics Developer**: adjust effects in response to palette changes and reduced-motion state.
- **UI Designer**: craft SwiftUI navigation flows with parity between pointer and touch.
- **QA Engineer**: create UI tests or scripts verifying toggles persist across launches.

## Acceptance Tests
- Settings menu allows palette switching, reduced motion, and overlay toggles with immediate feedback.
- Accessibility inspector confirms dynamic type adjustments without clipped text.
- Relaunching the app preserves previously selected accessibility settings.
