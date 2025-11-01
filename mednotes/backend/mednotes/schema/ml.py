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


class TopicGet(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    topic_name: str
    n_notes: int
