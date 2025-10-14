# Phase 05 – Overlay (p5.js)

## Objectives
- Embed the optional p5.js background overlay with local script hosting inside a WKWebView.
- Sync overlay animations with in-game metrics such as combo, capture percentage, and audio proxies.
- Provide a build flag to disable the overlay and ensure a gradient fallback renders correctly.

## Key Risks & Mitigations
- **WKWebView sandbox limits**: pre-bundle p5 scripts and verify offline execution.
- **Performance overhead**: throttle bridge messaging and allow the overlay to run at lower FPS.
- **Input conflicts**: configure the overlay view to ignore game touch gestures when unfocused.

## Agent Responsibilities
- **Architect**: configure `OverlayBridge` and `WebOverlayView`, exposing build-time toggles.
- **Gameplay Developer**: publish overlay events (combo, capture %, music amplitude) via Combine or notifications.
- **Graphics Developer**: design the p5 sketch with smooth gradients and minimal CPU usage.
- **UI Designer**: add a settings toggle for the overlay and document accessibility impact.
- **QA Engineer**: verify the overlay loads without internet access and never blocks primary input.

## Acceptance Tests
- Overlay renders animated backgrounds responding to injected events.
- Disabling the overlay removes the WKWebView and restores the base background.
- Offline runs confirm no external network resources are requested.
