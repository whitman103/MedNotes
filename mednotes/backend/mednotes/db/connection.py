from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy import create_engine, text
from typing import Iterator

global_engine = create_engine(
    "postgresql://johnwhitman:password@mednotes_db:5432/mednotes",
    future=True,
    pool_size=1,
)

host_session = sessionmaker(global_engine.execution_options())


def get_session() -> Iterator[Session]:
    with host_session.begin() as sess:
        yield sess


class Base(DeclarativeBase):
    pass


def reset_tables():
    with global_engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    Base.metadata.drop_all(bind=global_engine)

    Base.metadata.create_all(bind=global_engine)
