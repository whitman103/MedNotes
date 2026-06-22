import json
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session
from mednotes.db.connection import get_session
from mednotes.db.asset import Asset, PhotoAsset, VolumeAsset
from mednotes.db.enums import Topic
from mednotes.schema.asset import AssetGet, PhotoAssetGet, VolumeAssetGet
from mednotes.storage.assets import read_gzipped_asset

router = APIRouter()

PHOTO_MEDIA_TYPES = {
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
    "gif": "image/gif",
}


def parse_topics(topic: str) -> list[Topic]:
    if not topic:
        return []
    values = json.loads(topic)
    return [Topic(value) for value in values]


@router.get("/list-assets", response_model=list[AssetGet], status_code=200)
def list_assets(sess: Session = Depends(get_session)) -> list[Asset]:
    return Asset.list(sess)


@router.get("/search/photos", response_model=list[PhotoAssetGet], status_code=200)
def search_photos(
    description: str = "",
    topic: Optional[list[str]] = Query(None),
    sess: Session = Depends(get_session),
) -> list[PhotoAsset]:
    topics = [Topic(value) for value in topic] if topic else None
    return PhotoAsset.search(
        sess,
        description=description or None,
        topic=topics,
    )


@router.get("/photo/{asset_id}")
def get_photo_asset(asset_id: int, sess: Session = Depends(get_session)) -> Response:
    photo = sess.get(PhotoAsset, asset_id)
    if photo is None:
        raise HTTPException(status_code=404, detail="Photo not found")

    try:
        data = read_gzipped_asset(photo.asset_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Photo file not found")

    media_type = PHOTO_MEDIA_TYPES.get(photo.format.lower(), "application/octet-stream")
    return Response(content=data, media_type=media_type)


@router.delete("/photo/{asset_id}", status_code=204)
def delete_photo_asset(asset_id: int, sess: Session = Depends(get_session)) -> None:
    try:
        Asset.delete(sess, asset_id)
    except LookupError:
        raise HTTPException(status_code=404, detail="Photo not found")


@router.delete("/{asset_id}", status_code=204)
def delete_asset(asset_id: int, sess: Session = Depends(get_session)) -> None:
    try:
        Asset.delete(sess, asset_id)
    except LookupError:
        raise HTTPException(status_code=404, detail="Asset not found")


@router.post("/create-asset", response_model=AssetGet, status_code=201)
async def create_asset(
    file: UploadFile = File(...),
    description: str = Form(""),
    sess: Session = Depends(get_session),
) -> Asset:
    data = await file.read()
    return Asset.create(sess, data, description=description)


@router.post("/create-photo-asset", response_model=PhotoAssetGet, status_code=201)
async def create_photo_asset(
    file: UploadFile = File(...),
    format: str = Form(...),
    description: str = Form(""),
    topic: str = Form("[]"),
    sess: Session = Depends(get_session),
) -> PhotoAsset:
    data = await file.read()
    try:
        return PhotoAsset.create(
            sess,
            data,
            format=format,
            description=description,
            topic=parse_topics(topic) or None,
        )
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Invalid topic values") from exc


@router.post("/create-volume-asset", response_model=VolumeAssetGet, status_code=201)
async def create_volume_asset(
    file: UploadFile = File(...),
    description: str = Form(""),
    sess: Session = Depends(get_session),
) -> VolumeAsset:
    data = await file.read()
    return VolumeAsset.create(sess, data, description=description)
