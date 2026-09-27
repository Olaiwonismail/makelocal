from app.llm import tasks
from app.models import FollowUpQuestion
from app.stages.common import Context, Deps


async def run(deps: Deps, ctx: Context) -> FollowUpQuestion:
    return await tasks.follow_up(deps.require_llm(), ctx.product)
