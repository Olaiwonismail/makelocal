import hashlib
import json
import logging
from typing import Any

import httpx

from app.db import Store

log = logging.getLogger(__name__)

DAY = 24 * 3600


class SourceError(RuntimeError):
    pass


class CachedHttp:
    """httpx client whose JSON responses are cached by request (never by API key)."""

    def __init__(self, store: Store, client: httpx.AsyncClient | None = None):
        self.store = store
        self.client = client or httpx.AsyncClient(
            timeout=httpx.Timeout(45.0), headers={"User-Agent": "MakeLocal/0.1 (hackathon demo)"}
        )

    async def json(
        self,
        method: str,
        url: str,
        *,
        ttl: float,
        cache_url: str | None = None,
        params: dict[str, Any] | None = None,
        body: Any = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        key_material = json.dumps([method, cache_url or url, params, body], sort_keys=True, default=str)
        key = hashlib.sha256(key_material.encode()).hexdigest()
        cached = self.store.cache_get(key)
        if cached is not None:
            return cached
        try:
            response = await self.client.request(method, url, params=params, json=body, headers=headers)
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPStatusError as e:
            raise SourceError(f"{e.request.url.host} returned {e.response.status_code}") from e
        except (httpx.HTTPError, ValueError) as e:
            raise SourceError(f"{httpx.URL(url).host} request failed: {e}") from e
        self.store.cache_put(key, data, ttl)
        return data

    async def aclose(self) -> None:
        await self.client.aclose()
