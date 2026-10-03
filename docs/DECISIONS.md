# Decisions

## Scope

- The repository was empty apart from the supplied PRD and implementation prompt. The first implementation slice is M0 plus a static reference-results shell.
- The PRD is copied to `docs/PRD.md` from the supplied source document once the repository is initialized. The supplied file remains the initial source until then.
- No model, dataset, or browser download is triggered on landing-page load.

## Milestone plan

- M0: browser spike, limits/config placeholders, results template.
- M1: fixture-only pack builders and tests.
- M2: DOM-free engine and unit tests.
- M3: worker runner, grid loader, reference-results UI.
- M4: upload and labeling.
- M5: inspector, ablations, permalink.
- M6: reference benchmark and documentation.

## Verification ledger

- `TODO(verify)`: Transformers.js v4 pipeline options and tokenizer access must be checked against installed types before live embedding is implemented.
- `TODO(verify)`: choose and verify the Sastrawi JavaScript package after M0 timing.
- `TODO(verify)`: verify Cloudflare Pages configuration and cross-origin model loading before deployment. No deployment is performed here.
- `TODO(M0)`: live embedding cap, max sentences, timing batch size, and chunk limits remain provisional in `packages/engine/src/config/limits.ts`.
- `TODO(license)`: dataset and model licenses must be verified before publishing packs.

## Status

- 2026-10-03: M0 foundation created. No measurements are claimed; `docs/M0-results.md` is intentionally blank.
- 2026-10-03: Added an explicit empty Vite plugin array because Wrangler's non-interactive Vite auto-setup rejects configs without `plugins`. Cloudflare Pages should use build command `bun run build`, output directory `dist`, and no `npx wrangler deploy` deploy command; Worker deploy is a separate option and is not the PRD target.
