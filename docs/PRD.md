# PRD: rag.hutamalabs.dev — RAG Retrieval & Chunking Benchmark Lab

**Status:** Draft v4 · **Owner:** Fadd · **Host:** Cloudflare Pages (free), 100% client-side · **Bahasa dokumen:** Indonesia, istilah teknis Inggris

## Changelog v4

- **Keputusan A terkunci:** grid embedding *precomputed* (§6.7) menjadi jalur utama untuk korpus besar; embedding live hanya untuk upload/konfigurasi kustom.
- **Keputusan B terkunci:** dua dataset terpisah — NanoMIRACL Indonesia untuk perbandingan retriever (tanpa chunking) dan *custom chunking pack* dari artikel MIRACL (§6.1, §9).
- Dokumen dipecah pada gap passage; token inspector (FR-19) dengan peringatan merah bila chunk melebihi `max_len`.
- Signifikansi di UI: distribusi Δ per query + paired bootstrap CI, signifikan bila CI tidak mencakup 0.
- Vocab-pruning: korpus acak ID/EN di luar artikel eksperimen, `min_count = 2`.
- Query bebas pada mode grid: **keputusan (a)** — query bawaan pack untuk dense/hybrid, query yang diketik hanya BM25 di v1.
- Grid wajib dibuat dengan artefak ONNX yang sama dengan browser (paritas embedding).

## Changelog v3

- Jawaban open question dari Fadd dicatat sebagai **keputusan**, dengan status verifikasi per item (estimasi vs terukur) di §15.
- Demo EN: `all-MiniLM-L6-v2` int8; tiap model punya konfigurasi sendiri (`max_len`, prefix, pooling) dan peringatan truncation.
- Batas live embedding on-device: 100–150 chunk.
- **Aturan signifikansi diperbaiki:** bukan "CI tidak tumpang tindih", tetapi Δ dengan *paired bootstrap CI* untuk pasangan konfigurasi yang dipilih.
- Metodologi waktu: warm-up dibuang, pengukuran per-operasi amortized (resolusi timer browser terbatas).
- Open question baru: ukuran korpus vs batas live, kecocokan NanoMIRACL dengan eksperimen chunking, lisensi data, gap passage, panjang input model.

## Changelog v2

- **Semantic chunking dibatasi keras:** opt-in, batas jumlah kalimat per dokumen, batch inference, dan biaya preprocessing dilaporkan sebagai metrik tersendiri.
- **Model bertingkat (ukuran terverifikasi):** `multilingual-e5-small` q8 itu 118 MB (≈135 MB dengan tokenizer), jadi tidak jadi default. Tambah model demo ringan, termasuk varian vocab-pruned ID+EN buatan sendiri.
- **Landing = Reference Results**; run live bersifat opt-in dan memakai model demo secara default.
- **Stemming Sastrawi** wajib memoization (stem per *unique word*), waktu tokenize/stem/index dilaporkan terpisah.
- **Rekonstruksi MIRACL ketat:** offset dicatat saat penggabungan (tanpa `indexOf`), tanpa normalisasi teks, divalidasi dengan `assert`, query yang gagal dibuang dan dihitung.
- **COOP/COEP bukan default.** `index_bytes` terhitung = metrik memori utama; isolation baru dipakai bila spike M0 membuktikan manfaat tanpa merusak loading.

## 1. Ringkasan

`rag` adalah laboratorium benchmark retrieval di browser. Pengunjung memilih dataset bergaransi (ground truth) atau mengunggah satu file teks, lalu membandingkan **strategi chunking** × **metode retrieval** (BM25, dense/vector, hybrid) secara live, dengan metrik terukur: Precision@K, Recall@K, MRR, nDCG, latensi retrieval, waktu indexing, dan ukuran memori indeks.

**Kenapa client-side:** seluruh komputasi (chunking, embedding, search) berjalan di browser pengunjung. Biaya server nol, file unggahan tidak pernah meninggalkan perangkat, dan tidak ada risiko kuota habis seperti proyek yang butuh backend.

**Posisi di portfolio:** menghubungkan riset akademik (benchmarking lokal, pengukuran latensi dan memori) dengan produk yang bisa dicoba orang lain. Fokusnya adalah **metodologi pengukuran yang jujur**, bukan klaim "strategi X paling bagus".

## 2. Latar riset (ringkas, lihat §14 untuk sumber)

- **Hasil studi chunking saling bertentangan.** Ada benchmark yang menempatkan recursive 512 token di atas semantic chunking untuk akurasi end-to-end, ada yang menemukan semantic menang di retrieval recall, dan satu studi besar melaporkan fixed-size char sebagai baseline yang lemah. Penyebabnya: metrik berbeda (recall vs akurasi jawaban), dataset berbeda, dan ukuran chunk semantic yang terlalu kecil. Artinya lab ini bernilai justru karena membiarkan pengunjung mengukur sendiri pada data mereka.
- **Hybrid via RRF** adalah default industri yang masuk akal: bekerja pada peringkat (bukan skor), sehingga tidak butuh normalisasi skor antar metode, dengan konstanta k = 60 dari paper aslinya. Nilai k itu default, bukan hukum, jadi dibuat sebagai parameter ablation.
- **Bahasa Indonesia** butuh perhatian khusus: model embedding multilingual (multilingual-e5-small) tersedia dalam format ONNX untuk Transformers.js, dan stemmer Indonesia (Sastrawi) punya port JavaScript. Stemming dijadikan variabel eksperimen BM25.
- **Dataset berlabel Indonesia tersedia:** MIRACL punya korpus Wikipedia Indonesia dengan relevance judgments dari annotator native.

## 3. Goals & Non-Goals

**Goals**
- G1. Membandingkan ≥ 3 metode retrieval (BM25, dense, hybrid RRF) pada kondisi identik.
- G2. Membandingkan ≥ 4 strategi chunking (fixed, recursive, sentence, semantic; structure-aware untuk `.md`).
- G3. Metrik kualitas **dan** biaya dalam satu layar: kualitas (P@K, R@K, MRR, nDCG), kecepatan (indexing ms, latensi query p50/p95), memori (ukuran indeks).
- G4. Ground truth nyata (dataset sample + labeling manual di mode upload), bukan skor tanpa label.
- G5. Hasil reproducible dan bisa diekspor (CSV/JSON), cocok dengan gaya toolkit benchmark skripsi.
- G6. Demo instan: hasil referensi tampil tanpa menunggu model terunduh.

**Non-Goals (v1)**
- Evaluasi generasi jawaban LLM (answer accuracy). Lab ini mengukur **retrieval saja**.
- Reranker cross-encoder, ANN index (HNSW/IVF), vector DB server-side.
- Parsing PDF/DOCX (hanya `.txt` dan `.md`).
- Akun pengguna, penyimpanan hasil di server.

## 4. Persona

| Persona | Kebutuhan |
|---|---|
| Recruiter / reviewer | Paham < 30 detik; lihat hasil tanpa menunggu unduhan model |
| Engineer RAG | Mencoba dokumen sendiri, ubah ukuran chunk/overlap, lihat dampak ke metrik |
| Fadd | Bahan cerita metodologi + angka referensi dari mesin riset sendiri |

## 5. Constraints

- **Hosting statis di Cloudflare Pages (free).** Batas per file aset 25 MiB, jadi model embedding tidak boleh di-host di Pages; dimuat dari Hugging Face Hub. Sample dataset yang melebihi 25 MiB dipecah jadi beberapa file atau di-host di HF Datasets.
- Performa bergantung perangkat pengunjung → semua angka latensi diberi label perangkat (backend WebGPU/WASM, jumlah core, user agent).
- **Ukuran model terverifikasi (Hugging Face):** `Xenova/multilingual-e5-small` — q8 118 MB, fp32 470 MB; unduhan total termasuk tokenizer sekitar 135 MB. Tabel embedding menyumbang ±81% bobot model, sehingga vocab-pruning efektif menyusutkan ukuran (varian EN+FR pruned: ±30 MB).
- Tanpa backend berarti tanpa kuota Worker/DO yang perlu dijaga, kecuali fitur opsional di §6.6.

## 6. Functional Requirements

### 6.1 Sumber data

| ID | Mode | Isi |
|---|---|---|
| FR-1a | **Retrieval pack** | `nano-miracl-id`: NanoMIRACL split Indonesia, passage apa adanya (±10.000 passage menurut sumber pihak ketiga, **ukuran aktual diverifikasi di M1**). Hanya untuk membandingkan BM25 vs dense vs hybrid; **tanpa** variabel chunking |
| FR-1b | **Chunking pack** | `chunking-id` (dan `chunking-en` bila ada waktu): dokumen panjang dari artikel MIRACL yang memuat gold passage + distraktor dari shard yang sama, dengan gold span. Hanya pack ini yang dipakai untuk membandingkan strategi chunking |
| FR-2 | **Upload** | Satu file `.txt`/`.md` (batas ukuran, mis. 2 MB). Diproses lokal, tidak diunggah |
| FR-3 | **Labeling manual (mode upload)** | Pengunjung mengetik pertanyaan lalu menyorot span jawaban di viewer dokumen → menjadi gold span. Minimal 5 query agar metrik ditampilkan, dengan peringatan "sampel kecil" |

**Rekonstruksi dokumen panjang dari MIRACL:** passage MIRACL pendek, sehingga chunking tidak bermakna. Script menggabungkan passage dari artikel yang sama menjadi satu dokumen panjang. Aturan ketat:
- **Offset dicatat saat penggabungan**, bukan dicari ulang dengan `indexOf`/substring (menghindari salah target pada frasa yang berulang).
- Teks passage disimpan **verbatim**, tanpa normalisasi spasi/tanda baca; pemisah antar passage tetap dan terdokumentasi.
- Dokumen hasil gabungan adalah "dokumen rekonstruksi dari passage yang tersedia", **bukan** klaim artikel Wikipedia utuh. **Dokumen dipecah pada titik diskontinuitas passage** (satu dokumen = rangkaian passage kontigu), karena menyambung `#0` dan `#2` secara paksa membuat adjacency artifisial yang membiaskan evaluasi batas chunk. Ada tidaknya gap dan urutan passage **diverifikasi di M1**, tidak diasumsikan.
- Query yang gagal validasi dibuang dan jumlahnya dicatat di metadata pack.

### 6.2 Chunking

| ID | Strategi | Parameter |
|---|---|---|
| FR-4 | Fixed-size | `size` (128/256/512/1024 token), `overlap` (0/10/20%) |
| FR-5 | Recursive character | separator berurutan (paragraf → baris → kalimat → kata), `size`, `overlap` |
| FR-6 | Sentence-based | jumlah kalimat per chunk, `min_tokens` |
| FR-7 | Semantic (breakpoint) | threshold jarak embedding antar kalimat, **`min_tokens` wajib** (floor), **`max_sentences` per dokumen** (default 60), **opt-in** dan tidak termasuk preset *Quick* |
| FR-8 | Structure-aware (`.md`) | pecah per heading, lalu recursive bila terlalu panjang |

- Penghitungan token memakai tokenizer dari model embedding terpilih; fallback aproksimasi karakter dengan label jelas.
- Setiap chunk menyimpan `start`/`end` offset karakter pada dokumen asal (dasar penilaian relevansi, lihat §7).

**Batas keras semantic chunking (FR-7):** strategi ini butuh dua lintasan embedding (kalimat untuk mencari batas, lalu chunk untuk indeks dense), sehingga paling mahal di browser.
- Dokumen melebihi `max_sentences` dipotong/dilewati dengan peringatan jelas; di sample pack, semantic dijalankan pada subset dokumen yang dibatasi.
- Embedding kalimat selalu **batch**; backend WebGPU dipakai bila ada, WASM sebagai fallback dengan peringatan estimasi lambat.
- Embedding kalimat ikut di-cache (IndexedDB) agar run ulang tidak membayar dua kali.
- Biaya `semantic_chunk_ms` ditampilkan terpisah dan menjadi temuan tersendiri (apakah akurasi tambahan sepadan dengan biayanya).

### 6.3 Retrieval

| ID | Metode | Detail |
|---|---|---|
| FR-9 | **BM25** | Implementasi sendiri (Okapi, `k1=1.2`, `b=0.75` sebagai default yang bisa diubah). Tokenizer: lowercase, stopword list, **opsi stemming Indonesia (Sastrawi)** on/off. **Wajib memoization:** stem dilakukan sekali per *unique word* (cache `Map`), lalu token dipetakan dari cache; berjalan di Worker. Waktu `tokenize_ms`, `stem_ms`, `index_ms` dicatat terpisah |
| FR-10 | **Dense** | Embedding di browser via Transformers.js; pencarian brute-force cosine di `Float32Array` (exact). Pilihan model bertingkat (lihat tabel di bawah). Awalan `query:`/`passage:` untuk keluarga e5 |
| FR-11 | **Hybrid** | Reciprocal Rank Fusion, `k=60` default; opsi weighted-sum dengan normalisasi min-max sebagai pembanding |

- Alasan BM25 buatan sendiri: kontrol penuh atas tokenizer (stemming Indonesia), parameter, dan penghitungan ukuran indeks. Library umum seperti MiniSearch tidak menargetkan stemmer/stopword per-locale.
- Hasil deterministik: tie-break berdasarkan `chunk_id`.
- **Konfigurasi per model:** `max_len` (batas token input), prefix (`query:`/`passage:` hanya untuk keluarga e5), pooling, normalisasi. Ukuran chunk yang melebihi `max_len` model terpilih ditolak atau diberi peringatan truncation yang terlihat (model dengan batas input pendek memotong teks diam-diam bila tidak dijaga).
- Backend inferensi: WebGPU bila tersedia, fallback WASM, dengan indikator di UI.

**Model bertingkat**

| Tier | Model | Ukuran unduhan | Catatan |
|---|---|---|---|
| Demo (EN) | `Xenova/all-MiniLM-L6-v2` int8 | ±23 MB (estimasi, **diverifikasi di M0**) | Hanya Inggris; untuk mencoba pipeline dengan koneksi lambat. `max_len` perlu dicek di M0 (kemungkinan lebih pendek dari keluarga e5) |
| Demo (ID+EN) | `multilingual-e5-small` **vocab-pruned ID+EN** buatan sendiri | target 30–40 MB (belum terbukti) | Dibuat dengan `scripts/prune_vocab.py`, di-host di repo HF sendiri. Keep-set token diturunkan dari **sampel acak Wikipedia ID/EN di luar daftar `article_id` eksperimen**, dengan `min_count = 2` untuk membuang long-tail noise (target ±35 MB). Penyusutan terkait tabel embedding yang mendominasi bobot; **selisih kualitas vs model penuh diukur oleh lab ini sendiri** |
| Full | `Xenova/multilingual-e5-small` q8 | ±118 MB model (≈135 MB total) | Untuk run referensi dan pengunjung yang memilih akurasi penuh |

- Model demo menjadi default saat pengunjung menekan "Run live"; model Full harus dipilih eksplisit.
- Metadata pruning (keep-set token, min count) dan hasil evaluasi dicantumkan di halaman metodologi.

### 6.4 Eksperimen & hasil

| ID | Fitur |
|---|---|
| FR-12 | **Matriks eksperimen:** chunker × retriever (heatmap nDCG@10 / P@K) |
| FR-13 | **Preset:** *Quick* (2 chunker × 3 retriever, ≤ 30 query) dan *Full* |
| FR-14 | **Ablation:** ukuran chunk, overlap, stemming on/off, `k` RRF, `K` retrieval |
| FR-15 | **Query inspector:** pilih query → top-K tiap retriever berdampingan, dengan gold span dan batas chunk disorot (menunjukkan kalau chunking memotong bukti) |
| FR-16 | **Rank diff:** dokumen yang ditemukan BM25 tetapi tidak oleh dense, dan sebaliknya |
| FR-17 | **Reference results:** hasil precomputed dari mesin referensi tampil langsung sebelum run live |
| FR-18 | **Export** CSV/JSON dan **permalink** (konfigurasi + ringkasan hasil di URL hash, tanpa server) |
| FR-19 | **Token inspector** di layer chunking: jumlah token per chunk dengan tokenizer model terpilih; peringatan **merah** bila chunk melampaui `max_len` model, chunk yang akan terpotong ditandai |

### 6.5 Caching & UX

- Model dan embedding di-cache (Cache API untuk model, IndexedDB untuk embedding dengan key `hash(model, teks)`), sehingga run ulang dan overlap chunk tidak menghitung ulang.
- **Batas live embedding on-device: 100–150 chunk per run** (keputusan Fadd, berdasarkan estimasi kecepatan WASM single-thread). Run lebih besar tidak diizinkan di sisi klien; korpus besar dijalankan lewat grid precomputed (§6.7).
- Semua komputasi berat di **Web Worker**; UI menampilkan progress (unduh model, chunking, embedding, scoring).
- **Landing page = Reference Results** (FR-17): tidak ada unduhan model apa pun sebelum pengunjung memilih "Run live".
- Unduhan model bersifat **opt-in**, menampilkan ukuran nyata dan perkiraan sebelum mulai, dengan progress dan tombol retry. Perilaku saat unduhan terputus (apakah dilanjutkan atau diulang) **diuji di M0**, tidak diasumsikan.

### 6.6 Opsional (v1.1): generator query sintetis

- Untuk mode upload tanpa label: Worker proxy ke LLM free tier membuat pertanyaan dari potongan dokumen; hasilnya tetap harus dikonfirmasi pengunjung (span jawaban).
- Endpoint dilindungi oleh **`guard`** (dogfooding) dan hanya aktif jika kuota tersedia. Tidak termasuk MVP.

### 6.7 Grid embedding precomputed (keputusan A)

**Tujuan:** menjalankan matriks eksperimen pada korpus yang cukup besar sehingga metrik tidak jenuh, **tanpa** mengunduh model ONNX dan tanpa beban embedding di perangkat pengunjung.

- Script offline (`build_grid.py`) meng-embed chunk dan query tiap konfigurasi dengan **model referensi** dan menyimpannya sebagai file biner + manifest.
- **Penyimpanan:** default fp16 di disk (setengah ukuran fp32), didecode ke `Float32Array` saat load. Selisih metrik fp16 vs fp32 diverifikasi di M2 dan dicatat. Contoh ukuran (aritmatika): 5.000 vektor × 384 dim ≈ 7,7 MB (fp32) / 3,8 MB (fp16); satu pack 10.000 passage ≈ 7,7 MB (fp16).
- **Per konfigurasi satu file**, dimuat *lazy* hanya untuk konfigurasi yang dipilih, tiap file < 25 MiB (batas aset Pages).
- **Manifest** mengikat grid pada: id model, revisi, dtype, prefix, parameter chunker, versi pack, dan hash isi. Grid tidak boleh dicampur dengan vektor dari model/konfigurasi lain.
- Pencarian dense berupa brute-force cosine di browser; estimasi < 15 ms untuk 2.000–5.000 vektor (**diukur di M0/M2**).
- **Yang diukur live:** kualitas retrieval dan latensi pencarian. **Yang berasal dari referensi:** `embed_ms` dan waktu muat model, ditampilkan berlabel "referensi".
- **Embedding live** dibatasi untuk dokumen unggahan atau konfigurasi kustom di luar grid, dengan cap 100–150 chunk dan label model yang dipakai.
- **Query bebas (v1):** pada mode grid, dense/hybrid hanya memakai query bawaan pack (vektor precomputed). Query yang diketik pengunjung hanya dijalankan dengan BM25 tanpa model. Unduhan model Full untuk query dense bebas bersifat opsional dan opt-in.
- **Paritas embedding:** vektor grid dibuat dengan artefak ONNX yang sama (`model_quantized.onnx`), tokenizer, prefix, pooling, dan normalisasi seperti di browser. Cek paritas (cosine antara embedding Python dan Transformers.js pada sampel teks) menjadi bagian M2.

## 7. Metodologi pengukuran

**Relevansi chunk berbasis span.** Karena chunk berbeda tiap strategi, relevansi tidak bisa memakai ID tetap. Aturan: chunk `c` relevan terhadap gold span `g` bila `overlap(c, g) ≥ τ × min(|c|, |g|)`, default `τ = 0.5` (parameter, dicantumkan di hasil).

**Metrik kualitas** (K ∈ {1, 3, 5, 10}), dihitung per query lalu dirata-rata:
- `Precision@K` = relevan di top-K / K
- `Recall@K` = gold span yang tercakup di top-K / total gold span
- `MRR@K` = 1 / peringkat chunk relevan pertama
- `nDCG@K` dengan relevansi biner
- `Hit@K` dan **`Tokens@K`** (total token konteks yang dikembalikan). Tokens@K wajib karena chunk kecil mudah menaikkan Precision@K tetapi memberi konteks lebih sedikit.

**Metrik biaya**
- `chunk_ms` (untuk semantic: `semantic_chunk_ms` terpisah), `embed_ms`, `tokenize_ms` / `stem_ms` / `bm25_index_ms` (waktu indexing)
- `query_ms` p50/p95 atas N pengulangan (N tetap), dilaporkan **terpisah**: embedding query vs pencarian murni
- **Metodologi waktu:** buang run warm-up (JIT/cache), ukur beberapa operasi sekaligus lalu bagi (amortized) karena resolusi `performance.now()` di halaman non-isolated dibulatkan oleh browser (perlu dikonfirmasi di M0), dan laporkan median + p95, bukan rata-rata tunggal.
- `index_bytes` **dihitung** (mis. `n_chunks × dim × 4` untuk vektor + estimasi postings BM25): konsisten lintas browser
- `heap_delta` **opsional**, hanya bila browser mendukung dan halaman *cross-origin isolated*; selalu diberi label sumber pengukuran
- **Cross-origin isolation (COOP/COEP) bukan default.** Mode `require-corp` hanya meloloskan resource lintas origin yang memberi izin eksplisit (CORP atau CORS yang valid); karena itu pemuatan model dari CDN harus diuji di M0. Isolation juga memungkinkan WASM multithread (potensi percepatan fallback), sehingga keputusan mengaktifkannya didasarkan pada hasil spike, bukan pada kebutuhan memory API.

**Kejujuran statistik**
- Rata-rata dengan **95% bootstrap CI** atas query. Bila jumlah query kecil, tampilkan peringatan daya statistik rendah.
- Tiap konfigurasi menampilkan error bar 95% CI. **Untuk membandingkan dua konfigurasi**, UI menampilkan **distribusi Δ per query** (Δᵢ = Metrik_A(qᵢ) − Metrik_B(qᵢ)) dan Δ rata-rata dengan *paired bootstrap CI* (resample query yang sama, hitung selisih per resample); ditandai signifikan bila rentang CI **tidak mencakup 0**. Alasan: kedua konfigurasi dinilai pada query yang sama, sehingga CI selisih berpasangan lebih sempit; aturan "CI tidak tumpang tindih" terlalu konservatif dan bisa melewatkan perbedaan nyata. Uji Wilcoxon/paired t-test dicadangkan untuk naskah skripsi, bukan UI.
- Hasil berbeda antar perangkat (WebGPU vs WASM bisa memberi embedding sedikit berbeda) → toleransi dicatat, tidak disembunyikan.

## 8. Arsitektur

```
Cloudflare Pages (static)
 ├─ UI (Vite + TypeScript, vanilla) ── charts (uPlot / canvas)
 ├─ Web Worker "engine"
 │    ├─ chunkers/        fixed · recursive · sentence · semantic · structure
 │    ├─ retrievers/      bm25 (+ id tokenizer/stemmer) · dense · hybrid (RRF)
 │    ├─ metrics/         P@K · R@K · MRR · nDCG · Tokens@K · bootstrap CI
 │    └─ runner/          experiment matrix, timing, seeded repeatability
 ├─ data/                 packs (JSON) + grid/ (vektor fp16 biner + manifest, tiap file < 25 MiB) + reference-results.json
 └─ model files           dimuat dari Hugging Face Hub (bukan dari Pages)
```

- Satu paket modul `engine` tanpa dependensi DOM, sehingga bisa diuji di Node/Bun dan dipakai juga oleh script benchmark referensi.
- Tidak ada state server. Semua persisten ada di Cache API/IndexedDB milik pengunjung.

## 9. Data pipeline (offline)

`scripts/build_chunking_pack.py` (Python):
1. Filter shard korpus MIRACL berdasarkan `article_id` yang memuat gold passage (tanpa mengunduh seluruh korpus), tambah artikel distraktor dari shard yang sama.
2. Rekonstruksi dokumen dari passage; **catat offset absolut saat penggabungan** (tanpa pencarian substring).
3. Output: `pack.json` (dokumen, query, gold span), versi dan seed tercatat.
4. **Validasi biner:** `assert doc[start:end] == gold_passage_text` untuk setiap gold span sebelum ekspor; query tanpa gold atau gagal assert dibuang dan dihitung di metadata. Pack tidak diekspor bila ada pelanggaran tak terduga.
- Lisensi dan atribusi dataset dicantumkan di UI dan README. Lisensi tiap pack diverifikasi sebelum rilis.

**Pipeline offline lengkap**

| Script | Fungsi |
|---|---|
| `build_nano_pack.py` | NanoMIRACL `id` → retrieval pack (passage apa adanya, qrels) |
| `build_chunking_pack.py` | Chunking pack (dokumen kontigu, gold span, `assert` validasi) |
| `build_grid.py` | Embed chunk + query dengan model referensi → biner fp16 + manifest |
| `prune_vocab.py` | Vocab-pruning `multilingual-e5-small` untuk model demo ID+EN |
| `bench_reference.ts` | Run referensi di mesin tetap → `reference-results.json` |

## 10. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Responsif | UI tidak freeze selama run (semua kerja berat di Worker) |
| NFR-2 | Waktu run | **Belum ditetapkan.** Ditentukan dari spike M0; sample pack disesuaikan agar *Quick* selesai dalam waktu wajar di laptop kelas menengah |
| NFR-3 | Reproducibility | Konfigurasi + seed sama → metrik kualitas sama (kecuali selisih numerik embedding antar backend, dicatat) |
| NFR-4 | Privasi | File unggahan tidak dikirim ke server mana pun; ditulis jelas di UI |
| NFR-5 | Aksesibilitas | Fallback jelas bila WebGPU/Worker tidak tersedia; chart punya tabel data setara |
| NFR-6 | Korektness | Metrik teruji terhadap fixture hitung-tangan; BM25 dibandingkan dengan implementasi referensi (paritas peringkat pada fixture) |

## 11. Success Metrics

- Seluruh unit test metrik dan chunker lulus; paritas BM25 terhadap implementasi referensi pada fixture.
- Run *Quick* pada `miracl-id` selesai end-to-end di browser, hasilnya identik antara dua kali run.
- Reference results dipublikasikan **dengan spesifikasi mesin dan versi library**.
- Query inspector menunjukkan minimal satu contoh nyata di mana batas chunk memotong bukti (bahan README).
- Pengunjung baru melihat hasil bermakna < 5 detik (dari reference results), tanpa mengunduh model.

## 12. Milestone

0. **M0 – Spike (de-risk):** kecepatan embedding (WebGPU vs WASM, batch, dengan/tanpa multithread), throughput embedding kalimat untuk menetapkan `max_sentences`, waktu stemming Sastrawi per 10.000 token dengan/tanpa cache, perilaku unduhan terputus, kompatibilitas COOP/COEP dengan pemuatan model dari HF CDN, ukuran sample pack nyata.
1. **M1 – Data & model:** `build_nano_pack.py` dan `build_chunking_pack.py` (validasi `assert`, pecah dokumen pada gap), verifikasi format docid, kontinuitas passage, dan ukuran NanoMIRACL aktual, lisensi data; `prune_vocab.py` (korpus pruning di luar artikel eksperimen, `min_count = 2`) dan ukur selisih kualitasnya.
2. **M2 – Engine:** chunker, BM25 (+ stemming), dense, hybrid, metrik, bootstrap CI + unit test + fixture.
3. **M3 – Runner & UI hasil:** `build_grid.py` + loader grid (biner + manifest), matriks eksperimen di atas grid, tabel/heatmap/chart, distribusi Δ, reference results, export.
4. **M4 – Upload & labeling:** viewer dokumen, pemilihan gold span, peringatan sampel kecil.
5. **M5 – Insight:** query inspector, rank diff, ablation, permalink.
6. **M6 – Referensi & dokumentasi:** run referensi di mesin riset sendiri, halaman metodologi, README. *(Opsional: generator query sintetis via `guard`.)*

## 13. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Unduhan model besar (±135 MB untuk Full) | Unduhan putus, pengunjung pergi | Landing = reference results, model demo ringan sebagai default, opt-in dengan ukuran nyata, retry |
| Embedding lambat di WASM | Run terlalu lama | Sample pack kecil, cache embedding, progress UI, WebGPU bila ada |
| COOP/COEP memblokir resource lintas origin tanpa izin | Model/tokenizer gagal dimuat | Tidak diaktifkan default; `index_bytes` terhitung = metrik utama; diuji di M0 |
| Semantic chunking menghasilkan potongan sangat kecil | Hasil menyesatkan | `min_tokens` wajib, tampilkan distribusi ukuran chunk |
| Semantic chunking terlalu mahal (dua lintasan embedding) | Tab lag, run sangat lama | Opt-in, `max_sentences`, batch, cache, biaya dilaporkan terpisah |
| Stemming Sastrawi lambat | Indexing BM25 lebih lama daripada dense | Stem per unique word + cache, di Worker, waktu `stem_ms` terpisah |
| Rekonstruksi MIRACL salah offset / teks berbeda tipis | Ground truth rusak | Offset dicatat saat join, teks verbatim, `assert` biner, query gagal dibuang |
| Grid tidak cocok dengan model/konfigurasi yang dipakai | Hasil tidak valid | Manifest + hash, loader menolak ketidakcocokan |
| Presisi fp16 mengubah peringkat | Metrik sedikit bergeser | Verifikasi selisih vs fp32 di M2; fallback fp32 |
| Query sedikit di mode upload | Kesimpulan tidak valid | Peringatan, CI lebar ditampilkan, minimal 5 query |
| Lisensi dataset/model | Hambatan publikasi | Verifikasi di M1, atribusi di UI |
| Hasil bergantung perangkat | Perbandingan lintas orang tidak adil | Label perangkat di setiap hasil, reference results dari satu mesin |

## 14. Sumber riset

- Transformers.js v4.x dengan backend WebGPU baru: https://github.com/huggingface/transformers.js/releases
- Panduan WebGPU Transformers.js: https://huggingface.co/docs/transformers.js/guides/webgpu
- Model ONNX multilingual-e5-small untuk Transformers.js: https://huggingface.co/Xenova/multilingual-e5-small
- RRF dan hybrid retrieval (Elastic Search Labs): https://www.elastic.co/search-labs/blog/improving-information-retrieval-elastic-stack-hybrid
- Fusi hybrid (rank vs normalisasi skor): https://mixpeek.com/guides/hybrid-search-fusion-rrf-score-normalization
- Chunking: "Is Semantic Chunking Worth the Computational Cost?" https://www.arxiv.org/pdf/2410.13070
- Chunking: studi sistematis 36 strategi: https://arxiv.org/html/2603.06976v1
- Chunking: evaluasi pada dokumen enterprise oil & gas: https://arxiv.org/pdf/2603.24556
- Ringkasan benchmark chunking 2026 (sumber sekunder, baca dengan kritis): https://blog.premai.io/rag-chunking-strategies-the-2026-benchmark-guide
- MIRACL (repo dan statistik korpus): https://github.com/project-miracl/miracl
- MIRACL topics & qrels: https://huggingface.co/datasets/miracl/miracl
- NanoMIRACL (split Indonesia): https://hakari-bench-leaderboard.hf.space/docs/benchmark-tasks/NanoMIRACL/id
- Pengukuran memori halaman (`measureUserAgentSpecificMemory`, butuh cross-origin isolation): https://web.dev/articles/monitor-total-page-memory-usage
- Batas Cloudflare Pages (25 MiB per aset): https://developers.cloudflare.com/pages/platform/limits
- Sastrawi (stemmer Indonesia, JS): https://npmjs.com/~damzaky
- Ukuran file ONNX multilingual-e5-small: https://huggingface.co/Xenova/multilingual-e5-small/tree/97cb8f96eaed1a1f0dac821239943e854fce9c36/onnx
- Contoh vocab-pruning e5-small (EN+FR, ±30 MB): https://huggingface.co/rolf-mozilla/multilingual-e5-small-enfr-pruned-q8
- Varian ONNX `e5-small-v2` (int8 ±34 MB): https://huggingface.co/Xenova/e5-small-v2/tree/main/onnx
- MiniSearch (alasan tidak dipakai: tanpa stemmer/stopword per-locale): https://github.com/lucaong/minisearch/blob/master/DESIGN_DOCUMENT.md

## 15. Keputusan & Open Questions

### 15.1 Keputusan terkunci

| Topik | Keputusan | Status verifikasi |
|---|---|---|
| **A. Grid precomputed** | Korpus besar dijalankan lewat vektor precomputed (§6.7); embedding live hanya untuk upload/kustom | Terkunci. Ukuran dan latensi dihitung/diukur di M0 dan M2 |
| **B. Dataset** | NanoMIRACL `id` untuk retrieval-only; custom chunking pack dari artikel MIRACL berisi gold passage + distraktor satu shard | Terkunci. Ukuran NanoMIRACL aktual, `docid`, dan gap diverifikasi di M1 |
| Gap passage | Dokumen dipecah pada diskontinuitas | Terkunci (berlaku bila gap terbukti ada) |
| Panjang input model | Token inspector + peringatan merah bila chunk > `max_len` | Terkunci. `max_len` tiap model diverifikasi di M0 |
| Signifikansi | Distribusi Δ per query + paired bootstrap CI; signifikan bila CI tidak mencakup 0; uji Wilcoxon untuk skripsi | Terkunci |
| Vocab-pruning | Keep-set dari sampel acak ID/EN di luar artikel eksperimen, `min_count = 2`, target ±35 MB | Terkunci. Ukuran akhir dan kualitas diukur di M1 |
| Timer | Abaikan run pertama (cold start/JIT), batch N operasi, hitung rata-rata per-operasi per batch; median dan p95 dihitung lintas batch | Terkunci |
| Live embedding | Maks 100–150 chunk per run | Estimasi kecepatan, diukur ulang di M0 |
| `docid` MIRACL | `{article_id}#{passage_index}`, composite text, separator `\n\n`, offset saat join | Diverifikasi di M1 |
| Stemmer | Port Sastrawi JS + stopword filter + cache `Map` | Estimasi performa diukur di M0 |
| Demo EN | `all-MiniLM-L6-v2` int8 | Ukuran dan `max_len` diverifikasi di M0 |

### 15.2 Open Questions

1. ~~Query bebas pada mode grid~~ — **terkunci:** opsi (a) di v1 (query bawaan pack untuk dense/hybrid, query ketikan hanya BM25), opsi (b) unduhan model Full sebagai tambahan opt-in.
2. **Lisensi data.** Kartu dataset MIRACL mencantumkan Apache-2.0, tetapi teks Wikipedia di dalamnya CC BY-SA. Pack membutuhkan atribusi dan kemungkinan share-alike; tentukan lisensi data pack terpisah dari kode dan verifikasi sebelum rilis.
3. **Presisi penyimpanan vektor.** Konfirmasi fp16 cukup (selisih metrik vs fp32 dalam toleransi) di M2.
4. **Referensi tetap.** Satu mesin dan satu browser untuk run referensi; spesifikasi dan versi library dicatat agar angka antar-versi lab bisa dibandingkan.

## 16. Deliverables Portfolio

- Demo live di `rag.hutamalabs.dev` dengan hasil referensi instan.
- Repo publik + README: arsitektur, metodologi (relevansi berbasis span, Tokens@K, CI), hasil referensi bersama spesifikasi mesin.
- Halaman "Methodology" yang menjelaskan keputusan dan keterbatasan (retrieval saja, performa bergantung perangkat).
