"""Gallery routes — photos from Google Drive."""
from __future__ import annotations

import uuid

import httpx
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

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


@router.get(
    "/download/{file_id}",
    summary="Proxy download a Google Drive photo",
)
async def download_photo(
    file_id: str,
    user: CurrentUser,
) -> StreamingResponse:
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
        resp = await client.get(url)
        content_type = resp.headers.get("content-type", "application/octet-stream")
        return StreamingResponse(
            iter([resp.content]),
            media_type=content_type,
            headers={
                "Content-Disposition": f'attachment; filename="{file_id}.jpg"',
                "Cache-Control": "public, max-age=86400",
            },
        )
