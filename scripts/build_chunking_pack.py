"""Build a tiny chunking pack from passage records without network access."""
from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path

SEPARATOR = "\n\n"

@dataclass(frozen=True)
class Passage:
    article_id: int
    passage_index: int
    text: str


def contiguous_runs(passages: list[Passage]) -> list[list[Passage]]:
    ordered = sorted(passages, key=lambda item: (item.article_id, item.passage_index))
    runs: list[list[Passage]] = []
    for passage in ordered:
        if not runs or passage.article_id != runs[-1][-1].article_id or passage.passage_index != runs[-1][-1].passage_index + 1:
            runs.append([passage])
        else:
            runs[-1].append(passage)
    return runs


def build_documents(passages: list[Passage]) -> list[dict[str, object]]:
    documents: list[dict[str, object]] = []
    for document_index, run in enumerate(contiguous_runs(passages)):
        pieces: list[str] = []
        spans: list[dict[str, object]] = []
        offset = 0
        for passage in run:
            if pieces:
                offset += len(SEPARATOR)
            start = offset
            pieces.append(passage.text)
            offset += len(passage.text)
            span = {"article_id": passage.article_id, "passage_index": passage.passage_index, "start": start, "end": offset, "text": passage.text}
            assert "".join(pieces[i] if i == 0 else SEPARATOR + pieces[i] for i in range(len(pieces))) [start:offset] == passage.text
            spans.append(span)
        documents.append({"doc_id": f"doc-{document_index}", "text": SEPARATOR.join(pieces), "gold_spans": spans})
    return documents


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    passages = [Passage(1, 0, "ulang ulang"), Passage(1, 1, "teks kedua"), Passage(1, 3, "gap disengaja"), Passage(2, 0, "dokumen lain")]
    if args.input and not args.dry_run:
        payload = json.loads(args.input.read_text())
        passages = [Passage(int(item["article_id"]), int(item["passage_index"]), str(item["text"])) for item in payload]
    result = {"version": 1, "documents": build_documents(passages), "dropped_queries": 0}
    if args.output:
        args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    else:
        print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
