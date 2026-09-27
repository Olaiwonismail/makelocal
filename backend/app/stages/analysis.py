from app.llm import tasks
from app.models import ProductAnalysis
from app.stages.common import Context, Deps


async def run(deps: Deps, ctx: Context) -> ProductAnalysis:
    return await tasks.analysis(deps.require_llm(), ctx.product, ctx.answers)
