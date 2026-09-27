from app.llm import tasks
from app.models import CostComparison, ProductAnalysis, ProductionPlan, SupplyChain
from app.stages.common import Context, Deps, batch_size


async def run(
    deps: Deps,
    ctx: Context,
    analysis: ProductAnalysis,
    cost: CostComparison | None,
    suppliers: SupplyChain | None,
) -> ProductionPlan:
    batch = batch_size(ctx.answers)
    names = [s.name for g in suppliers.groups for s in g.suppliers] if suppliers else []
    plan = await tasks.production(
        deps.require_llm(),
        product=ctx.product,
        answers=ctx.answers,
        analysis=analysis,
        cost=cost,
        supplier_names=names,
        batch=batch,
    )
    plan.batch = batch
    if cost:
        plan.unit = cost.unit
    return plan
