# M0 results

Run `bun run spike`, open the local URL, then export the JSON report. Fill the tables below with measurements from the target hardware. Do not replace `TBD` with estimates.

## Environment

| Field | Result |
|---|---|
| Browser/version | TBD |
| OS/device | TBD |
| Cores | TBD |
| crossOriginIsolated | TBD |

## Timing

| Experiment | Backend/config | Batch size | Median per operation (ms) | p95 (ms) |
|---|---|---:|---:|---:|
| performance.now resolution | TBD | TBD | TBD | TBD |
| sentence embedding | TBD | TBD | TBD | TBD |
| stemming 10,000 tokens | cached | TBD | TBD | TBD |
| stemming 10,000 tokens | uncached | TBD | TBD | TBD |

## Download and isolation

| Experiment | Result | Notes |
|---|---|---|
| interrupted model download | TBD | TBD |
| COOP/COEP model loading | TBD | TBD |
| WebGPU availability | TBD | TBD |
| WASM multithread availability | TBD | TBD |

## Decisions after measurement

- TODO(M0): set measured values in `packages/engine/src/config/limits.ts`.
- TODO(M0): choose default backend and sample size.
