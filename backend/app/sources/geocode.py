"""Place name -> coordinates and country, via OpenStreetMap Nominatim (free, no key)."""

import math
from dataclasses import dataclass

from app.sources.http import DAY, CachedHttp, SourceError


@dataclass(frozen=True)
class Place:
    name: str
    lat: float
    lon: float
    country_code: str
    city: str


async def geocode(http: CachedHttp, query: str) -> Place:
    results = await http.json(
        "GET",
        "https://nominatim.openstreetmap.org/search",
        params={"q": query, "format": "jsonv2", "limit": 1, "addressdetails": 1},
        ttl=30 * DAY,
    )
    if not results:
        raise SourceError(f"Couldn't find '{query}' on the map")
    top = results[0]
    address = top.get("address", {})
    city = address.get("city") or address.get("town") or address.get("state") or query.split(",")[0].strip()
    return Place(
        name=top.get("display_name", query),
        lat=float(top["lat"]),
        lon=float(top["lon"]),
        country_code=address.get("country_code", "").upper(),
        city=city,
    )


def distance_km(a_lat: float, a_lon: float, b_lat: float, b_lon: float) -> float:
    """Straight-line (great-circle) distance."""
    r = 6371.0
    p1, p2 = math.radians(a_lat), math.radians(b_lat)
    dp, dl = p2 - p1, math.radians(b_lon - a_lon)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))
