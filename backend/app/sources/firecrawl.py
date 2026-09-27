"""Read a web page as markdown via Firecrawl (product links, supplier websites)."""

from app.sources.http import DAY, CachedHttp


async def scrape(http: CachedHttp, api_key: str, url: str) -> dict:
    data = await http.json(
        "POST",
        "https://api.firecrawl.dev/v2/scrape",
        body={"url": url, "formats": ["markdown"], "onlyMainContent": True},
        headers={"Authorization": f"Bearer {api_key}"},
        ttl=7 * DAY,
    )
    page = data.get("data", {})
    meta = page.get("metadata", {})
    return {
        "title": meta.get("title", ""),
        "description": meta.get("description", ""),
        "markdown": page.get("markdown", ""),
    }
