"""Business listings from Google Maps via Serper's /places endpoint."""

from app.sources.http import DAY, CachedHttp


async def places(http: CachedHttp, api_key: str, query: str, location: str, country_code: str) -> list[dict]:
    body = {"q": f"{query} near {location}", "gl": country_code.lower() or "us", "hl": "en"}
    data = await http.json(
        "POST",
        "https://google.serper.dev/places",
        body=body,
        headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
        ttl=14 * DAY,
    )
    return data.get("places", [])
