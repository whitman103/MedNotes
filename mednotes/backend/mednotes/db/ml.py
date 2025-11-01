from mednotes.db import IntPK, Base
from pgvector.sqlalchemy import Vector
from sqlalchemy.orm import Mapped, mapped_column, Session
from sqlalchemy import select, Enum as SAEnum
from typing import Optional
from mednotes.db.enums import Topic


topic_enum = SAEnum(Topic, name="topic_enum", native_enum=True)


class Note(Base):
    __tablename__ = "Note"

    note_id: Mapped[IntPK]
    embedding = mapped_column(Vector(768))
    text: Mapped[str]
    topic: Mapped[Optional[list[Topic]]] = mapped_column(topic_enum)

    @classmethod
    def search(
        cls,
        sess: Session,
        to_search: list[float],
        topic: Optional[str] = None,
        result_num: int = 5,
    ) -> list["Note"]:
        if topic is None:
            query = (
                select(Note)
                .order_by(Note.embedding.cosine_distance(to_search))
                .limit(result_num)
            )
        else:
            query = (
                select(Note)
                .filter(
                    Note.embedding.cosine_distance(to_search), Note.topic.any_(topic)
                )
                .limit(result_num)
            )
        return sess.execute(query).scalars()

    @classmethod
    def get_by_topic(cls, sess: Session, topic: str) -> list["Note"]:
        query = select(Note).where(Note.topic.any_(topic))
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

    @classmethod
    def delete(cls, sess: Session, id: int) -> None:
        query = select(Note).filter(Note.note_id == id)
        to_delete = sess.execute(query).scalar_one_or_none()
        if not to_delete:
            raise ValueError("Note cannot be deleted. Problem with database tables.")
        sess.delete(to_delete)
        sess.flush()
        return None


class Question(Base):
    __tablename__ = "Question"

    question_id: Mapped[IntPK]
    embedding = mapped_column(Vector(768))
    question_text: Mapped[str]
    question_answer: Mapped[str]
    topic: Mapped[Optional[list[Topic]]] = mapped_column(topic_enum)

    @classmethod
    def insert(
        cls,
        sess: Session,
        embedding: list[float],
        text: str,
        answer: str,
        topic: Optional[str] = None,
    ) -> "Question":
        new_question = cls(
            embedding=embedding, question_text=text, question_answer=answer, topic=topic
        )
        sess.add(new_question)
        sess.flush()
        return new_question

    @classmethod
    def get_by_topic(cls, sess: Session, topic: str) -> list["Question"]:
        stmt = select(Question).where(Question.topic.any_(topic))
        return sess.execute(stmt).scalars()

    @classmethod
    def delete(cls, sess: Session, question_id: int) -> None:
        stmt = select(Question).where(question_id == Question.question_id)
        to_delete = sess.execute(stmt).scalar_one_or_none()
        if not to_delete:
            raise ValueError(
                "Question can't be deleted. Something is wrong with database."
            )
        sess.delete(to_delete)
        sess.flush()
        return None

    @classmethod
    def search(
        cls,
        sess: Session,
        to_search: list[float],
        topic: Optional[str] = None,
        result_num: int = 5,
    ) -> list["Question"]:
        if topic is None:
            query = (
                select(Question)
                .order_by(Question.embedding.cosine_distance(to_search))
                .limit(result_num)
            )
        else:
            query = (
                select(Question)
                .filter(
                    Question.embedding.cosine_distance(to_search),
                    Question.topic.any_(topic),
                )
                .limit(result_num)
            )
        return sess.execute(query).scalars()
