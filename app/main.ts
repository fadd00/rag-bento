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
  <header class="hero">
    <p class="eyebrow">RAG / RETRIEVAL LAB</p>
    <h1>See the limit.<br />Measure it.</h1>
    <p class="lede">Three retrievers. One query stream. Live evidence.</p>
  </header>
  <main>
    <section class="control-strip" aria-label="Experiment controls">
      <label>Dataset<select><option>nano-miracl-id</option><option>chunking-id</option></select></label>
      <label>Queries<input type="number" value="30" min="1" max="150" /></label>
      <label>Top K<input type="number" value="10" min="1" max="10" /></label>
      <label>Mode<select><option>Reference</option><option>Quick</option><option>Full</option></select></label>
      <button class="run-button" type="button" disabled title="The live runner arrives in the upload milestone">Run probe <span>30 q max</span></button>
    </section>
    <section class="dashboard" aria-labelledby="dashboard-title">
      <h2 id="dashboard-title" class="sr-only">Reference benchmark dashboard</h2>
      <article class="panel quota-panel">
        <div class="panel-label"><span>REFERENCE RUN</span><small>${data.status}</small></div>
        <div class="big-value">TBD</div>
        <p class="panel-note">No measured reference result</p>
        <div class="progress-track"><span></span></div>
      </article>
      <article class="panel telemetry-panel">
        <div class="panel-label"><span>LAST 60 SEC</span><small>waiting</small></div>
        <div class="stat-row"><div><strong>--</strong><small>nDCG@10</small></div><div class="coral"><strong>--</strong><small>query p50</small></div><div><strong>--</strong><small>index ms</small></div></div>
      </article>
      <article class="panel feed-panel">
        <div class="panel-label"><span>EVENT FEED</span><small>reference only</small></div>
        <p class="empty-copy">No measured events yet.</p>
        <p class="feed-line"><i></i> Landing page loaded without model download</p>
      </article>
      <article class="panel readout-panel">
        <div class="panel-label"><span>SHADOW READOUT</span><small>vs reference</small></div>
        <p class="readout-value">${data.note}</p>
        <a href="/docs/M0-results.md">Open M0 results template <span aria-hidden="true">&#8599;</span></a>
      </article>
    </section>
    <section class="accessible-results" aria-labelledby="results-title">
      <div class="section-heading"><span class="eyebrow">ACCESSIBLE DATA</span><h2 id="results-title">Reference results</h2></div>
      <div class="table-wrap">
        <table>
          <caption>Equivalent data table for the visual dashboard</caption>
          <thead><tr><th>Configuration</th><th>nDCG@10</th><th>Precision@10</th><th>Query p50</th></tr></thead>
          <tbody><tr><td colspan="4">No measured rows</td></tr></tbody>
        </table>
      </div>
    </section>
  </main>
  <footer>Retrieval only / timing is device-dependent / unmeasured values stay marked TBD.</footer>
`;
