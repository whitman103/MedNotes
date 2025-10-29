from mednotes.db import IntPK, Base
from pgvector.sqlalchemy import Vector
from sqlalchemy.orm import Mapped, mapped_column, Session
from sqlalchemy import select
from typing import Optional


class Note(Base):
    __tablename__ = "Note"

    note_id: Mapped[IntPK]
    embedding = mapped_column(Vector(768))
    text: Mapped[str]
    topic: Mapped[Optional[str]]

    @classmethod
    def search(
        cls, sess: Session, to_search: list[float], topic: Optional[str] = None
    ) -> list["Note"]:
        if topic is None:
            query = (
                select(Note)
                .order_by(Note.embedding.cosine_distance(to_search))
                .limit(5)
            )
        else:
            query = (
                select(Note)
                .filter(Note.embedding.cosine_distance(to_search), Note.topic == topic)
                .limit(5)
            )
        return sess.execute(query).scalars()

    @classmethod
    def get_by_topic(cls, sess: Session, topic: str) -> list["Note"]:
        query = select(Note).filter(Note.topic == topic)
        return sess.execute(query).scalars()

    @classmethod
    def insert(
        cls,
        sess: Session,
        embedding: list[float],
        text: str,
        topic: Optional[str] = None,
    ) -> "Note":
        new_note = cls(embedding=embedding, text=text, topic=topic)
        sess.add(new_note)
        sess.flush()
        return new_note
