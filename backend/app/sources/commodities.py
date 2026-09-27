"""World commodity prices via API Ninjas (previous day's settlement on the free plan)."""

from app.sources.http import DAY, CachedHttp

# Commodities API Ninjas covers that show up as manufacturing inputs.
KNOWN = {
    "aluminum": "aluminum", "aluminium": "aluminum", "copper": "copper", "cotton": "cotton",
    "sugar": "sugar", "wheat": "wheat", "corn": "corn", "maize": "corn", "soybean oil": "soybean_oil",
    "cocoa": "cocoa", "coffee": "coffee", "lumber": "lumber", "timber": "lumber", "crude oil": "crude_oil",
    "natural gas": "natural_gas", "rice": "rough_rice", "oat": "oat", "silver": "silver", "gold": "gold",
}


def match(material_name: str) -> str | None:
    name = material_name.lower()
    return next((code for term, code in KNOWN.items() if term in name), None)


async def price(http: CachedHttp, api_key: str, commodity: str) -> dict:
    data = await http.json(
        "GET",
        "https://api.api-ninjas.com/v1/commodityprice",
        params={"name": commodity},
        headers={"X-Api-Key": api_key},
        ttl=DAY,
    )
    return {"commodity": commodity, "price": data.get("price"), "unit": data.get("unit", ""), "source": "API Ninjas"}
