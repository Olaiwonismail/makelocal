"""Suppliers: the model writes maps queries, Serper returns real listings, we measure
distances, then the model picks and describes relevant ones. Names, addresses, phones
and distances always come from the listing, never from the model."""

import asyncio
import logging

from app.llm import tasks
from app.models import ProductAnalysis, Source, Supplier, SupplierGroup, SupplierGroupName, SupplyChain
from app.sources import firecrawl, fx, serper
from app.sources.geocode import distance_km, geocode
from app.stages.common import Context, Deps, SourceUnavailable, make_in

log = logging.getLogger(__name__)

GROUPS: dict[SupplierGroupName, tuple[str, str]] = {
    "Materials": ("supplier", "Raw materials and packaging."),
    "Workshops": ("workshop", "Who can run production or supply the machines."),
    "Services": ("service", "Finishing, packing, transport and paperwork."),
}
MAX_CANDIDATES = 30
MAX_WEBSITES = 5


async def run(deps: Deps, ctx: Context, analysis: ProductAnalysis) -> SupplyChain:
    llm = deps.require_llm()
    key = deps.settings.serper_api_key
    if not key:
        raise SourceUnavailable("Supplier search needs SERPER_API_KEY.")

    place = await geocode(deps.http, make_in(ctx.answers))
    location = f"{place.city}, {place.name.split(',')[-1].strip()}"
    plan = await tasks.supplier_queries(llm, ctx.product, analysis, location)

    results = await asyncio.gather(
        *(serper.places(deps.http, key, q.query, location, place.country_code) for q in plan.queries),
        return_exceptions=True,
    )
    candidates: dict[str, dict] = {}
    for result in results:
        if isinstance(result, BaseException):
            log.warning("places search failed: %s", result)
            continue
        for p in result:
            ident = str(p.get("cid") or f"{p.get('title')}|{p.get('address')}")
            if ident in candidates or not p.get("title"):
                continue
            if p.get("latitude") is not None and p.get("longitude") is not None:
                p["_distance"] = round(distance_km(place.lat, place.lon, p["latitude"], p["longitude"]), 1)
            candidates[ident] = p

    ranked = sorted(candidates.values(), key=lambda p: p.get("_distance", 1e9))[:MAX_CANDIDATES]
    if not ranked:
        return _empty(ctx.product, place.city, fx.currency_for(place.country_code))

    excerpts: dict[int, str] = {}
    if deps.settings.firecrawl_api_key:
        with_sites = [(i, p["website"]) for i, p in enumerate(ranked) if p.get("website")][:MAX_WEBSITES]
        pages = await asyncio.gather(
            *(firecrawl.scrape(deps.http, deps.settings.firecrawl_api_key, url) for _, url in with_sites),
            return_exceptions=True,
        )
        for (i, _), page in zip(with_sites, pages):
            if not isinstance(page, BaseException):
                excerpts[i] = (page.get("description") or page.get("markdown", ""))[:500]

    listing = [
        {
            "id": i,
            "name": p["title"],
            "category": p.get("category", ""),
            "address": p.get("address", ""),
            "rating": p.get("rating"),
            **({"website_excerpt": excerpts[i]} if i in excerpts else {}),
        }
        for i, p in enumerate(ranked)
    ]
    picks = await tasks.pick_suppliers(llm, ctx.product, analysis, listing)

    grouped: dict[SupplierGroupName, list[Supplier]] = {name: [] for name in GROUPS}
    for pick in picks.picks:
        if not 0 <= pick.id < len(ranked) or len(grouped[pick.group]) >= 6:
            continue
        p = ranked[pick.id]
        grouped[pick.group].append(
            Supplier(
                name=p["title"],
                kind=pick.kind,
                location=p.get("address", ""),
                distance_km=p.get("_distance"),
                capabilities=pick.capabilities[:4],
                note=pick.note,
                phone=p.get("phoneNumber"),
                website=p.get("website"),
                rating=p.get("rating"),
            )
        )

    return SupplyChain(
        product=ctx.product,
        origin=place.city,
        currency=fx.currency_for(place.country_code),
        groups=[
            SupplierGroup(
                name=name,
                noun=noun,
                description=picks.group_descriptions.get(name) or default,
                suppliers=grouped[name],
            )
            for name, (noun, default) in GROUPS.items()
        ],
        sources=[Source(title="Google Maps listings via Serper")],
    )


def _empty(product: str, city: str, currency: str) -> SupplyChain:
    return SupplyChain(
        product=product,
        origin=city,
        currency=currency,
        groups=[SupplierGroup(name=n, noun=noun, description=d) for n, (noun, d) in GROUPS.items()],
    )
