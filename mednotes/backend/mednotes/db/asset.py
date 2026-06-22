from mednotes.db import Base, IntPK
from mednotes.db.associations import note_photo_link, question_photo_link
from mednotes.db.enums import Topic
from sqlalchemy.orm import Mapped, mapped_column, Session, relationship
from sqlalchemy import ForeignKey, select
from typing import Optional, TYPE_CHECKING
import sqlalchemy.dialects.postgresql as pg

from mednotes.storage.assets import write_gzipped_asset, delete_gzipped_asset

if TYPE_CHECKING:
    from mednotes.db.ml import Note, Question

topic_enum = pg.ENUM(Topic, name="topic_enum", create_type=False)


class Asset(Base):
    __tablename__ = "Asset"

    asset_id: Mapped[IntPK]
    asset_path: Mapped[str]
    size: Mapped[int]
    compressed: Mapped[bool]
    type: Mapped[str]
    description: Mapped[Optional[str]] = mapped_column(default="")

    @classmethod
    def list(cls, sess: Session) -> list["Asset"]:
        query = select(Asset)

        return list(sess.execute(query).scalars())

    @classmethod
    def create(cls, sess: Session, data: bytes, description: str = "") -> "Asset":
        asset_path, size = write_gzipped_asset(data, "assets")
        new_asset = cls(
            asset_path=asset_path,
            size=size,
            compressed=True,
            description=description,
        )
        sess.add(new_asset)
        sess.flush()

        return new_asset

    @classmethod
    def delete(cls, sess: Session, asset_id: int) -> None:
        asset = sess.get(Asset, asset_id)
        if asset is None:
            raise LookupError(f"Asset {asset_id} not found")

        asset_path = asset.asset_path
        other_asset = sess.execute(
            select(Asset.asset_id).where(
                Asset.asset_path == asset_path,
                Asset.asset_id != asset_id,
            )
        ).first()
        sess.delete(asset)
        sess.flush()

        if other_asset is None:
            delete_gzipped_asset(asset_path)

    __mapper_args__ = {"polymorphic_identity": "Asset", "polymorphic_on": "type"}


class PhotoAsset(Asset):
    __tablename__ = "PhotoAsset"
    asset_id: Mapped[IntPK] = mapped_column(
        ForeignKey("Asset.asset_id"),primary_key=True)
    format: Mapped[str]
    topic: Mapped[Optional[list[Topic]]] = mapped_column(pg.ARRAY(topic_enum))
    notes: Mapped[list["Note"]] = relationship(
        secondary=note_photo_link,
        back_populates="photo_assets",
    )
    questions: Mapped[list["Question"]] = relationship(
        secondary=question_photo_link,
        back_populates="photo_assets",
    )

    @classmethod
    def create(
        cls,
        sess: Session,
        data: bytes,
        format: str,
        description: str = "",
        topic: Optional[list[Topic]] = None,
    ) -> "PhotoAsset":
        asset_path, size = write_gzipped_asset(data, "photos")
        new_asset = cls(
            asset_path=asset_path,
            size=size,
            compressed=True,
            description=description,
            format=format,
            topic=topic,
        )
        sess.add(new_asset)
        sess.flush()
        return new_asset

    @classmethod
    def search(
        cls,
        sess: Session,
        description: Optional[str] = None,
        topic: Optional[list[Topic]] = None,
    ) -> list["PhotoAsset"]:
        query = select(PhotoAsset)
        if description:
            query = query.where(PhotoAsset.description.ilike(f"%{description}%"))
        if topic:
            query = query.where(PhotoAsset.topic.overlap(topic))
        return list(sess.execute(query).scalars())

    __mapper_args__ = {"polymorphic_identity": "PhotoAsset"}


class VolumeAsset(Asset):
    __tablename__ = "VolumeAsset"
    asset_id: Mapped[IntPK] = mapped_column(
        ForeignKey("Asset.asset_id"),primary_key=True
    )

    @classmethod
    def create(cls, sess: Session, data: bytes, description: str = "") -> "VolumeAsset":
        asset_path, size = write_gzipped_asset(data, "volumes")
        new_asset = cls(
            asset_path=asset_path,
            size=size,
            compressed=True,
            description=description,
        )
        sess.add(new_asset)
        sess.flush()
        return new_asset

    __mapper_args__ = {"polymorphic_identity": "VolumeAsset"}
