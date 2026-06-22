from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from mednotes.db.enums import Topic
from mednotes.schema.asset import PhotoAssetGet


class EmbeddedSentencePost(BaseModel):
    text: str
    topic: Optional[list[Topic]] = None
    photo_asset_ids: Optional[list[int]] = None


class EmbeddedSentenceGet(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    text: str
    topic: Optional[list[Topic]] = None
    note_id: int
    photos: list[PhotoAssetGet] = Field(default_factory=list)


class EmbeddedSentenceEdit(BaseModel):
    text: Optional[str] = None
    topic: Optional[list[Topic]] = None
    id: int
    photo_asset_ids: Optional[list[int]] = None


class TopicGet(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    topic_name: str
    n_notes: int


class QuestionPost(BaseModel):
    text: str
    answer: str
    topic: Optional[list[Topic]] = None
    photo_asset_ids: Optional[list[int]] = None


class QuestionEdit(BaseModel):
    text: Optional[str] = None
    answer: Optional[str] = None
    topic: Optional[list[Topic]] = None
    id: int
    photo_asset_ids: Optional[list[int]] = None


class QuestionGet(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    text: str
    answer: str
    topic: Optional[list[Topic]] = None
    question_id: int
    photos: list[PhotoAssetGet] = Field(default_factory=list)
