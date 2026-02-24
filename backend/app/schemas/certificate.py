"""Certificate schemas."""
from __future__ import annotations

import uuid

from pydantic import BaseModel


class CertificateResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    event_id: uuid.UUID
    pdf_url: str | None = None
    status: str

    model_config = {"from_attributes": True}
