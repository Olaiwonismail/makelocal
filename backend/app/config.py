import os
from dataclasses import dataclass, field
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent


def _load_dotenv() -> None:
    """Read backend/.env for local runs. Real environment variables win."""
    path = BACKEND_DIR / ".env"
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str = ""
    serper_api_key: str = ""
    tavily_api_key: str = ""
    firecrawl_api_key: str = ""
    exchangerate_api_key: str = ""
    api_ninjas_key: str = ""
    model: str = "gemma-4-31b-it"
    db_path: str = str(BACKEND_DIR / "makelocal.db")
    cors_origins: list[str] = field(default_factory=lambda: ["http://localhost:3000"])

    @classmethod
    def from_env(cls) -> "Settings":
        _load_dotenv()
        env = os.environ.get
        return cls(
            gemini_api_key=env("GEMINI_API_KEY", ""),
            serper_api_key=env("SERPER_API_KEY", ""),
            tavily_api_key=env("TAVILY_API_KEY", ""),
            firecrawl_api_key=env("FIRECRAWL_API_KEY", ""),
            exchangerate_api_key=env("EXCHANGERATE_API_KEY", ""),
            api_ninjas_key=env("API_NINJAS_KEY", ""),
            model=env("MAKELOCAL_MODEL", "gemma-4-31b-it"),
            db_path=env("MAKELOCAL_DB", str(BACKEND_DIR / "makelocal.db")),
            cors_origins=[o for o in env("MAKELOCAL_CORS", "http://localhost:3000").split(",") if o],
        )
