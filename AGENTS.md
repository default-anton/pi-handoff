## Invariants

- Keep this package dependency-light. Do not add runtime dependencies unless strictly necessary.
- `extensions/handoff.ts` must remain functionally identical to the original extension unless explicitly requested.

## Required validation

Run after changing code (not docs-only):

```bash
npm run pack:check
```

## Release process

For commit/push/tag/GitHub release/npm publish workflow, follow `docs/release-playbook.md`.
