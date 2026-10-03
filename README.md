# rag

RAG Retrieval & Chunking Benchmark Lab. Static Vite + TypeScript app; heavy engine work is designed for a Web Worker and has no server state.

## Current state

The repository currently contains the M0 browser spike, a reference-results shell, and the first DOM-free engine slice. Reference numbers are deliberately unmeasured until `bun run bench:reference` is run on the reference machine.

## Run

```sh
bun install
bun run dev
bun run typecheck
bun run test
bun run build
bun run spike
```

Open `/scripts/m0-spike/` under the Vite server to run the M0 capability spike. It reports timer, worker, and browser capability facts; model and Sastrawi measurements remain `TBD` until their explicit experiments are added.

## Cloudflare Pages

Use these project settings for the static Pages deployment:

- Build command: `bun run build`
- Build output directory: `dist`
- Deploy command: leave empty; Pages publishes the build output itself

Do not set a deploy command in the Pages dashboard and do not use `npx wrangler deploy` for this project. That command belongs to the newer Workers Static Assets path and triggers Wrangler's Vite auto-setup. The Pages project should build and publish `dist` directly. See the [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/) documentation.

## Method constraints

Retrieval only; no answer generation. Uploaded content must remain local. Live model loading is opt-in and must not happen on the reference landing page. See [docs/DECISIONS.md](docs/DECISIONS.md), [docs/M0-results.md](docs/M0-results.md), and [docs/LICENSES.md](docs/LICENSES.md).

## Architecture

```text
static Vite app -> Web Worker -> DOM-free engine
                 -> local reference-results.json
                 -> opt-in Hugging Face model loading
```

Unmeasured values are `TBD`; no benchmark result is fabricated.
