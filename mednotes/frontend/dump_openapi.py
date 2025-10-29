import sys
from typing import Any, Dict
import yaml
from fastapi.openapi.utils import get_openapi
from mednotes.api.app import app


app.openapi_version = "3.0.3"
openapi = get_openapi(
    title=app.title,
    version=app.version,
    openapi_version="3.0.3",
    description=app.description,
    routes=app.routes,
)


def patch_defaults(d: Dict[str, Any]) -> None:
    if d.get("type") == "object" and "properties" in d:
        defaulted = [
            k for k, v in d["properties"].items() if v.get("default") is not None
        ]
        if defaulted:
            required = d["required"] if "required" in d else []
            d["required"] = list(set(required + defaulted))


def visit(root: Any, callback: Any) -> None:
    if isinstance(root, dict):
        callback(root)
        for val in root.values():
            visit(val, callback)
    elif isinstance(root, list):
        for val in root:
            visit(val, callback)


visit(openapi, callback=patch_defaults)
yaml.dump(openapi, sys.stdout)
