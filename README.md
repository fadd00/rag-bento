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
- Deploy command: `bun run deploy:pages`

Create the Pages project once before the first deployment:

```sh
export CLOUDFLARE_ACCOUNT_ID=249c991ca14848a15854569846af41a4
export CLOUDFLARE_API_TOKEN=your_token_here
bun run pages:create
```

The command creates the Pages project named `rag-bento` in the account selected by `CLOUDFLARE_ACCOUNT_ID`. Run it once from a local terminal or CI setup job, not as part of every Pages build. After it succeeds, the deploy command can run `npx wrangler pages deploy dist --project-name=rag-bento`.

Do not use `npx wrangler deploy`; that command targets a Workers deployment and triggers Wrangler's Vite auto-setup.

For Direct Upload in CI, configure `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` as encrypted environment variables. Create a **custom Account API token** scoped to this account with **Account > Cloudflare Pages > Edit** permission. A token can be valid and still fail with API error `10000` if it lacks this permission. See the [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/) and [API token permissions](https://developers.cloudflare.com/fundamentals/api/reference/permissions/) documentation.

The account ID is `249c991ca14848a15854569846af41a4` for the current Cloudflare account. Set it in the Pages project environment variables; never commit the token.

## Method constraints

Retrieval only; no answer generation. Uploaded content must remain local. Live model loading is opt-in and must not happen on the reference landing page. See [docs/DECISIONS.md](docs/DECISIONS.md), [docs/M0-results.md](docs/M0-results.md), and [docs/LICENSES.md](docs/LICENSES.md).

## Architecture

```text
static Vite app -> Web Worker -> DOM-free engine
                 -> local reference-results.json
                 -> opt-in Hugging Face model loading
```

Unmeasured values are `TBD`; no benchmark result is fabricated.
