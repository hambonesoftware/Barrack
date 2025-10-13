# Phase 09_Polish_QA

## Objectives
- Resolve remaining bugs, smooth difficulty spikes, and ensure visual polish across platforms.
- Produce marketing captures/GIFs and finalize README with release notes.
- Conduct final QA sweep including accessibility, localisation placeholders, and performance burn-in.

## Risks & Mitigation
- **Last-minute regressions** – enforce code freeze after QA sign-off with hotfix protocol.
- **Documentation gaps** – maintain shared release checklist and have cross-team reviews.
- **Platform inconsistencies** – test on iPad hardware, Mac Catalyst, and Swift Playgrounds App.

## Tasks by Agent
- **Architect:** Oversee build packaging, verify bundle identifiers, and prepare submission artefacts.
- **Gameplay Dev:** Balance timers, power-up durations, and ensure deterministic results across runs.
- **Graphics Dev:** Finalise shader tuning, screenshot capture, and ensure overlay gracefully degrades when disabled.
- **UI Designer:** Polish menus, align typography, and ensure onboarding messaging is clear.
- **QA Engineer:** Execute full regression matrix, record known issues, and archive metrics.

## Acceptance Tests
- All blocking bugs resolved with QA sign-off documented.
- README updated with controls, accessibility notes, build instructions, and GIF references.
- Final playthrough completes entire campaign without crashes or soft locks.
