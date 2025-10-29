from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.engine import Engine
from sqlalchemy import create_engine
from typing import Iterator

global_engine = create_engine("http://localhost:5432", future=True, pool_size=1)

host_session = sessionmaker(global_engine.execution_options())


def get_session() -> Iterator[Session]:
    with host_session.begin() as sess:
        yield sess


class Base(DeclarativeBase):
    pass
