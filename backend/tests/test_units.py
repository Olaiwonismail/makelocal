import pytest

from app.llm.client import extract_json
from app.models import Answers
from app.sources.geocode import distance_km
from app.stages.common import batch_size, looks_like_url


@pytest.mark.parametrize(
    "text",
    ['{"a": 1}', '```json\n{"a": 1}\n```', 'Here you go:\n{"a": 1}\nThanks'],
)
def test_extract_json(text):
    assert extract_json(text) == {"a": 1}


def test_extract_json_rejects_prose():
    with pytest.raises(ValueError):
        extract_json("no json here")


def test_batch_size():
    assert batch_size(Answers(exact_quantity=2500, quantity="Up to 100")) == 2500
    assert batch_size(Answers(quantity="100 to 1,000")) == 1000
    assert batch_size(Answers()) == 1000


def test_looks_like_url():
    assert looks_like_url("https://jumia.com.ng/chair")
    assert not looks_like_url("plastic chair")


def test_distance_lagos_to_kano():
    assert 700 < distance_km(6.5244, 3.3792, 12.0022, 8.5920) < 850
