"""SQLite storage: projects, their stage results, and a cache for external lookups."""

import json
import sqlite3
import time
import uuid
from datetime import datetime, timezone
from typing import Any

from app.models import Answers, StageName

SCHEMA = """
create table if not exists projects (
  id text primary key,
  product text not null,
  input text not null,
  demo integer not null default 0,
  answers text not null default '{}',
  created_at text not null
);
create table if not exists stages (
  project_id text not null references projects(id) on delete cascade,
  stage text not null,
  data text not null,
  created_at text not null,
  primary key (project_id, stage)
);
create table if not exists cache (
  key text primary key,
  value text not null,
  expires_at real not null
);
"""


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


class Store:
    def __init__(self, path: str):
        self.conn = sqlite3.connect(path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("pragma foreign_keys = on")
        self.conn.executescript(SCHEMA)

    # --- projects ---

    def create_project(self, product: str, input: str, demo: bool, answers: Answers | None = None) -> str:
        project_id = uuid.uuid4().hex[:12]
        with self.conn:
            self.conn.execute(
                "insert into projects (id, product, input, demo, answers, created_at) values (?, ?, ?, ?, ?, ?)",
                (project_id, product, input, int(demo), (answers or Answers()).model_dump_json(), now_iso()),
            )
        return project_id

    def get_project(self, project_id: str) -> sqlite3.Row | None:
        return self.conn.execute("select * from projects where id = ?", (project_id,)).fetchone()

    def list_projects(self) -> list[sqlite3.Row]:
        return self.conn.execute("select * from projects order by created_at desc").fetchall()

    def count_projects(self) -> int:
        return self.conn.execute("select count(*) from projects").fetchone()[0]

    def set_answers(self, project_id: str, answers: Answers) -> None:
        with self.conn:
            self.conn.execute(
                "update projects set answers = ? where id = ?", (answers.model_dump_json(), project_id)
            )

    # --- stage results ---

    def get_stage(self, project_id: str, stage: StageName) -> dict[str, Any] | None:
        row = self.conn.execute(
            "select data from stages where project_id = ? and stage = ?", (project_id, stage)
        ).fetchone()
        return json.loads(row["data"]) if row else None

    def put_stage(self, project_id: str, stage: StageName, data: dict[str, Any]) -> None:
        with self.conn:
            self.conn.execute(
                "insert or replace into stages (project_id, stage, data, created_at) values (?, ?, ?, ?)",
                (project_id, stage, json.dumps(data), now_iso()),
            )

    def stage_names(self, project_id: str) -> list[str]:
        rows = self.conn.execute("select stage from stages where project_id = ?", (project_id,)).fetchall()
        return [r["stage"] for r in rows]

    def clear_stages(self, project_id: str, keep: tuple[str, ...] = ()) -> None:
        placeholders = ",".join("?" * len(keep)) or "''"
        with self.conn:
            self.conn.execute(
                f"delete from stages where project_id = ? and stage not in ({placeholders})",
                (project_id, *keep),
            )

    # --- cache for external lookups ---

    def cache_get(self, key: str) -> Any | None:
        row = self.conn.execute("select value, expires_at from cache where key = ?", (key,)).fetchone()
        if not row or row["expires_at"] < time.time():
            return None
        return json.loads(row["value"])

    def cache_put(self, key: str, value: Any, ttl_seconds: float) -> None:
        with self.conn:
            self.conn.execute(
                "insert or replace into cache (key, value, expires_at) values (?, ?, ?)",
                (key, json.dumps(value), time.time() + ttl_seconds),
            )
