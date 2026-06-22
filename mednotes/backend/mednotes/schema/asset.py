from pydantic import BaseModel, ConfigDict
from typing import Optional

from mednotes.db.enums import Topic


class AssetGet(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    asset_id: int
    asset_path: str
    size: int
    compressed: bool
    type: str
    description: str


class PhotoAssetGet(AssetGet):
    format: str
    topic: Optional[list[Topic]] = None


class VolumeAssetGet(AssetGet):
    pass
