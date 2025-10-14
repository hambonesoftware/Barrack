# Phase 09 – Polish & QA

## Objectives
- Resolve remaining bugs, smooth difficulty spikes, and ensure visual polish across platforms.
- Produce marketing captures/GIFs and finalize the README with release notes.
- Conduct a final QA sweep covering accessibility, localization placeholders, and performance burn-in.

## Key Risks & Mitigations
- **Last-minute regressions**: enforce a code freeze after QA sign-off with a defined hotfix protocol.
- **Documentation gaps**: maintain a shared release checklist and run cross-team reviews.
- **Platform inconsistencies**: test on iPad hardware, Mac Catalyst, and the Swift Playgrounds app.

## Agent Responsibilities
- **Architect**: oversee build packaging, verify bundle identifiers, and prepare submission artifacts.
- **Gameplay Developer**: balance timers and power-ups while ensuring deterministic results across runs.
- **Graphics Developer**: finalize shader tuning, capture screenshots, and ensure overlay fallbacks degrade gracefully.
- **UI Designer**: polish menus, align typography, and clarify onboarding messaging.
- **QA Engineer**: execute the full regression matrix, log known issues, and archive release metrics.

## Acceptance Tests
- All blocking bugs resolved with QA sign-off documented.
- README updated with controls, accessibility notes, build steps, and media references.
- Final playthrough completes the full campaign without crashes or soft locks.
