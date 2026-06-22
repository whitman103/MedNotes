from sqlalchemy import Column, ForeignKey, Table

from mednotes.db import Base

note_photo_link = Table(
    "NotePhotoAsset",
    Base.metadata,
    Column(
        "note_id",
        ForeignKey("Note.note_id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "asset_id",
        ForeignKey("PhotoAsset.asset_id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

question_photo_link = Table(
    "QuestionPhotoAsset",
    Base.metadata,
    Column(
        "question_id",
        ForeignKey("Question.question_id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "asset_id",
        ForeignKey("PhotoAsset.asset_id", ondelete="CASCADE"),
        primary_key=True,
    ),
)
