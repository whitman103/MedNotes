from fastapi import APIRouter, Depends
from contextlib import asynccontextmanager
from sentence_transformers import SentenceTransformer
from mednotes.schema.ml import EmbeddedSentenceGet, EmbeddedSentencePost
from mednotes.db.ml import Note, Question
from mednotes.db.connection import get_session, reset_tables
from typing import Optional
from sqlalchemy.orm import Session

ml_models = {}


@asynccontextmanager
async def lifespan(app: APIRouter):
    reset_tables()
    ml_models["embedder"] = SentenceTransformer("lokeshch19/ModernPubMedBERT")
    yield
    ml_models.clear()


router = APIRouter(lifespan=lifespan)


@router.post("/embed", response_model=EmbeddedSentenceGet, status_code=201)
def embed_sentence(
    input_sentence: EmbeddedSentencePost, sess: Session = Depends(get_session)
) -> EmbeddedSentenceGet:
    embedding = ml_models["embedder"].encode([input_sentence.text])[0]
    new_note = Note.insert(
        sess, embedding=embedding, text=input_sentence.text, topic=input_sentence.topic
    )
    return EmbeddedSentenceGet(text=new_note.text, topic=new_note.topic)


@router.get("/search/note", response_model=list[EmbeddedSentenceGet], status_code=200)
def search_for_value(
    search_sentence: str,
    topic: Optional[str] = None,
    sess: Session = Depends(get_session),
) -> list[EmbeddedSentenceGet]:
    search = [search_sentence]
    search_results = Note.search(sess, ml_models["embedder"].encode(search)[0])

    return [EmbeddedSentenceGet(text=x.text, topic=x.topic) for x in search_results]


@router.delete("/note", status_code=204)
def delete_note(note_id: int, sess: Session = Depends(get_session)) -> None:
    Note.delete(sess, note_id)
    return True


@router.get("/search/question", status_code=200)
def search_for_question(
    search_key: str,
    topic: Optional[str | list[str]] = None,
    result_request: int = 5,
    sess: Session = Depends(get_session),
) -> None:
    if isinstance(topic, str):
        topic = [topic]
    embedding = ml_models["embedder"].encode([search_key])[0]
    returned_questions = Question.search(
        sess, to_search=embedding, topic=topic, result_num=result_request
    )
    return returned_questions
