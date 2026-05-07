from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools" / "codex"))

import codex_skillset_generator as generator  # noqa: E402


def test_command_queue_still_contains_generated_wbs_commands() -> None:
    profile = generator.normalize_profile(generator.read_json(str(ROOT / "codex-profile.json")))
    queue = generator.render_command_queue(profile)

    assert "### WBS-00 — Confirm scope, secret boundary, and clean-room constraints" in queue
    assert "### WBS-11 — Prepare evidence pack and next-session handoff" in queue
    assert "Validation commands:" in queue


if __name__ == "__main__":
    test_command_queue_still_contains_generated_wbs_commands()
