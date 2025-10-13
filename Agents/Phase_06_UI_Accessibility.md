# Phase 06_UI_Accessibility

## Objectives
- Implement SwiftUI menus (start, pause, settings) and dynamic HUD elements.
- Add color-blind palettes, dynamic type scaling, and reduced motion toggle.
- Persist settings using AppStorage/UserDefaults for cross-session retention.

## Risks & Mitigation
- **Dynamic type layout breakage** – build flexible stacks and test large accessibility sizes.
- **Colour contrast issues** – validate palettes meet WCAG AA guidelines using simulator tools.
- **State persistence bugs** – write snapshot tests covering AppStorage round-trips.

## Tasks by Agent
- **Architect:** Define persistence keys and ensure settings propagate to SpriteKit scene.
- **Gameplay Dev:** Hook HUD to live captured percentage, combo multipliers, and timer (if enabled).
- **Graphics Dev:** Adjust effects in response to palette changes and reduced motion states.
- **UI Designer:** Craft SwiftUI navigation flows and ensure pointer/touch parity.
- **QA Engineer:** Create UI tests or manual scripts verifying toggles persist between launches.

## Acceptance Tests
- Settings menu allows palette switching, reduced motion, and overlay toggles with immediate feedback.
- Accessibility inspector confirms dynamic type adjustments without clipped text.
- Relaunching the app maintains previously selected accessibility settings.
