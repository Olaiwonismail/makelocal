"""Quote request: draft a brief and line up recipients from the suppliers found.
Nothing is sent from here; the user copies the brief and sends it themselves."""

from datetime import date, timedelta

from app.llm import tasks
from app.models import CostComparison, ProductAnalysis, QuoteRequest, Recipient, SupplyChain
from app.stages.common import Context, Deps, batch_size

ORDER = ("Workshops", "Materials", "Services")
MAX_RECIPIENTS = 6
PRESELECT = 3


async def run(
    deps: Deps,
    ctx: Context,
    analysis: ProductAnalysis,
    suppliers: SupplyChain,
    cost: CostComparison | None,
) -> QuoteRequest:
    batch = batch_size(ctx.answers)
    reply_by = date.today() + timedelta(days=14)
    brief = await tasks.quote_brief(
        deps.require_llm(),
        product=ctx.product,
        answers=ctx.answers,
        analysis=analysis,
        batch=batch,
        location=suppliers.origin,
        reply_by=f"{reply_by.day} {reply_by:%b}",
    )

    by_group = {g.name: g.suppliers for g in suppliers.groups}
    recipients: list[Recipient] = []
    for group in ORDER:
        for s in by_group.get(group, []):
            if len(recipients) >= MAX_RECIPIENTS:
                break
            recipients.append(
                Recipient(
                    name=s.name,
                    kind=s.kind,
                    area=s.location,
                    distance_km=s.distance_km,
                    price=s.price,
                    selected=len(recipients) < PRESELECT,
                    phone=s.phone,
                    website=s.website,
                )
            )

    return QuoteRequest(
        product=ctx.product,
        currency=suppliers.currency,
        batch=batch,
        unit=cost.unit if cost else "unit",
        brief=brief.brief,
        attachments=brief.attachments[:3],
        recipients=recipients,
    )
