"""Cost: gather exchange rates, commodity prices and web evidence, then have the model
build cited cost lines. The totals are computed by the frontend from the lines."""

import asyncio
import logging
from datetime import date
from typing import Any

from app.llm import tasks
from app.models import CostComparison, ProductAnalysis
from app.sources import commodities, fx, tavily
from app.sources.geocode import geocode
from app.sources.http import SourceError
from app.stages.common import Context, Deps, batch_size, make_in

log = logging.getLogger(__name__)


def search_queries(product: str, analysis: ProductAnalysis, city: str, country: str) -> list[str]:
    year = date.today().year
    queries = [
        f"{product} wholesale price {country} {year}",
        f"{product} import duty tariff {country}",
        f"{product} FOB export price China per unit",
        f"industrial electricity tariff per kWh {country} {year}",
        f"factory worker monthly wage {city} {country} {year}",
    ]
    for material in analysis.materials[:3]:
        queries.append(f"{material.name} price {country} {year}")
    return queries


async def run(deps: Deps, ctx: Context, analysis: ProductAnalysis) -> CostComparison:
    llm = deps.require_llm()
    s = deps.settings
    place = await geocode(deps.http, make_in(ctx.answers))
    currency = fx.currency_for(place.country_code)
    country = place.name.split(",")[-1].strip()
    units = batch_size(ctx.answers)

    facts: dict[str, Any] = {"date": date.today().isoformat()}
    try:
        rate, rate_source = await fx.usd_rate(deps.http, currency, s.exchangerate_api_key)
        facts["exchange_rate"] = f"1 USD = {rate:,.2f} {currency} ({rate_source})"
    except SourceError as e:
        log.warning("exchange rate unavailable: %s", e)

    if s.api_ninjas_key:
        for material in analysis.materials:
            code = commodities.match(material.name)
            if not code:
                continue
            try:
                facts.setdefault("world_commodity_prices_usd", []).append(
                    await commodities.price(deps.http, s.api_ninjas_key, code)
                )
            except SourceError as e:
                log.warning("commodity price unavailable: %s", e)

    snippets: list[dict[str, str]] = []
    if s.tavily_api_key:
        queries = search_queries(ctx.product, analysis, place.city, country)
        results = await asyncio.gather(
            *(tavily.search(deps.http, s.tavily_api_key, q, max_results=3) for q in queries), return_exceptions=True
        )
        seen: set[str] = set()
        for result in results:
            if isinstance(result, BaseException):
                log.warning("search failed: %s", result)
                continue
            for item in result:
                if item["url"] and item["url"] not in seen:
                    seen.add(item["url"])
                    snippets.append(item)

    comparison = await tasks.cost(
        llm,
        product=ctx.product,
        answers=ctx.answers,
        analysis=analysis,
        location=place.city,
        currency=currency,
        units=units,
        facts=facts,
        snippets=snippets,
    )
    # These come from lookups, not the model.
    comparison.currency = currency
    comparison.location = place.city
    comparison.units = units
    return comparison
