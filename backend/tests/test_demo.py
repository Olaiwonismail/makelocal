"""The researched demo must work with no API keys at all."""

from app.models import STAGES


def test_workspace_is_seeded_with_demo_project(keyless_client):
    cards = keyless_client.get("/projects").json()
    assert len(cards) == 1
    card = cards[0]
    assert card["product"].startswith("Tomato paste")
    assert card["stage"] == 3  # quotes in progress
    assert card["metric"] == {"label": "Saving vs import", "amount": 13.0, "currency": "NGN", "unit": "sachet",
                              "text": None}
    assert card["location"] == "Kano"
    assert card["units"] == 20000


def test_new_tomato_paste_project_uses_research_for_every_stage(keyless_client):
    project = keyless_client.post("/projects", json={"product": "tomato paste sachets"}).json()
    assert project["demo"] is True
    assert project["answers"]["makeIn"] == "Kano, Nigeria"
    for stage in STAGES:
        r = keyless_client.post(f"/projects/{project['id']}/stages/{stage}")
        assert r.status_code == 200, (stage, r.text)
    cost = keyless_client.post(f"/projects/{project['id']}/stages/cost").json()
    local = sum(l["perUnit"] for l in cost["local"])
    imported = sum(l["perUnit"] for l in cost["imported"])
    assert (local, imported) == (117, 130)


def test_live_product_without_key_explains_what_is_missing(keyless_client):
    project = keyless_client.post("/projects", json={"product": "Plastic chair"}).json()
    assert project["demo"] is False
    r = keyless_client.post(f"/projects/{project['id']}/stages/analysis")
    assert r.status_code == 503
    assert "GEMINI_API_KEY" in r.json()["detail"]


def test_empty_product_is_rejected(keyless_client):
    r = keyless_client.post("/projects", json={"product": "  "})
    assert r.status_code == 400
    assert r.json()["code"] == "empty"
