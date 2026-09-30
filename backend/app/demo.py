"""The researched demo products (tomato paste in Kano, laundry soap in Lagos).

Its stages are served from `data/demo/*.json` instead of the live pipeline, so the
demo works without API keys and never depends on a flaky lookup during judging.
"""

import json
from functools import cache
from pathlib import Path
from typing import Any

from app.models import STAGE_MODELS, Answers, StageName

DEMO_DIR = Path(__file__).resolve().parent.parent / "data" / "demo"

# Fixture keys are camelCase; stage names are snake_case.
_FIXTURE_KEY: dict[StageName, str] = {
    "follow_up": "followUp",
    "analysis": "analysis",
    "cost": "cost",
    "suppliers": "suppliers",
    "production": "production",
    "quotes": "quotes",
}


@cache
def fixtures() -> list[dict[str, Any]]:
    fixtures = [json.loads(p.read_text()) for p in sorted(DEMO_DIR.glob("*.json"))]
    for fixture in fixtures:
        for stage, model in STAGE_MODELS.items():
            model.model_validate(fixture[_FIXTURE_KEY[stage]])
    return fixtures


def match(product: str) -> dict[str, Any] | None:
    text = product.lower()
    for fixture in fixtures():
        if any(term in text for term in fixture["match"]):
            return fixture
    return None


def stage(fixture: dict[str, Any], name: StageName) -> dict[str, Any]:
    model = STAGE_MODELS[name]
    return model.model_validate(fixture[_FIXTURE_KEY[name]]).model_dump(by_alias=True)


def answers(fixture: dict[str, Any]) -> Answers:
    return Answers.model_validate(fixture["answers"])
