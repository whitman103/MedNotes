from fastapi import APIRouter, Depends
from contextlib import asynccontextmanager
from sentence_transformers import SentenceTransformer
from mednotes.schema.ml import (
    EmbeddedSentenceGet,
    EmbeddedSentencePost,
    EmbeddedSentenceEdit,
    QuestionGet,
    QuestionPost,
    QuestionEdit,
)
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
    return EmbeddedSentenceGet(
        text=new_note.text, topic=new_note.topic, note_id=new_note.note_id
    )


@router.put("/edit", response_model=EmbeddedSentenceGet, status_code=201)
def edit_sentence(
    edit_sentence: EmbeddedSentenceEdit, sess: Session = Depends(get_session)
) -> EmbeddedSentenceGet:
    update = Note.update(sess, note_update=edit_sentence)
    return update


@router.post("/question", response_model=QuestionGet, status_code=201)
def create_question(
    input_question: QuestionPost, sess: Session = Depends(get_session)
) -> QuestionGet:
    embedding = ml_models["embedder"].encode([input_question.text])[0]
    new_question = Question.insert(
        sess,
        embedding,
        text=input_question.text,
        answer=input_question.answer,
        topic=input_question.topic,
    )
    return QuestionGet(
        text=new_question.question_text,
        topic=new_question.topic,
        question_id=new_question.question_id,
        answer=new_question.question_answer,
    )


@router.put("/question", response_model=QuestionGet, status_code=201)
def edit_question(
    updated_question: QuestionEdit, sess: Session = Depends(get_session)
) -> QuestionGet:
    update = Question.update(sess, updated_question)
    return update


@router.get("/search/note", response_model=list[EmbeddedSentenceGet], status_code=200)
def search_for_value(
    search_sentence: str,
    topic: Optional[list[str]] = None,
    result_request: int = 5,
    sess: Session = Depends(get_session),
) -> list[EmbeddedSentenceGet]:
    search = [search_sentence]
    search_results = Note.search(
        sess,
        ml_models["embedder"].encode(search)[0],
        topic=topic,
        result_num=result_request,
    )

    return [
        EmbeddedSentenceGet(text=x.text, topic=x.topic, note_id=x.note_id)
        for x in search_results
    ]


@router.delete("/note", status_code=204)
def delete_note(note_id: int, sess: Session = Depends(get_session)) -> None:
    Note.delete(sess, note_id)
    return True


@router.delete("/question", status_code=204)
def delete_question(question_id: int, sess: Session = Depends(get_session)) -> None:
    Question.delete(sess, question_id=question_id)
    return True


@router.get("/search/question", status_code=200, response_model=list[QuestionGet])
def search_for_question(
    search_key: str,
    topic: Optional[str | list[str]] = None,
    result_request: int = 5,
    sess: Session = Depends(get_session),
) -> list[QuestionGet]:
    if isinstance(topic, str):
        topic = [topic]
    embedding = ml_models["embedder"].encode([search_key])[0]
    returned_questions = Question.search(
        sess, to_search=embedding, topic=topic, result_num=result_request
    )
    return [
        QuestionGet(
            text=x.question_text,
            answer=x.question_answer,
            topic=x.topic,
            question_id=x.question_id,
        )
        for x in returned_questions
    ]
