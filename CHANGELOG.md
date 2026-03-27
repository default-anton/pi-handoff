# Changelog

All notable changes to `pi-handoff` are documented here.

## Format

- Keep `## [Unreleased]` at the top.
- Use release headers as `## [X.Y.Z] - YYYY-MM-DD`.
- Group entries under `### Added`, `### Changed`, `### Fixed` (optionally `### Removed` / `### Security`).
- Keep entries short and operator/user-facing.

## [Unreleased]

### Added

- None.

### Changed

- None.

### Fixed

- None.

## [1.1.5] - 2026-03-27

### Added

- None.

### Changed

- Updated peer dependency `@mariozechner/pi-coding-agent` to `^0.63.1` for pi 0.63.x compatibility.

### Fixed

- Tightened session message parsing so `/handoff` stays compatible with pi 0.63.x message typings.

## [1.1.4] - 2026-03-12

### Added

- None.

### Changed

- Increased `/handoff` wait timeout from 30 seconds to 5 minutes before reporting a timeout while generating the handoff note.

### Fixed

- None.

## [1.1.3] - 2026-03-04

### Added

- None.

### Changed

- None.

### Fixed

- Fixed `/handoff` race condition where handoff note capture could run before the assistant response was persisted, causing false "Failed to capture handoff note" errors.

## [1.1.2] - 2026-02-17

### Added

- None.

### Changed

- Updated peer dependency `@mariozechner/pi-coding-agent` to `^0.53.0`.

### Fixed

- None.

## [1.1.1] - 2026-02-13

### Added

- None.

### Changed

- Updated peer dependency `@mariozechner/pi-coding-agent` to `^0.52.12`.

### Fixed

- None.

## [1.1.0] - 2026-02-13

### Added

- None.

### Changed

- `/handoff` now sends the generated handoff note and task to the new session immediately instead of pre-filling the editor for manual submission.

### Fixed

- None.

## [1.0.1] - 2026-02-12

### Added

- Added automated GitHub Actions release workflow (`.github/workflows/release.yml`) triggered by stable `vX.Y.Z` tags.
- Added release validation and notes extraction scripts: `scripts/verify-release-tag.mjs` and `scripts/changelog-release-notes.mjs`.

### Changed

- Updated release process to use trusted publishing (`npm publish --provenance --access public`) from CI instead of manual local publishing.
- Added canonical npm release scripts (`release:verify-tag`, `release:notes`, `release:gate`) to `package.json`.

### Fixed

- None.
