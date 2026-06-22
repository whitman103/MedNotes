from pydantic import BaseModel, ConfigDict


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


class VolumeAssetGet(AssetGet):
    pass
