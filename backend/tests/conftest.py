import json
import re
from typing import Any, Callable

import httpx
import pytest
from fastapi.testclient import TestClient
from pydantic import BaseModel

from app.config import Settings
from app.db import Store
from app.llm import tasks
from app.main import create_app
from app.models import (
    AnalysisBranch,
    CostComparison,
    CostLine,
    FollowUpQuestion,
    Material,
    PlanStep,
    ProductAnalysis,
    ProductionPlan,
    FlowStep,
)
from app.sources.http import CachedHttp
from app.stages.common import Deps

KANO = {"lat": "12.0022", "lon": "8.5920", "display_name": "Kano, Kano State, Nigeria",
        "address": {"city": "Kano", "country_code": "ng"}}

PLACES = [
    {"title": "Northern Polymers", "address": "Sharada Industrial Estate, Kano", "latitude": 11.97, "longitude": 8.50,
     "category": "Plastic supplier", "phoneNumber": "+234 800 000 0001", "website": "https://northern.example", "cid": "1"},
    {"title": "Kano Moulding Works", "address": "Bompai, Kano", "latitude": 12.02, "longitude": 8.55,
     "category": "Plastic fabrication", "phoneNumber": "+234 800 000 0002", "cid": "2"},
    {"title": "Mama Put Kitchen", "address": "Zoo Road, Kano", "latitude": 12.0, "longitude": 8.53,
     "category": "Restaurant", "cid": "3"},
]


def mock_transport() -> httpx.MockTransport:
    def handler(request: httpx.Request) -> httpx.Response:
        host = request.url.host
        if host == "nominatim.openstreetmap.org":
            return httpx.Response(200, json=[KANO])
        if host in ("open.er-api.com", "v6.exchangerate-api.com"):
            return httpx.Response(200, json={"rates": {"NGN": 1390.0}, "conversion_rates": {"NGN": 1390.0}})
        if host == "google.serper.dev":
            return httpx.Response(200, json={"places": PLACES})
        if host == "api.tavily.com":
            q = json.loads(request.content)["query"]
            return httpx.Response(200, json={"results": [
                {"title": f"Result for {q}", "url": f"https://news.example/{abs(hash(q))}", "content": "Price is ₦1,500."}
            ]})
        if host == "api.firecrawl.dev":
            return httpx.Response(200, json={"data": {"markdown": "We sell HDPE and PP resin.",
                                                      "metadata": {"title": "Northern Polymers", "description": "Resin distributor"}}})
        return httpx.Response(404)

    return httpx.MockTransport(handler)


def listing_id(prompt: str, name: str) -> int:
    """Find a place's id in the listing the pick prompt shows the model."""
    match = re.search(r'"id": (\d+), "name": "' + re.escape(name) + '"', prompt)
    assert match, f"{name} not in listing"
    return int(match.group(1))


class FakeLLM:
    """Returns canned objects per schema and records every prompt."""

    def __init__(self, overrides: dict[type, Callable[[str], BaseModel]] | None = None):
        self.prompts: list[tuple[str, str]] = []
        self.responses: dict[type, Callable[[str], BaseModel]] = {
            FollowUpQuestion: lambda p: FollowUpQuestion(question="Which size?", hint="Moulds differ.",
                                                        options=["Small", "Large"]),
            tasks.ProductIdentity: lambda p: tasks.ProductIdentity(product="Plastic garden chair"),
            ProductAnalysis: lambda p: ProductAnalysis(
                product="Plastic chair",
                branches=[AnalysisBranch(title="Materials", items=["PP resin"]),
                          AnalysisBranch(title="Manufacturing", items=["Injection mould"]),
                          AnalysisBranch(title="Equipment", items=["Injection machine"])],
                materials=[Material(name="Polypropylene resin"), Material(name="Aluminium frame")],
            ),
            CostComparison: lambda p: CostComparison(
                product="Plastic chair", unit="chair", location="wrong", currency="USD", units=1,
                local=[CostLine(label="Materials", per_unit=2000, basis="[1]", kind="sourced")],
                imported=[CostLine(label="FOB", per_unit=3000, basis="estimate")],
                verdict="Local is cheaper.",
            ),
            tasks.SupplierQueries: lambda p: tasks.SupplierQueries(queries=[
                tasks.SearchQuery(group="Materials", query="PP resin supplier"),
                tasks.SearchQuery(group="Workshops", query="injection moulding"),
            ]),
            tasks.SupplierPicks: lambda p: tasks.SupplierPicks(picks=[
                tasks.SupplierPick(id=listing_id(p, "Northern Polymers"), group="Materials", kind="Resin distributor",
                                   capabilities=["PP"], note="Ask for PP."),
                tasks.SupplierPick(id=listing_id(p, "Kano Moulding Works"), group="Workshops", kind="Moulder",
                                   capabilities=["Injection"], note="Has presses."),
                tasks.SupplierPick(id=99, group="Services", kind="Ghost", capabilities=[], note="Out of range id."),
            ]),
            ProductionPlan: lambda p: ProductionPlan(
                product="Plastic chair", batch=5, flow=[FlowStep(label="Buy resin"), FlowStep(label="Mould", key=True)],
                steps=[PlanStep(title="Order resin", when="Week 1", detail="Order it.", who="You")],
            ),
            tasks.QuoteBrief: lambda p: tasks.QuoteBrief(brief="Quote 1,000 chairs.", attachments=["Reply by soon"]),
        }
        self.responses.update(overrides or {})

    async def generate(self, prompt: str, schema: type[BaseModel], *, image: Any = None) -> BaseModel:
        self.prompts.append((schema.__name__, prompt))
        return self.responses[schema](prompt)


def make_deps(tmp_path, llm=None, **keys: str) -> Deps:
    settings = Settings(db_path=str(tmp_path / "test.db"), **keys)
    store = Store(settings.db_path)
    http = CachedHttp(store, httpx.AsyncClient(transport=mock_transport()))
    return Deps(store=store, http=http, settings=settings, llm=llm)


ALL_KEYS = dict(gemini_api_key="x", serper_api_key="x", tavily_api_key="x", firecrawl_api_key="x")


@pytest.fixture
def fake_llm() -> FakeLLM:
    return FakeLLM()


@pytest.fixture
def live_client(tmp_path, fake_llm):
    deps = make_deps(tmp_path, llm=fake_llm, **ALL_KEYS)
    with TestClient(create_app(deps)) as client:
        yield client


@pytest.fixture
def keyless_client(tmp_path):
    with TestClient(create_app(make_deps(tmp_path))) as client:
        yield client
