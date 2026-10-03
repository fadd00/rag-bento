"""Build a retrieval-only fixture pack. Network ingestion is intentionally separate."""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def build_pack(rows: list[dict[str, object]]) -> dict[str, object]:
    passages = []
    for row in rows:
        if not isinstance(row.get("text"), str) or not row["text"]:
            continue
        passages.append({"passage_id": str(row["passage_id"]), "text": row["text"]})
    return {"version": 1, "dataset": "nano-miracl-id", "passages": passages, "dropped": len(rows) - len(passages)}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    rows = [{"passage_id": "fixture-0", "text": "teks retrieval kecil"}, {"passage_id": "fixture-1", "text": "teks kedua"}]
    if args.input and not args.dry_run:
        rows = json.loads(args.input.read_text())
    result = build_pack(rows)
    rendered = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.write_text(rendered)
    else:
        print(rendered, end="")

if __name__ == "__main__":
    main()
