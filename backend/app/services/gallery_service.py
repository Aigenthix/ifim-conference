"""
Gallery service — fetches photos from a public Google Drive folder.

Uses Google Drive's public share page to extract file IDs,
then constructs direct image URLs. No API key required.
The folder URL is configured via GALLERY_DRIVE_FOLDER_URL in .env.
"""
from __future__ import annotations

import re
import logging
from typing import List

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Cache to avoid re-scraping on every request
_cache: dict[str, tuple[float, list]] = {}
CACHE_TTL = 300  # 5 minutes


class GalleryService:
    """Fetches photos from a public Google Drive folder."""

    def __init__(self) -> None:
        settings = get_settings()
        self._folder_url = settings.GALLERY_DRIVE_FOLDER_URL
        self._folder_id = self._extract_folder_id(self._folder_url)

    @staticmethod
    def _extract_folder_id(url: str) -> str:
        """Extract folder ID from Google Drive URL."""
        if not url:
            return ""
        match = re.search(r'/folders/([a-zA-Z0-9_-]+)', url)
        if match:
            return match.group(1)
        match = re.search(r'id=([a-zA-Z0-9_-]+)', url)
        if match:
            return match.group(1)
        return url

    async def list_photos(self) -> List[dict]:
        """
        List all image files from a public Google Drive folder.
        Scrapes the public folder HTML to extract file IDs and names.
        """
        import time

        if not self._folder_id:
            return []

        # Check cache
        cache_key = self._folder_id
        if cache_key in _cache:
            cached_time, cached_data = _cache[cache_key]
            if time.time() - cached_time < CACHE_TTL:
                return cached_data

        try:
            async with httpx.AsyncClient(follow_redirects=True) as client:
                # Fetch the public folder page
                response = await client.get(
                    f"https://drive.google.com/embeddedfolderview?id={self._folder_id}",
                    headers={
                        "User-Agent": "Mozilla/5.0 (compatible; EventPlatform/1.0)",
                    },
                    timeout=15.0,
                )

                if response.status_code != 200:
                    logger.error(f"Drive folder fetch error {response.status_code}")
                    return []

                html = response.text

                # Extract file entries from the HTML
                # Pattern: /file/d/FILE_ID  and data-tooltip="FILENAME"
                file_pattern = re.findall(
                    r'href="[^"]*?/file/d/([a-zA-Z0-9_-]+)[^"]*?"[^>]*?>[^<]*?<img[^>]*?src="([^"]*?)"',
                    html,
                    re.DOTALL,
                )

                # Also try simpler pattern
                file_ids = re.findall(
                    r'/file/d/([a-zA-Z0-9_-]{20,})',
                    html,
                )

                # Extract filenames
                name_pattern = re.findall(
                    r'data-tooltip="([^"]+?\.(jpg|jpeg|png|gif|webp|bmp))"',
                    html,
                    re.IGNORECASE,
                )

                # Deduplicate file IDs
                seen = set()
                unique_ids = []
                for fid in file_ids:
                    if fid not in seen:
                        seen.add(fid)
                        unique_ids.append(fid)

                # Build photo list
                names = [n[0] for n in name_pattern]
                photos = []
                for i, file_id in enumerate(unique_ids):
                    filename = names[i] if i < len(names) else f"photo_{i + 1}.jpg"
                    photos.append({
                        "id": file_id,
                        "filename": filename,
                        "size": 0,
                        "mime_type": "image/jpeg",
                        "thumbnail_url": f"https://lh3.googleusercontent.com/d/{file_id}=w400",
                        "view_url": f"https://lh3.googleusercontent.com/d/{file_id}=w1200",
                        "download_url": f"https://drive.google.com/uc?export=download&id={file_id}",
                    })

                # If HTML scraping didn't find files, the folder might need
                # different parsing. Try the alternate approach.
                if not photos:
                    photos = await self._try_alternate_fetch(client)

                _cache[cache_key] = (time.time(), photos)
                logger.info(f"Found {len(photos)} photos in Drive folder {self._folder_id}")
                return photos

        except Exception as exc:
            logger.error(f"Failed to fetch Drive gallery: {exc}", exc_info=True)
            return []

    async def _try_alternate_fetch(self, client: httpx.AsyncClient) -> List[dict]:
        """Try alternate method to get files from public Drive folder."""
        try:
            response = await client.get(
                f"https://drive.google.com/drive/folders/{self._folder_id}",
                headers={
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                },
                timeout=15.0,
            )
            html = response.text

            # Find all file IDs in the page
            file_ids = list(set(re.findall(
                r'data-id="([a-zA-Z0-9_-]{20,})"',
                html,
            )))

            if not file_ids:
                # Try another pattern
                file_ids = list(set(re.findall(
                    r'"([a-zA-Z0-9_-]{28,})"[^"]*?"image/',
                    html,
                )))

            photos = []
            for i, file_id in enumerate(file_ids[:50]):
                photos.append({
                    "id": file_id,
                    "filename": f"photo_{i + 1}.jpg",
                    "size": 0,
                    "mime_type": "image/jpeg",
                    "thumbnail_url": f"https://lh3.googleusercontent.com/d/{file_id}=w400",
                    "view_url": f"https://lh3.googleusercontent.com/d/{file_id}=w1200",
                    "download_url": f"https://drive.google.com/uc?export=download&id={file_id}",
                })
            return photos
        except Exception:
            return []
