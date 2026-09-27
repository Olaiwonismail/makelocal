import re
from dataclasses import dataclass

from app.config import Settings
from app.db import Store
from app.llm import JsonModel
from app.models import Answers
from app.sources.http import CachedHttp


class StageInputError(ValueError):
    """The user needs to provide something before this stage can run."""

    def __init__(self, message: str, code: str):
        super().__init__(message)
        self.code = code


class SourceUnavailable(RuntimeError):
    """A required API key isn't configured."""


@dataclass
class Deps:
    store: Store
    http: CachedHttp
    settings: Settings
    llm: JsonModel | None

    def require_llm(self) -> JsonModel:
        if self.llm is None:
            raise SourceUnavailable("Live analysis needs GEMINI_API_KEY. The tomato paste demo works without it.")
        return self.llm


@dataclass
class Context:
    product: str
    answers: Answers


PRESET_UNITS = {
    "just one to test": 1,
    "up to 100": 100,
    "100 to 1,000": 1000,
    "1,000 to 10,000": 10000,
    "more than 10,000": 20000,
}


def batch_size(answers: Answers) -> int:
    if answers.exact_quantity and answers.exact_quantity > 0:
        return answers.exact_quantity
    return PRESET_UNITS.get(answers.quantity.strip().lower(), 1000)


def make_in(answers: Answers) -> str:
    location = answers.make_in.strip()
    if not location:
        raise StageInputError("Tell us where you want it made so we can price it and find suppliers.", "needs_location")
    return location


def looks_like_url(text: str) -> bool:
    return bool(re.match(r"^https?://\S+$", text.strip()))
