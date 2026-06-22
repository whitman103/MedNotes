import gzip
import hashlib
import os
import shutil
from pathlib import Path


def _default_data_dir() -> Path:
    package_root = Path(__file__).resolve().parents[1]
    parent = package_root.parent
    if parent.name == "backend":
        return parent.parent / "data"
    return parent / "data"


DATA_DIR = Path(os.environ.get("MEDNOTES_DATA_DIR", _default_data_dir()))


def write_gzipped_asset(data: bytes, category: str) -> tuple[str, int]:
    content_hash = hashlib.sha256(data).hexdigest()
    relative_path = (
        f"{category}/{content_hash[:2]}/{content_hash[2:4]}/{content_hash}.gz"
    )
    full_path = DATA_DIR / relative_path
    full_path.parent.mkdir(parents=True, exist_ok=True)

    if not full_path.exists():
        full_path.write_bytes(gzip.compress(data))

    return relative_path, full_path.stat().st_size


def read_gzipped_asset(relative_path: str) -> bytes:
    full_path = DATA_DIR / relative_path
    return gzip.decompress(full_path.read_bytes())


def delete_gzipped_asset(relative_path: str) -> None:
    full_path = DATA_DIR / relative_path
    if not full_path.exists():
        return

    full_path.unlink()
    parent = full_path.parent
    while parent != DATA_DIR and parent.exists() and not any(parent.iterdir()):
        parent.rmdir()
        parent = parent.parent


def clear_asset_storage() -> None:
    for category in ("assets", "photos", "volumes"):
        category_dir = DATA_DIR / category
        if category_dir.exists():
            shutil.rmtree(category_dir)
