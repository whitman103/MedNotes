from fastapi import FastAPI
from mednotes.api.ml import router as ml_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.include_router(ml_router, prefix="/ml", tags=["ml"])


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*'"],
)
