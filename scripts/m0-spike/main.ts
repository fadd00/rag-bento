type SpikeReport = {
  capturedAt: string;
  browser: { userAgent: string; crossOriginIsolated: boolean; cores: number | null; webgpu: boolean };
  timer: { resolutionMs: number | null };
  worker: { roundTripMs: number | null };
  pending: string[];
};

const output = document.querySelector<HTMLPreElement>('#output');
const runButton = document.querySelector<HTMLButtonElement>('#run');
const downloadButton = document.querySelector<HTMLButtonElement>('#download');
let lastReport: SpikeReport | null = null;

if (!output || !runButton || !downloadButton) throw new Error('Spike controls are missing');

function timerResolution(): number | null {
  const samples: number[] = [];
  let previous = performance.now();
  for (let index = 0; index < 1000; index += 1) {
    const current = performance.now();
    if (current > previous) samples.push(current - previous);
    previous = current;
  }
  return samples.length > 0 ? Math.min(...samples) : null;
}

function workerRoundTrip(): Promise<number | null> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    const started = performance.now();
    worker.onmessage = () => {
      worker.terminate();
      resolve(performance.now() - started);
    };
    worker.onerror = () => {
      worker.terminate();
      resolve(null);
    };
    worker.postMessage('ping');
  });
}

runButton.addEventListener('click', async () => {
  runButton.disabled = true;
  output.textContent = 'Measuring...';
  const report: SpikeReport = {
    capturedAt: new Date().toISOString(),
    browser: {
      userAgent: navigator.userAgent,
      crossOriginIsolated: globalThis.crossOriginIsolated,
      cores: navigator.hardwareConcurrency ?? null,
      webgpu: 'gpu' in navigator,
    },
    timer: { resolutionMs: timerResolution() },
    worker: { roundTripMs: await workerRoundTrip() },
    pending: [
      'embedding speed by backend',
      'sentence throughput for max_sentences',
      'Sastrawi cached and uncached timing',
      'interrupted Hugging Face download behavior',
      'COOP/COEP model loading compatibility',
    ],
  };
  lastReport = report;
  output.textContent = JSON.stringify(report, null, 2);
  runButton.disabled = false;
});

downloadButton.addEventListener('click', () => {
  if (!lastReport) return;
  const blob = new Blob([JSON.stringify(lastReport, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'rag-m0-report.json';
  link.click();
  URL.revokeObjectURL(link.href);
});
