"""Web search via Tavily, used for prices, rates, tariffs and other facts."""

from app.sources.http import DAY, CachedHttp


async def search(http: CachedHttp, api_key: str, query: str, max_results: int = 4) -> list[dict]:
    data = await http.json(
        "POST",
        "https://api.tavily.com/search",
        body={"query": query, "max_results": max_results, "search_depth": "basic"},
        headers={"Authorization": f"Bearer {api_key}"},
        ttl=7 * DAY,
    )
    return [
        {"title": r.get("title", ""), "url": r.get("url", ""), "content": r.get("content", "")}
        for r in data.get("results", [])
    ]
