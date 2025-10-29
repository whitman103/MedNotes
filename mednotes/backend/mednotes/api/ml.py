from fastapi import APIRouter
from contextlib import asynccontextmanager
from sentence_transformers import SentenceTransformer
from mednotes.schema.ml import EmbeddedSentence

ml_models = {}


@asynccontextmanager
async def lifespan(app: APIRouter):
    ml_models["embedder"] = SentenceTransformer("lokeshch19/ModernPubMedBERT")
    yield
    ml_models.clear()


router = APIRouter(lifespan=lifespan)


@router.post("/embed", response_model=list[EmbeddedSentence])
def embed_sentence(input_sentence: str | list[str]) -> list[EmbeddedSentence]:
    if isinstance(input_sentence, str):
        input_sentence = [input_sentence]
    embeddings = ml_models["embedder"].encode(input_sentence)
    return [
        EmbeddedSentence(embedding=x, text=y)
        for x, y in zip(embeddings, input_sentence)
    ]
