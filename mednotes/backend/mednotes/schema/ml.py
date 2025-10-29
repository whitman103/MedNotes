from pydantic import BaseModel, ConfigDict
from typing import Optional


class EmbeddedSentencePost(BaseModel):
    text: str
    topic: Optional[str] = None


class EmbeddedSentenceGet(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    text: str
    topic: Optional[str] = None


class TopicGet(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    topic_name: str
    n_notes: int
