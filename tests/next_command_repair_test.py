from __future__ import annotations

import argparse
import contextlib
import io
import json
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools" / "codex"))

import codex_skillset_generator as generator  # noqa: E402


def write_manifest(root: Path, items: list[dict[str, object]]) -> None:
    planning = root / "docs" / "planning"
    planning.mkdir(parents=True)
    (planning / "wbs-manifest.json").write_text(
        json.dumps({"version": "test", "items": items}, indent=2),
        encoding="utf-8",
    )


def run_next_command(root: Path) -> tuple[int, str]:
    out = io.StringIO()
    args = argparse.Namespace(config=str(ROOT / "codex-profile.json"), root=str(root), wbs_id=None)
    with contextlib.redirect_stdout(out):
        code = generator.cmd_generate_next_command(args)
    return code, out.getvalue()


def test_all_done_manifest_returns_completed_noop() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        write_manifest(
            root,
            [
                {"id": "WBS-00", "title": "Done zero", "status": "done"},
                {"id": "WBS-01", "title": "Done one", "status": "done"},
            ],
        )

        code, output = run_next_command(root)

    assert code == 0
    assert "All WBS items are complete. No remaining generated command." in output
    assert "create a new WBS item or phase" in output
    assert "### WBS-00" not in output


def test_pending_manifest_still_returns_next_actionable_item() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        write_manifest(
            root,
            [
                {"id": "WBS-00", "title": "Done zero", "status": "done"},
                {
                    "id": "WBS-01",
                    "title": "Pending one",
                    "status": "todo",
                    "suggested_skills": ["evidence-pack"],
                    "target_files": ["PLANS.md"],
                    "validation_commands": ["python -S tools/codex/validate_dev_flow.py --root ."],
                    "workstream": "evidence-pack",
                    "module_path": ".",
                    "rollback": "Revert this test slice.",
                },
            ],
        )

        code, output = run_next_command(root)

    assert code == 0
    assert "### WBS-01 — Pending one" in output
    assert "### WBS-00" not in output


if __name__ == "__main__":
    test_all_done_manifest_returns_completed_noop()
    test_pending_manifest_still_returns_next_actionable_item()
