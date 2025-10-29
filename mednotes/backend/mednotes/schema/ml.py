from pydantic import BaseModel


class EmbeddedSentence(BaseModel):
    embedding: list[float]
    text: str
