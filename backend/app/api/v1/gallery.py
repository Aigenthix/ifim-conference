"""Gallery routes — photos from Google Drive."""
from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.api.deps import CurrentUser
from app.services.gallery_service import GalleryService

router = APIRouter(prefix="/gallery", tags=["gallery"])


@router.get(
    "/{event_id}",
    summary="List event photos from Google Drive",
    description="Returns photo list with Google Drive URLs.",
)
async def list_photos(
    event_id: uuid.UUID,
    user: CurrentUser,
) -> list[dict]:
    service = GalleryService()
    return await service.list_photos()
