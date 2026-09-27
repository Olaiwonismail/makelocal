"""Runs a stage for a project: returns the stored result, or computes it (running any
prerequisite stages first) and stores it. Demo projects are served from the fixture."""

import asyncio
from collections import defaultdict
from typing import Any

from app import demo
from app.models import (
    Answers,
    CostComparison,
    ProductAnalysis,
    StageName,
    SupplyChain,
)
from app.stages import analysis, cost, follow_up, production, quotes, suppliers
from app.stages.common import Context, Deps


class ProjectNotFound(LookupError):
    pass


_locks: defaultdict[tuple[str, str], asyncio.Lock] = defaultdict(asyncio.Lock)


async def run_stage(deps: Deps, project_id: str, stage: StageName, refresh: bool = False) -> dict[str, Any]:
    row = deps.store.get_project(project_id)
    if row is None:
        raise ProjectNotFound(project_id)

    async with _locks[(project_id, stage)]:
        if not refresh:
            stored = deps.store.get_stage(project_id, stage)
            if stored is not None:
                return stored

        if row["demo"]:
            fixture = demo.match(row["product"]) or demo.match(row["input"])
            if fixture:
                data = demo.stage(fixture, stage)
                deps.store.put_stage(project_id, stage, data)
                return data

        ctx = Context(product=row["product"], answers=Answers.model_validate_json(row["answers"]))
        result = await _compute(deps, project_id, stage, ctx)
        data = result.model_dump(by_alias=True)
        deps.store.put_stage(project_id, stage, data)
        return data


async def _get(deps: Deps, project_id: str, stage: StageName, model: type, required: bool):
    stored = deps.store.get_stage(project_id, stage)
    if stored is None and required:
        stored = await run_stage(deps, project_id, stage)
    return model.model_validate(stored) if stored is not None else None


async def _compute(deps: Deps, project_id: str, stage: StageName, ctx: Context):
    if stage == "follow_up":
        return await follow_up.run(deps, ctx)
    if stage == "analysis":
        return await analysis.run(deps, ctx)

    base = await _get(deps, project_id, "analysis", ProductAnalysis, required=True)
    if stage == "cost":
        return await cost.run(deps, ctx, base)
    if stage == "suppliers":
        return await suppliers.run(deps, ctx, base)

    priced = await _get(deps, project_id, "cost", CostComparison, required=False)
    if stage == "production":
        found = await _get(deps, project_id, "suppliers", SupplyChain, required=False)
        return await production.run(deps, ctx, base, priced, found)
    if stage == "quotes":
        found = await _get(deps, project_id, "suppliers", SupplyChain, required=True)
        return await quotes.run(deps, ctx, base, found, priced)
    raise ValueError(f"unknown stage {stage}")
