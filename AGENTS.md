## Invariants

- Keep this package dependency-light. Do not add runtime dependencies unless strictly necessary.

## Required validation

Run after changing code (not docs-only):

```bash
npm run pack:check
```

## Changelog

- Any change that modifies behavior must include a `CHANGELOG.md` entry under **[Unreleased]** in the same change.

## Release process

For commit/push/tag/GitHub release/npm publish workflow, follow `docs/release-playbook.md`.
