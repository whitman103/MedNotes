from mednotes.db import Base, IntPK
from sqlalchemy.orm import Mapped, mapped_column, Session
from sqlalchemy import ForeignKey, select


class Asset(Base):
    __tablename__ = "Asset"

    asset_id: Mapped[IntPK]
    asset_path: Mapped[str]
    size: Mapped[int]
    compressed: Mapped[bool]
    type: Mapped[str]

    @classmethod
    def list(cls, sess: Session) -> list["Asset"]:
        query = select(Asset)

        return list(sess.execute(query).scalars())

    __mapper_args__ = {"polymorphic_identity": "Asset", "polymorphic_on": "type"}


class PhotoAsset(Asset):
    __tablename__ = "PhotoAsset"
    asset_id: Mapped[IntPK] = mapped_column(
        ForeignKey("Asset.asset_id", primary_key=True)
    )
    format: Mapped[str]

    __mapper_args__ = {"polymorphic_identity": "PhotoAsset"}
