# Phase 05_Overlay_p5

## Objectives
- Embed the optional p5.js background overlay via WKWebView with local script hosting.
- Sync overlay animations with in-game metrics (combo, capture %, music amplitude proxy).
- Provide build flag to disable overlay and ensure fallback gradient renders correctly.

## Risks & Mitigation
- **WKWebView sandbox limitations** – pre-bundle p5 scripts and test offline to avoid network calls.
- **Performance overhead** – throttle bridge messages and allow overlay to render at lower FPS.
- **Input conflicts** – ensure overlay view ignores touch gestures when not focused.

## Tasks by Agent
- **Architect:** Configure `OverlayBridge` and `WebOverlayView`, exposing toggles in build flags.
- **Gameplay Dev:** Publish overlay events (e.g., combo multiplier) via Combine or NotificationCenter.
- **Graphics Dev:** Design p5 sketch reacting to events with smooth gradients and minimal CPU.
- **UI Designer:** Provide settings toggle for overlay and document accessibility impact.
- **QA Engineer:** Verify overlay loads without internet and does not block primary game input.

## Acceptance Tests
- Overlay renders animated background that responds to injected events.
- Disabling overlay removes WKWebView from hierarchy and restores base background rendering.
- Offline device run confirms no external network resources are requested.
