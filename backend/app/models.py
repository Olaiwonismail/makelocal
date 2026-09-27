"""API and pipeline schemas.

These mirror the frontend's `lib/types.ts`. Fields serialise as camelCase so the
frontend can use them as-is; Python code uses snake_case.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class Schema(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


StageName = Literal["follow_up", "analysis", "cost", "suppliers", "production", "quotes"]
STAGES: tuple[StageName, ...] = ("follow_up", "analysis", "cost", "suppliers", "production", "quotes")


class Source(Schema):
    title: str
    url: str | None = None


# --- Project and intake -------------------------------------------------------


class Answers(Schema):
    quantity: str = ""
    exact_quantity: int | None = None
    sell_in: str = ""
    make_in: str = ""
    match: str = ""
    follow_up: str = ""
    follow_up_text: str = ""


class ProjectCreate(Schema):
    product: str = ""
    # Optional photo as a data URL (data:image/jpeg;base64,...).
    image: str | None = None


class Project(Schema):
    id: str
    product: str
    input: str
    demo: bool
    answers: Answers
    stages: list[StageName]
    created_at: str


class ProjectCard(Schema):
    id: str
    product: str
    started: str
    units: int | None
    location: str
    stage: int
    status: str
    metric: "Metric"
    action: "CardAction"


class Metric(Schema):
    label: str
    # Either a money amount (formatted by the frontend) or plain text.
    amount: float | None = None
    currency: str | None = None
    unit: str | None = None
    text: str | None = None


class CardAction(Schema):
    label: str
    path: str


# --- Stage outputs ------------------------------------------------------------


class FollowUpQuestion(Schema):
    question: str
    hint: str
    options: list[str] = Field(min_length=2, max_length=6)


class AnalysisBranch(Schema):
    title: str
    items: list[str] = Field(min_length=1)


class Material(Schema):
    name: str
    role: str = ""
    per_unit: str = ""
    per_batch: str = ""
    source: str = ""


class ProcessStep(Schema):
    title: str
    detail: str = ""


class Equipment(Schema):
    name: str
    purpose: str = ""
    cost_usd_low: float | None = None
    cost_usd_high: float | None = None


class ProductAnalysis(Schema):
    product: str
    summary: str = ""
    branches: list[AnalysisBranch] = Field(min_length=1)
    materials: list[Material] = []
    process: list[ProcessStep] = []
    equipment: list[Equipment] = []
    context: list[str] = []
    sources: list[Source] = []


class CostLine(Schema):
    label: str
    per_unit: float
    basis: str
    # "sourced" when the figure comes from a looked-up price, "estimate" otherwise.
    kind: Literal["sourced", "estimate"] = "estimate"


class Reference(Schema):
    label: str
    value: str
    source: str = ""


class CostComparison(Schema):
    product: str
    unit: str = "unit"
    location: str
    currency: str
    units: int
    local: list[CostLine] = Field(min_length=1)
    imported: list[CostLine] = Field(min_length=1)
    verdict: str
    caveats: list[str] = []
    references: list[Reference] = []
    sources: list[Source] = []


class Price(Schema):
    label: str
    amount: float
    unit: str | None = None
    compact: bool = False
    basis: str = ""


SupplierGroupName = Literal["Materials", "Workshops", "Services"]


class Supplier(Schema):
    name: str
    kind: str
    location: str = ""
    distance_km: float | None = None
    lead_time: str | None = None
    capabilities: list[str] = []
    note: str = ""
    price: Price | None = None
    phone: str | None = None
    website: str | None = None
    rating: float | None = None


class SupplierGroup(Schema):
    name: SupplierGroupName
    noun: str
    description: str
    suppliers: list[Supplier] = []


class SupplyChain(Schema):
    product: str
    origin: str
    currency: str
    groups: list[SupplierGroup]
    sources: list[Source] = []


class FlowStep(Schema):
    label: str
    key: bool = False


class Stat(Schema):
    label: str
    value: str
    note: str = ""


class BatchMaterial(Schema):
    item: str
    quantity: str


class Machine(Schema):
    item: str
    source: str


class PlanStep(Schema):
    title: str
    when: str
    detail: str
    who: str


class ProductionPlan(Schema):
    product: str
    batch: int
    unit: str = "unit"
    flow: list[FlowStep] = Field(min_length=2)
    stats: list[Stat] = []
    materials: list[BatchMaterial] = []
    machines: list[Machine] = []
    steps: list[PlanStep] = []


class Recipient(Schema):
    name: str
    kind: str
    area: str = ""
    distance_km: float | None = None
    price: Price | None = None
    selected: bool = False
    phone: str | None = None
    website: str | None = None


class Quote(Schema):
    supplier: str
    note: str = ""
    per_unit: float | None = None
    min_order: int | None = None
    lead_time: str = ""
    terms: str = ""
    flat_total: float | None = None


class QuoteRequest(Schema):
    product: str
    currency: str
    batch: int
    unit: str = "unit"
    brief: str
    attachments: list[str] = []
    recipients: list[Recipient] = []
    quotes: list[Quote] = []


STAGE_MODELS: dict[StageName, type[Schema]] = {
    "follow_up": FollowUpQuestion,
    "analysis": ProductAnalysis,
    "cost": CostComparison,
    "suppliers": SupplyChain,
    "production": ProductionPlan,
    "quotes": QuoteRequest,
}

ProjectCard.model_rebuild()
