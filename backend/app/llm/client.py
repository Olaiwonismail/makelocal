"""The only place that talks to the model provider (Gemini API, serving Gemma).

Swap providers by replacing `GemmaClient` with anything that has the same
`generate(prompt, schema, image=...)` method.
"""

import json
import logging
import re
from typing import Protocol, TypeVar

from pydantic import BaseModel, ValidationError

log = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class LLMError(RuntimeError):
    pass


class JsonModel(Protocol):
    async def generate(self, prompt: str, schema: type[T], *, image: tuple[bytes, str] | None = None) -> T: ...


def extract_json(text: str) -> object:
    """Pull a JSON object out of a model reply that may be fenced or have prose around it."""
    text = text.strip()
    fenced = re.search(r"```(?:json)?\s*(.*?)```", text, re.S)
    if fenced:
        text = fenced.group(1).strip()
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end < start:
        raise ValueError("no JSON object in reply")
    return json.loads(text[start : end + 1])


class GemmaClient:
    def __init__(self, api_key: str, model: str):
        from google import genai
        from google.genai import types

        self._types = types
        self._client = genai.Client(api_key=api_key, http_options=types.HttpOptions(timeout=180_000))
        self.model = model
        # Some models reject JSON mode; we find out on the first call and fall back to parsing.
        self._json_mode = True

    async def generate(self, prompt: str, schema: type[T], *, image: tuple[bytes, str] | None = None) -> T:
        contents: list = [prompt]
        if image:
            data, mime = image
            contents.insert(0, self._types.Part.from_bytes(data=data, mime_type=mime))

        last_error: Exception | None = None
        for _ in range(2):
            text = await self._call(contents)
            try:
                return schema.model_validate(extract_json(text))
            except (ValueError, ValidationError) as e:
                last_error = e
                log.warning("model reply did not match %s: %s", schema.__name__, e)
                contents = [*contents[:-1], f"{prompt}\n\nYour previous reply was invalid ({e}). Reply again with only the JSON."]
        raise LLMError(f"The model did not return a usable {schema.__name__}: {last_error}")

    async def _call(self, contents: list) -> str:
        from google.genai import errors

        config = self._types.GenerateContentConfig(
            temperature=0.3,
            response_mime_type="application/json" if self._json_mode else None,
        )
        try:
            response = await self._client.aio.models.generate_content(model=self.model, contents=contents, config=config)
        except errors.ClientError as e:
            if self._json_mode and e.code == 400:
                log.info("JSON mode rejected by %s, retrying without it", self.model)
                self._json_mode = False
                return await self._call(contents)
            raise LLMError(f"Model request failed: {e.message or e}") from e
        except errors.APIError as e:
            raise LLMError(f"Model request failed: {e.message or e}") from e
        return response.text or ""
