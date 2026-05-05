from __future__ import annotations

import sys
from pathlib import Path

CURRENT = Path(__file__).resolve()
CODEX_DIR = CURRENT.parent
if str(CODEX_DIR) not in sys.path:
    sys.path.insert(0, str(CODEX_DIR))

import codex_skillset_generator as generator  # noqa: E402

if __name__ == "__main__":
    sys.argv = [str(CURRENT), "validate-dev-flow", *sys.argv[1:]]
    raise SystemExit(generator.main())
