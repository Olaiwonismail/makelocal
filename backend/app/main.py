import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import projects
from app.config import Settings
from app.db import Store
from app.llm import GemmaClient, LLMError
from app.models import Answers, Project, ProjectCard, ProjectCreate, StageName
from app.pipeline import ProjectNotFound, run_stage
from app.sources.http import CachedHttp, SourceError
from app.stages.common import Deps, SourceUnavailable, StageInputError

logging.basicConfig(level=logging.INFO)


def build_deps(settings: Settings) -> Deps:
    store = Store(settings.db_path)
    llm = GemmaClient(settings.gemini_api_key, settings.model) if settings.gemini_api_key else None
    return Deps(store=store, http=CachedHttp(store), settings=settings, llm=llm)


def create_app(deps: Deps | None = None) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.deps = deps or build_deps(Settings.from_env())
        projects.seed_demo(app.state.deps)
        yield
        await app.state.deps.http.aclose()

    app = FastAPI(title="MakeLocal API", lifespan=lifespan)
    settings = deps.settings if deps else Settings.from_env()
    app.add_middleware(
        CORSMiddleware, allow_origins=settings.cors_origins, allow_methods=["*"], allow_headers=["*"]
    )

    def d(request: Request) -> Deps:
        return request.app.state.deps

    @app.exception_handler(StageInputError)
    async def _input(_: Request, e: StageInputError):
        return JSONResponse(status_code=400, content={"detail": str(e), "code": e.code})

    @app.exception_handler(SourceUnavailable)
    async def _unavailable(_: Request, e: SourceUnavailable):
        return JSONResponse(status_code=503, content={"detail": str(e), "code": "source_unavailable"})

    @app.exception_handler(LLMError)
    @app.exception_handler(SourceError)
    async def _upstream(_: Request, e: Exception):
        return JSONResponse(status_code=502, content={"detail": str(e), "code": "upstream"})

    @app.exception_handler(ProjectNotFound)
    async def _missing(_: Request, e: ProjectNotFound):
        return JSONResponse(status_code=404, content={"detail": "Project not found", "code": "not_found"})

    @app.get("/health")
    async def health(request: Request) -> dict[str, Any]:
        s = d(request).settings
        return {
            "model": s.model,
            "sources": {
                "gemini": bool(s.gemini_api_key),
                "serper": bool(s.serper_api_key),
                "tavily": bool(s.tavily_api_key),
                "firecrawl": bool(s.firecrawl_api_key),
                "exchangerate": bool(s.exchangerate_api_key),
                "apiNinjas": bool(s.api_ninjas_key),
            },
        }

    @app.post("/projects", response_model=Project)
    async def create_project(body: ProjectCreate, request: Request) -> Project:
        return await projects.create(d(request), body.product, body.image)

    @app.get("/projects", response_model=list[ProjectCard])
    async def list_projects(request: Request) -> list[ProjectCard]:
        deps = d(request)
        return [projects.card(deps, row) for row in deps.store.list_projects()]

    @app.get("/projects/{project_id}", response_model=Project)
    async def get_project(project_id: str, request: Request) -> Project:
        deps = d(request)
        row = deps.store.get_project(project_id)
        if row is None:
            raise ProjectNotFound(project_id)
        return projects.to_project(deps, row)

    @app.put("/projects/{project_id}/answers", response_model=Project)
    async def put_answers(project_id: str, answers: Answers, request: Request) -> Project:
        deps = d(request)
        row = deps.store.get_project(project_id)
        if row is None:
            raise ProjectNotFound(project_id)
        if Answers.model_validate_json(row["answers"]) != answers:
            deps.store.set_answers(project_id, answers)
            if not row["demo"]:
                # Everything after the intake depends on the answers.
                deps.store.clear_stages(project_id, keep=("follow_up",))
        return projects.to_project(deps, deps.store.get_project(project_id))

    @app.post("/projects/{project_id}/stages/{stage}")
    async def stage(project_id: str, stage: StageName, request: Request, refresh: bool = False) -> dict[str, Any]:
        return await run_stage(d(request), project_id, stage, refresh)

    return app


app = create_app()
