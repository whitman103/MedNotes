from mednotes.db import IntPK, Base
from pgvector import Vector
from sqlalchemy.orm import Mapped, mapped_column


class Note(Base):
    __tablename__ = "Note"

    note_id: Mapped[IntPK]
    embedding: Mapped[Vector] = mapped_column(Vector(768))
    text: Mapped[str]
