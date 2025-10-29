from sqlalchemy import BigInteger
from typing_extensions import Annotated
from sqlalchemy.orm import mapped_column

IntPK = Annotated[int, mapped_column(BigInteger, primary_key=True, autoincrement=True)]
