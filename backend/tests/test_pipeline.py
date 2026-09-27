"""Live pipeline with stand-in APIs and model."""

from app.llm import tasks


def new_project(client, product="Plastic chair", make_in="Kano, Nigeria", quantity=1000):
    project = client.post("/projects", json={"product": product}).json()
    answers = {"exactQuantity": quantity, "makeIn": make_in, "sellIn": "Across my country"}
    client.put(f"/projects/{project['id']}/answers", json=answers)
    return project["id"]


def stage(client, pid, name, **params):
    return client.post(f"/projects/{pid}/stages/{name}", params=params)


def test_cost_uses_looked_up_location_currency_and_evidence(live_client, fake_llm):
    pid = new_project(live_client)
    cost = stage(live_client, pid, "cost").json()
    # Overridden from lookups, whatever the model said.
    assert cost["currency"] == "NGN"
    assert cost["location"] == "Kano"
    assert cost["units"] == 1000
    prompt = next(p for name, p in fake_llm.prompts if name == "CostComparison")
    assert "1 USD = 1,390.00 NGN" in prompt
    assert "[1] Result for" in prompt
    # Analysis ran first as a prerequisite, exactly once.
    assert [n for n, _ in fake_llm.prompts].count("ProductAnalysis") == 1


def test_stage_results_are_stored_and_reused(live_client, fake_llm):
    pid = new_project(live_client)
    stage(live_client, pid, "analysis")
    stage(live_client, pid, "analysis")
    assert [n for n, _ in fake_llm.prompts].count("ProductAnalysis") == 1
    stage(live_client, pid, "analysis", refresh="true")
    assert [n for n, _ in fake_llm.prompts].count("ProductAnalysis") == 2


def test_suppliers_keep_listing_facts_and_drop_bad_picks(live_client):
    pid = new_project(live_client)
    chain = stage(live_client, pid, "suppliers").json()
    groups = {g["name"]: g["suppliers"] for g in chain["groups"]}
    material = groups["Materials"][0]
    assert material["name"] == "Northern Polymers"
    assert material["phone"] == "+234 800 000 0001"
    assert material["location"] == "Sharada Industrial Estate, Kano"
    assert 0 < material["distanceKm"] < 20
    assert groups["Workshops"][0]["name"] == "Kano Moulding Works"
    assert groups["Services"] == []  # the out-of-range pick was ignored
    assert chain["currency"] == "NGN"


def test_quotes_draft_brief_and_preselect_recipients(live_client):
    pid = new_project(live_client)
    quotes = stage(live_client, pid, "quotes").json()
    assert quotes["brief"] == "Quote 1,000 chairs."
    assert [r["name"] for r in quotes["recipients"]] == ["Kano Moulding Works", "Northern Polymers"]
    assert all(r["selected"] for r in quotes["recipients"])
    assert quotes["quotes"] == []  # nothing is sent, so there are no replies


def test_production_batch_comes_from_answers(live_client):
    pid = new_project(live_client, quantity=2500)
    plan = stage(live_client, pid, "production").json()
    assert plan["batch"] == 2500


def test_cost_needs_a_location(live_client):
    pid = new_project(live_client, make_in="")
    r = stage(live_client, pid, "cost")
    assert r.status_code == 400
    assert r.json()["code"] == "needs_location"


def test_changing_answers_clears_downstream_stages(live_client):
    pid = new_project(live_client)
    stage(live_client, pid, "follow_up")
    stage(live_client, pid, "analysis")
    live_client.put(f"/projects/{pid}/answers", json={"exactQuantity": 50, "makeIn": "Kano, Nigeria"})
    assert live_client.get(f"/projects/{pid}").json()["stages"] == ["follow_up"]


def test_product_link_is_read_and_identified(live_client, fake_llm):
    project = live_client.post("/projects", json={"product": "https://shop.example/chair"}).json()
    assert project["product"] == "Plastic garden chair"
    prompt = next(p for name, p in fake_llm.prompts if name == "ProductIdentity")
    assert "We sell HDPE" in prompt


def test_bad_photo_is_rejected(live_client):
    r = live_client.post("/projects", json={"product": "", "image": "data:text/plain;base64,aGk="})
    assert r.status_code == 400


def test_photo_is_identified(live_client):
    image = "data:image/png;base64,iVBORw0KGgo="
    project = live_client.post("/projects", json={"product": "", "image": image}).json()
    assert project["product"] == "Plastic garden chair"
    assert project["input"] == "photo"
