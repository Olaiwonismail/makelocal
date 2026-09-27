"""Creating projects (from text, a link or a photo) and summarising them for the workspace."""

import base64
import binascii
import re
import sqlite3

from app import demo
from app.llm import tasks
from app.models import STAGES, Answers, CardAction, CostComparison, Metric, Project, ProjectCard, SupplyChain
from app.sources import firecrawl
from app.stages.common import Deps, SourceUnavailable, StageInputError, batch_size, looks_like_url

MAX_IMAGE_BYTES = 6 * 1024 * 1024


def _decode_image(data_url: str) -> tuple[bytes, str]:
    match = re.match(r"^data:(image/[\w.+-]+);base64,(.+)$", data_url, re.S)
    if not match:
        raise StageInputError("The photo couldn't be read. Try a JPEG or PNG.", "bad_image")
    try:
        data = base64.b64decode(match.group(2), validate=True)
    except binascii.Error as e:
        raise StageInputError("The photo couldn't be read. Try a JPEG or PNG.", "bad_image") from e
    if len(data) > MAX_IMAGE_BYTES:
        raise StageInputError("That photo is too large. Try one under 6 MB.", "bad_image")
    return data, match.group(1)


async def identify(deps: Deps, text: str, image: str | None) -> tuple[str, str]:
    """Returns (product name, how it was given: text | link | photo)."""
    text = text.strip()
    if image:
        identity = await tasks.identify_from_image(deps.require_llm(), _decode_image(image), text)
        return identity.product, "photo"
    if looks_like_url(text):
        if not deps.settings.firecrawl_api_key:
            raise SourceUnavailable("Reading product links needs FIRECRAWL_API_KEY. Type the product name instead.")
        page = await firecrawl.scrape(deps.http, deps.settings.firecrawl_api_key, text)
        page_text = "\n".join(x for x in (page["title"], page["description"], page["markdown"]) if x)
        identity = await tasks.identify_from_page(deps.require_llm(), text, page_text)
        return identity.product, "link"
    if not text:
        raise StageInputError("Name or describe a product, paste a link, or add a photo.", "empty")
    return text, "text"


async def create(deps: Deps, text: str, image: str | None) -> Project:
    fixture = demo.match(text) if text and not image else None
    if fixture:
        product, kind = fixture["product"], "text"
        answers = demo.answers(fixture)
    else:
        product, kind = await identify(deps, text, image)
        fixture = demo.match(product)
        answers = demo.answers(fixture) if fixture else Answers()
    project_id = deps.store.create_project(product, text or kind, demo=fixture is not None, answers=answers)
    return to_project(deps, deps.store.get_project(project_id))


def to_project(deps: Deps, row: sqlite3.Row) -> Project:
    return Project(
        id=row["id"],
        product=row["product"],
        input=row["input"],
        demo=bool(row["demo"]),
        answers=Answers.model_validate_json(row["answers"]),
        stages=[s for s in STAGES if s in deps.store.stage_names(row["id"])],
        created_at=row["created_at"],
    )


def seed_demo(deps: Deps) -> None:
    """Give an empty workspace the researched demo project, partway through quotes."""
    if deps.store.count_projects() > 0:
        return
    for fixture in demo.fixtures():
        project_id = deps.store.create_project(fixture["product"], fixture["product"], True, demo.answers(fixture))
        for stage in ("follow_up", "analysis", "cost", "suppliers", "production", "quotes"):
            deps.store.put_stage(project_id, stage, demo.stage(fixture, stage))


# --- Workspace cards ------------------------------------------------------------

CARD_STAGES = ("analysis", "cost", "suppliers", "quotes")


def card(deps: Deps, row: sqlite3.Row) -> ProjectCard:
    done = set(deps.store.stage_names(row["id"]))
    answers = Answers.model_validate_json(row["answers"])
    stage = next((i for i, s in enumerate(CARD_STAGES) if s not in done), 3)

    if stage == 0:
        if answers.make_in:
            status, action = "Questions answered. Analysis is next.", CardAction(label="Continue", path="/plan/analysis")
        else:
            status, action = "A few questions to answer first.", CardAction(label="Continue", path="/plan")
    elif stage == 1:
        status, action = "Analysis complete. Costing is next.", CardAction(label="Continue", path="/plan/cost")
    elif stage == 2:
        status, action = "Costing done. Find who can help make it.", CardAction(label="Find suppliers", path="/plan/suppliers")
    elif "quotes" in done:
        status, action = "Request drafted. Waiting on replies.", CardAction(label="Open quotes", path="/plan/quotes")
    else:
        status, action = "Suppliers found. Send your request.", CardAction(label="Request quotes", path="/plan/quotes")

    metric = Metric(label="Status", text=["Analysis", "Costing", "Suppliers", "Quotes"][stage])
    cost_data = deps.store.get_stage(row["id"], "cost")
    if cost_data:
        c = CostComparison.model_validate(cost_data)
        saving = sum(l.per_unit for l in c.imported) - sum(l.per_unit for l in c.local)
        metric = Metric(
            label="Saving vs import" if saving >= 0 else "Import is cheaper by",
            amount=abs(saving),
            currency=c.currency,
            unit=c.unit,
        )
    elif "suppliers" in done:
        chain = SupplyChain.model_validate(deps.store.get_stage(row["id"], "suppliers"))
        count = sum(len(g.suppliers) for g in chain.groups)
        metric = Metric(label="Businesses found", text=f"{count} nearby")

    return ProjectCard(
        id=row["id"],
        product=row["product"],
        started=row["created_at"],
        units=batch_size(answers) if (answers.quantity or answers.exact_quantity) else None,
        location=answers.make_in.split(",")[0].strip(),
        stage=stage,
        status=status,
        metric=metric,
        action=action,
    )
