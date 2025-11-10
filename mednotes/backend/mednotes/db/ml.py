from mednotes.db import IntPK, Base
from pgvector.sqlalchemy import Vector
from sqlalchemy.orm import Mapped, mapped_column, Session, relationship
from sqlalchemy import select, Enum as SAEnum, ForeignKey, DateTime
from typing import Optional
from mednotes.db.enums import Topic
import sqlalchemy.dialects.postgresql as pg
from mednotes.schema.ml import QuestionEdit, EmbeddedSentenceEdit
from sqlalchemy.ext.hybrid import hybrid_property
import datetime

topic_enum = SAEnum(Topic, name="topic_enum", native_enum=True)


class Note(Base):
    __tablename__ = "Note"

    note_id: Mapped[IntPK]
    embedding = mapped_column(Vector(768))
    text: Mapped[str]
    topic: Mapped[Optional[list[Topic]]] = mapped_column(pg.ARRAY(topic_enum))

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

    @classmethod
    def update(cls, sess: Session, note_update: EmbeddedSentenceEdit) -> "Note":
        to_edit = sess.execute(
            select(Note).where(Note.note_id == note_update.id)
        ).scalar_one_or_none()
        if not to_edit:
            raise ValueError("Note cannot be found in database.")
        if note_update.text:
            to_edit.text = note_update.text
        if note_update.topic:
            to_edit.text = note_update.topic
        sess.add(to_edit)
        sess.flush()
        return to_edit


class Question(Base):
    __tablename__ = "Question"

    question_id: Mapped[IntPK]
    embedding = mapped_column(Vector(768))
    question_text: Mapped[str]
    question_answer: Mapped[str]
    topic: Mapped[Optional[list[Topic]]] = mapped_column(pg.ARRAY(topic_enum))
    stats: Mapped["QuestionStats"] = relationship(back_populates="question")

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
    def update(cls, sess: Session, edited_question: QuestionEdit) -> "Question":
        to_edit = sess.execute(
            select(Question).where(Question.question_id == edited_question.id)
        ).scalar_one_or_none()
        if not to_edit:
            raise ValueError("Question cannot be found to edit!")

        if edited_question.text:
            to_edit.question_text = edited_question.text
        if edited_question.answer:
            to_edit.question_answer = edited_question.answer
        if edited_question.topic:
            to_edit.topic = edited_question.topic
        sess.add(to_edit)
        sess.flush()
        return to_edit

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


class QuestionStats(Base):
    __tablename__ = "QuestionStats"

    question_id: Mapped[int] = mapped_column(ForeignKey("Question.question_id"))
    question = Mapped[Question] = relationship(back_populates="stats")
    last_answered: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.now()
    )
    correct: Mapped[int] = mapped_column(default=0)
    total_instances: Mapped[int] = mapped_column(default=0)

    @hybrid_property
    def wrong(self) -> int:
        return self.total_instances - self.correct
