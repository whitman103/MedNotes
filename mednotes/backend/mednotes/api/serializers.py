from mednotes.schema.asset import PhotoAssetGet


def photos_to_schema(photos) -> list[PhotoAssetGet]:
    return [PhotoAssetGet.model_validate(photo) for photo in photos]
