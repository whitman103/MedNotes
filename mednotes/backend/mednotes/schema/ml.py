from pydantic import BaseModel, ConfigDict
from typing import Optional
from mednotes.db.enums import Topic


class EmbeddedSentencePost(BaseModel):
    text: str
    topic: Optional[list[Topic]] = None


class EmbeddedSentenceGet(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    text: str
    topic: Optional[list[Topic]] = None
    note_id: int


class EmbeddedSentenceEdit(BaseModel):
    text: Optional[str] = None
    topic: Optional[list[Topic]] = None
    id: int


class TopicGet(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    topic_name: str
    n_notes: int


class QuestionPost(BaseModel):
    text: str
    answer: str
    topic: Optional[list[Topic]] = None


class QuestionEdit(BaseModel):
    text: Optional[str] = None
    answer: Optional[str] = None
    topic: Optional[list[Topic]] = None
    id: int


class QuestionGet(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    text: str
    answer: str
    topic: Optional[list[Topic]] = None
    question_id: int
