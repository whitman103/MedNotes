from sqlalchemy import select
from sqlalchemy.orm import Session

from mednotes.db.asset import PhotoAsset


def attach_photos(sess: Session, entity, asset_ids: list[int] | None) -> None:
    if not asset_ids:
        return

    unique_ids = list(dict.fromkeys(asset_ids))
    photos = list(
        sess.execute(
            select(PhotoAsset).where(PhotoAsset.asset_id.in_(unique_ids))
        ).scalars()
    )
    if len(photos) != len(unique_ids):
        raise ValueError("One or more photo assets not found")

    entity.photo_assets = photos
