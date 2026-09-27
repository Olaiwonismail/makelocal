"""Every prompt the pipeline sends, one function per task.

Pipeline stages gather data, then call these; nothing outside this package builds a
prompt or names a model.
"""

import json
from typing import Any

from pydantic import BaseModel, Field

from app.llm.client import JsonModel
from app.models import (
    Answers,
    CostComparison,
    FollowUpQuestion,
    ProductAnalysis,
    ProductionPlan,
    SupplierGroupName,
)

RULES = """Rules:
- Be specific and practical. Write for an entrepreneur deciding whether to manufacture locally.
- Never invent businesses, prices, statistics or sources. If a number is not in the context you were given, it is an estimate and must be labelled as one.
- Use plain words. No marketing language.
- Reply with a single JSON object only."""


def _schema(model: type[BaseModel]) -> str:
    return json.dumps(model.model_json_schema(by_alias=True), separators=(",", ":"))


def _answers(answers: Answers) -> str:
    quantity = f"{answers.exact_quantity:,} units" if answers.exact_quantity else (answers.quantity or "not given")
    follow_up = ". ".join(x for x in (answers.follow_up, answers.follow_up_text.strip()) if x) or "not given"
    return (
        f"Quantity: {quantity}\n"
        f"Will sell in: {answers.sell_in or 'not given'}\n"
        f"Wants it made in: {answers.make_in or 'not given'}\n"
        f"How close to the original: {answers.match or 'not given'}\n"
        f"Product detail: {follow_up}"
    )


def _dump(model: BaseModel | None) -> str:
    return model.model_dump_json(by_alias=True, exclude_none=True) if model else "none"


# --- Product identification ------------------------------------------------------


class ProductIdentity(BaseModel):
    product: str = Field(description="Short product name, e.g. 'Plastic garden chair' or 'Tomato paste, 70g sachet'")


async def identify_from_image(llm: JsonModel, image: tuple[bytes, str], hint: str) -> ProductIdentity:
    prompt = f"""Identify the manufactured product in this photo so a local manufacturer could make it.
Name the product, its size or format if visible, and main material if obvious.
User's note: {hint or "none"}

Reply with JSON matching: {_schema(ProductIdentity)}
{RULES}"""
    return await llm.generate(prompt, ProductIdentity, image=image)


async def identify_from_page(llm: JsonModel, url: str, page_text: str) -> ProductIdentity:
    prompt = f"""A user pasted this product link: {url}
Page content (truncated):
---
{page_text[:6000]}
---
Name the product being sold, with its size or format.

Reply with JSON matching: {_schema(ProductIdentity)}
{RULES}"""
    return await llm.generate(prompt, ProductIdentity)


# --- Intake ---------------------------------------------------------------------


async def follow_up(llm: JsonModel, product: str) -> FollowUpQuestion:
    prompt = f"""Product someone wants to manufacture locally: {product}

Write the ONE clarifying question whose answer most changes how this product is made
(format, size, material grade, end use...). Give 3 to 5 short answer options and a
one-sentence hint explaining why it matters for production.

Reply with JSON matching: {_schema(FollowUpQuestion)}
{RULES}"""
    return await llm.generate(prompt, FollowUpQuestion)


# --- Analysis -------------------------------------------------------------------


async def analysis(llm: JsonModel, product: str, answers: Answers) -> ProductAnalysis:
    prompt = f"""Break this product down for local manufacturing.

Product: {product}
{_answers(answers)}

Return:
- branches: exactly three, titled "Materials", "Manufacturing" and "Equipment". Items are short labels (2 to 5 words). Manufacturing items are the process steps in order.
- materials: each with its role, quantity per unit, quantity for the stated batch, and where it is typically sourced in the region.
- process: steps in order with the key parameters (temperatures, times, tolerances) in the detail.
- equipment: machines needed with typical purchase cost range in USD (these are estimates).
- context: 2 to 4 facts about local production vs imports for this product in the region, only if you are confident they are true; otherwise leave empty.

Reply with JSON matching: {_schema(ProductAnalysis)}
{RULES}"""
    return await llm.generate(prompt, ProductAnalysis)


# --- Cost -----------------------------------------------------------------------


async def cost(
    llm: JsonModel,
    *,
    product: str,
    answers: Answers,
    analysis: ProductAnalysis,
    location: str,
    currency: str,
    units: int,
    facts: dict[str, Any],
    snippets: list[dict[str, str]],
) -> CostComparison:
    evidence = "\n".join(
        f"[{i + 1}] {s['title']} ({s['url']}): {s['content'][:600]}" for i, s in enumerate(snippets)
    ) or "none"
    prompt = f"""Estimate the per-unit cost of making this product locally versus importing it.

Product: {product}
{_answers(answers)}
Location: {location}. Currency: {currency}. Batch: {units:,} units.
Product breakdown: {_dump(analysis)}

Looked-up facts (trust these): {json.dumps(facts)}

Web search results (cite as [n] when you use one):
{evidence}

Return all money in {currency} per unit.
- local: 3 to 6 lines covering materials, labour, machine/process (energy and depreciation) and transport.
- imported: 3 to 6 lines covering product cost (FOB), shipping and insurance, duties, and clearing/inland transport.
- Each line's basis says exactly where the number comes from: cite [n] or a looked-up fact and set kind "sourced", otherwise explain the assumption and set kind "estimate".
- verdict: 2 to 4 sentences. Say honestly whether local production makes sense, when, and the main risk (e.g. equipment payback, seasonality, supply).
- caveats: the risks and conditions that could flip the answer.
- references: useful price reference points found in the evidence (retail, wholesale, input prices, rates), each with its source.
- sources: the evidence items you actually used, with title and url.
- unit: the selling unit name (e.g. "unit", "chair", "sachet"). units: {units}. location: "{location}". currency: "{currency}".

Reply with JSON matching: {_schema(CostComparison)}
{RULES}"""
    return await llm.generate(prompt, CostComparison)


# --- Suppliers ------------------------------------------------------------------


class SearchQuery(BaseModel):
    group: SupplierGroupName
    query: str = Field(description="What to type into a maps search, e.g. 'HDPE resin supplier'")


class SupplierQueries(BaseModel):
    queries: list[SearchQuery] = Field(min_length=1, max_length=8)


async def supplier_queries(llm: JsonModel, product: str, analysis: ProductAnalysis, location: str) -> SupplierQueries:
    prompt = f"""We need to find real local businesses near {location} to make: {product}
Product breakdown: {_dump(analysis)}

Write 4 to 8 short maps search queries (no location in the query, it is added separately):
- Materials: suppliers of the main raw materials and packaging.
- Workshops: factories or workshops with the right machines, or equipment sellers.
- Services: finishing, packaging, testing, transport or regulatory help.

Reply with JSON matching: {_schema(SupplierQueries)}
{RULES}"""
    return await llm.generate(prompt, SupplierQueries)


class SupplierPick(BaseModel):
    id: int = Field(description="The id of the place in the list you were given")
    group: SupplierGroupName
    kind: str = Field(description="What the business is, e.g. 'Polymer distributor'")
    capabilities: list[str] = Field(description="2 to 4 short tags, based only on the listing")
    note: str = Field(description="One sentence on why it's relevant and what to ask them. No invented facts.")


class SupplierPicks(BaseModel):
    picks: list[SupplierPick]
    group_descriptions: dict[str, str] = Field(
        default_factory=dict, description="One sentence per group (Materials, Workshops, Services) for this product"
    )


async def pick_suppliers(
    llm: JsonModel, product: str, analysis: ProductAnalysis, places: list[dict[str, Any]]
) -> SupplierPicks:
    prompt = f"""These are real businesses returned by a maps search. Choose the ones that could
genuinely help make: {product}
Product breakdown: {_dump(analysis)}

Places (id, name, category, address, website excerpt if any):
{json.dumps(places, ensure_ascii=False)}

Pick up to 6 per group, most relevant first. Skip anything irrelevant (restaurants, schools,
unrelated shops). Describe each only from what the listing shows.

Reply with JSON matching: {_schema(SupplierPicks)}
{RULES}"""
    return await llm.generate(prompt, SupplierPicks)


# --- Production plan ------------------------------------------------------------


async def production(
    llm: JsonModel,
    *,
    product: str,
    answers: Answers,
    analysis: ProductAnalysis,
    cost: CostComparison | None,
    supplier_names: list[str],
    batch: int,
) -> ProductionPlan:
    prompt = f"""Turn this analysis into a practical production plan for one batch of {batch:,} units.

Product: {product}
{_answers(answers)}
Product breakdown: {_dump(analysis)}
Cost comparison: {_dump(cost)}
Businesses found nearby: {", ".join(supplier_names) or "none yet"}

Return:
- flow: 5 to 8 short step labels in order; mark the single most critical or capacity-limiting step with key=true.
- stats: 3 or 4 of: suggested batch, production time, first batch ready, and anything else decisive (e.g. a seasonal window). Each has a short value and a note.
- materials: quantities needed for this batch.
- machines: each machine and whether to buy, rent from a workshop, or outsource, with cost range if known.
- steps: 5 to 8 numbered actions covering setup (supply, equipment, registration) and the production run itself; each with when, detail and who. Name businesses from the list above where they fit, never invented ones.
- batch: {batch}. unit: the selling unit name.

Reply with JSON matching: {_schema(ProductionPlan)}
{RULES}"""
    return await llm.generate(prompt, ProductionPlan)


# --- Quote request --------------------------------------------------------------


class QuoteBrief(BaseModel):
    brief: str = Field(description="The request for quotation text, 2 to 4 sentences")
    attachments: list[str] = Field(description="Up to 3 short tags, e.g. 'Production plan attached', 'Reply by 10 Oct'")


async def quote_brief(
    llm: JsonModel,
    *,
    product: str,
    answers: Answers,
    analysis: ProductAnalysis,
    batch: int,
    location: str,
    reply_by: str,
) -> QuoteBrief:
    prompt = f"""Write a short request for quotation to send to local suppliers and workshops.

Product: {product}
{_answers(answers)}
Key specs from the analysis: {_dump(analysis)}
Batch: {batch:,} units. Collection or delivery near: {location}. Ask for replies by {reply_by}.

The brief must state the spec, the batch size, where, and ask for price per unit, minimum order
and lead time.

Reply with JSON matching: {_schema(QuoteBrief)}
{RULES}"""
    return await llm.generate(prompt, QuoteBrief)

