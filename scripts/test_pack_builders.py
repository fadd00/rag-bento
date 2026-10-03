import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).parent


def load(name: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / f"{name}.py")
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def test_chunking_splits_gap_and_preserves_offsets():
    module = load("build_chunking_pack")
    passages = [
        module.Passage(7, 0, "ulang"),
        module.Passage(7, 1, "ulang"),
        module.Passage(7, 3, "target ulang"),
    ]
    documents = module.build_documents(passages)
    assert len(documents) == 2
    first = documents[0]
    assert first["text"] == "ulang\n\nulang"
    for span in first["gold_spans"]:
        assert first["text"][span["start"] : span["end"]] == span["text"]


def test_nano_fixture_drops_invalid_text():
    module = load("build_nano_pack")
    result = module.build_pack([{"passage_id": "a", "text": "ok"}, {"passage_id": "b", "text": ""}])
    assert result["dropped"] == 1
    assert len(result["passages"]) == 1
