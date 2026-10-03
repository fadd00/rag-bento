import { writeFile } from 'node:fs/promises';

const result = {
  status: 'unmeasured',
  generatedBy: 'bench_reference.ts',
  generatedAt: null,
  device: null,
  results: [],
  note: 'Reference benchmark runner is a placeholder until the worker runner and fixture pack are complete.',
};

await writeFile(new URL('../data/reference-results.json', import.meta.url), `${JSON.stringify(result, null, 2)}\n`);
console.log('Wrote unmeasured reference-results.json; run only after the benchmark runner is implemented.');
