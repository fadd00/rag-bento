import './style.css';
import referenceResults from '../data/reference-results.json';

type ReferenceResults = {
  status: string;
  generatedBy: string;
  generatedAt: string | null;
  device: unknown;
  results: Array<Record<string, string | number>>;
  note: string;
};

const data = referenceResults as ReferenceResults;
const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root is missing');
}

app.innerHTML = `
  <header class="topbar">
    <div>
      <p class="eyebrow">RAG RETRIEVAL & CHUNKING BENCHMARK LAB</p>
      <h1>Reference results</h1>
      <p class="lede">A reproducible, browser-local comparison of chunking and retrieval. Live runs stay opt-in.</p>
    </div>
    <button class="run-button" type="button" disabled title="Live runs arrive in the upload milestone">Run live <span aria-hidden="true">&#8599;</span></button>
  </header>
  <main>
    <section class="status-band" aria-labelledby="status-title">
      <div>
        <p class="eyebrow">CURRENT DATASET</p>
        <h2 id="status-title">No measured reference run yet</h2>
        <p>${data.note}</p>
      </div>
      <div class="status-value" aria-label="Reference status">TBD</div>
    </section>
    <section class="results-section" aria-labelledby="results-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">MATRIX</p>
          <h2 id="results-title">Chunker x retriever</h2>
        </div>
        <span class="chip">nDCG@10</span>
      </div>
      <div class="empty-state">
        <div class="empty-mark" aria-hidden="true">+</div>
        <h3>Measurements will appear here</h3>
        <p>Reference results are generated only by the benchmark runner. This page makes no model request on load.</p>
      </div>
      <div class="table-wrap">
        <table>
          <caption>Equivalent data table for reference results</caption>
          <thead><tr><th>Configuration</th><th>nDCG@10</th><th>Precision@10</th><th>Query p50</th></tr></thead>
          <tbody><tr><td colspan="4">No measured rows</td></tr></tbody>
        </table>
      </div>
    </section>
    <section class="attribution" aria-labelledby="attribution-title">
      <p class="eyebrow">ATTRIBUTION</p>
      <h2 id="attribution-title">Dataset and model credits</h2>
      <p>Attribution will be published after source licenses are verified. See <a href="/docs/LICENSES.md">docs/LICENSES.md</a>.</p>
    </section>
  </main>
  <footer>Retrieval only. Timing is device-dependent. Unmeasured values stay marked TBD.</footer>
`;
