from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools" / "codex"))

import codex_skillset_generator as generator  # noqa: E402


def test_generated_manifest_still_has_todo_items_for_new_profiles() -> None:
    profile = generator.normalize_profile(generator.read_json(str(ROOT / "codex-profile.json")))
    manifest = json.loads(generator.render_wbs_manifest(profile))
    items = manifest["items"]

    assert items[0]["id"] == "WBS-00"
    assert items[-1]["id"] == "WBS-11"
    assert all(item["status"] == "todo" for item in items)
    assert generator._next_actionable_wbs_item(items)["id"] == "WBS-00"


if __name__ == "__main__":
    test_generated_manifest_still_has_todo_items_for_new_profiles()
