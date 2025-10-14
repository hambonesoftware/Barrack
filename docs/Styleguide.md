# Barrack+ Engineering Styleguide – Phase 0

## Repository Conventions
- `Sources/` will host Swift modules split into `App`, `Engine`, `Gameplay`, `Rendering`, and `Support` once Phase 1 scaffolding begins.
- `Resources/` will contain JSON data (`levels.json`, `palettes.json`), localized strings, and asset catalogs. Procedural textures will be generated at runtime, so only seed templates live here.
- `Tests/` will mirror module boundaries with `AppTests`, `EngineTests`, and `GameplayTests`. Snapshot fixtures belong under `Tests/Resources/`.
- `Docs/` (capitalization flexible on case-insensitive systems) stores design artifacts such as this styleguide, architecture blueprint, and retro UI specification.
- Phase-specific notes remain inside `Agents/Phase_##_*.md` with append-only updates for traceability.

## Languages & Toolchains
- **Swift**: Target Swift 5.9 with Swift Playgrounds 4.x compatibility. Enable Swift Concurrency features where beneficial but maintain deterministic behaviour in the core loop.
- **SwiftUI + SpriteKit**: Primary UI/graphics stack. SpriteKit scene updates must remain deterministic with explicit time deltas; SwiftUI handles overlays and user input.
- **Auxiliary Tooling**: Shell scripts and configuration files should prefer POSIX sh compatibility. Python 3.11 is acceptable for tooling prototypes (e.g., data validators) when Swift is unsuitable.

## Formatting & Linting
- Adopt [swift-format](https://github.com/apple/swift-format) with the official swift-format configuration pinned in Phase 1. Line length guideline: 100 characters.
- Use [SwiftLint](https://github.com/realm/SwiftLint) for static checks. Enable rules for explicit `self`, unused code, and cyclomatic complexity warnings.
- JSON assets must be validated via `jq` or a Swift command-line validation target before check-in.
- Markdown documentation follows [markdownlint](https://github.com/DavidAnson/markdownlint) rules MD001-MD046. Tables must include header separators and alignments where useful.

## Commit & Branch Strategy
- Follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat`, `fix`, `docs`, `chore`). Phase documentation updates use `docs` unless coupled with code scaffolding.
- Feature branches should follow `phase##/feature-name` naming to keep alignment with the Agents roadmap (e.g., `phase02/beam-logic`).
- Require linear history via squash merges unless stakeholders request release branches.

## Testing Policy
- **Unit Tests**: Prioritize deterministic tests for beam logic, fill detection, RNG service, and JSON parsing. Tests must inject seeds explicitly.
- **Integration Tests**: Utilize SpriteKit automation hooks to simulate mission completion thresholds. Record baseline target percentages for regression detection.
- **Snapshot Tests**: Deploy iPad and Mac view snapshots to guard UI regressions, using deterministic seeds for layout content.
- **Performance Baselines**: Capture frame time, memory footprint, and determinism metrics in Phase 3 onward. Document thresholds in `perf-baselines.json`.
- Tests run via `swift test` orchestrated through a future `make test` wrapper once the Makefile is introduced.

## Documentation Practices
- Maintain ADR-style notes in `docs/decisions/` (to be created Phase 1) for architectural trade-offs.
- Update the Architecture and Retro UI specs when major changes occur; include change logs at the bottom of each file.
- Use inclusive language, avoid unexplained acronyms, and reference the glossary when new terminology appears.
- Link to relevant Agents phase documents when cross-referencing tasks.

## Coding Patterns & Principles
- Prefer composition over inheritance in SwiftUI and SpriteKit components.
- Inject dependencies via protocol-based services (`RNGServiceProtocol`, `LevelRepositoryProtocol`) to facilitate testing and deterministic simulations.
- Avoid global singletons; rely on environment objects or explicit initializers.
- Keep SpriteKit node graph shallow; prefer child nodes per gameplay entity with minimal deep hierarchies to reduce update cost.
- Ensure all asynchronous code captures seeds/timestamps needed for reproducibility when bridging to concurrency APIs.

## Accessibility & Internationalization
- Provide large-text and high-contrast palette presets in `palettes.json` with metadata flags for UI toggles.
- Support VoiceOver by exposing SpriteKit state summaries through SwiftUI accessible labels.
- Use `Text` localization via `.stringsdict` for pluralization (Phase 2+ implementation).

## Tooling & Automation Roadmap
- Introduce `pre-commit` hooks in Phase 1 featuring swift-format, SwiftLint, markdownlint, and JSON schema validation.
- Define CI pipelines (GitHub Actions) to run linting, tests, and screenshot comparisons; pipeline design documented during Phase 1 scaffolding.
- Maintain `Scripts/` directory for reproducible automation tasks; scripts must be idempotent and documented with usage examples.
