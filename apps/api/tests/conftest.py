"""Pytest fixtures for isolated local sourcing job store tests."""

import json
import os
import tempfile
from pathlib import Path
from typing import Generator

import pytest


@pytest.fixture(autouse=True)
def isolated_store() -> Generator[Path, None, None]:
    """Provide an isolated local JSON store for each API test."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as tmp:
        store_path = Path(tmp.name)

    old_env = os.environ.get("AUTOMETA_JOB_STORE_PATH")
    os.environ["AUTOMETA_JOB_STORE_PATH"] = str(store_path)

    from app.main import reset_store_for_tests

    reset_store_for_tests(delete_file=True)

    try:
        yield store_path
    finally:
        reset_store_for_tests(delete_file=True)

        if old_env is not None:
            os.environ["AUTOMETA_JOB_STORE_PATH"] = old_env
        elif "AUTOMETA_JOB_STORE_PATH" in os.environ:
            del os.environ["AUTOMETA_JOB_STORE_PATH"]

        if store_path.exists():
            store_path.unlink()


@pytest.fixture
def verify_no_secrets(isolated_store: Path) -> Generator[None, None, None]:
    """Verify the persisted store does not contain secret-like fields."""
    yield

    if isolated_store.exists():
        try:
            with isolated_store.open(encoding="utf-8") as f:
                content = f.read()
                serialized = json.dumps(json.loads(content))

                forbidden_keys = [
                    "accessToken",
                    "authorization",
                    "browserStorage",
                    "credential",
                    "refreshToken",
                    "secret",
                    "password",
                    "cookie",
                    "cookies",
                    "session",
                    "sessionBoundary",
                    "sessionMaterial",
                    "sessionRef",
                    "token",
                ]

                for key in forbidden_keys:
                    assert key not in serialized, f"Persisted store contains forbidden key: {key}"
        except json.JSONDecodeError:
            pass
