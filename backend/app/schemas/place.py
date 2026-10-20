from app.schemas.base import CamelModel


class Place(CamelModel):
    id: str
    city: str
    name: str
    category: str | None = None
    lat: float
    lng: float
    opening_hours: str | None = None
    description: str | None = None
    image_url: str | None = None
    image_credit: str | None = None
