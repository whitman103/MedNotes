from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from mednotes.db.connection import get_session
from mednotes.db.asset import Asset
from mednotes.schema.asset import AssetGet

router = APIRouter()


@router.get("/list-assets")
def list_assets(sess: Session = Depends(get_session)) -> list[AssetGet]:
    return Asset.list(sess)
