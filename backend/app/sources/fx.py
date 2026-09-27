"""Exchange rates via ExchangeRate-API (keyed endpoint if a key is set, open endpoint otherwise)."""

from app.sources.http import DAY, CachedHttp, SourceError

# ISO country code -> currency, for the markets MakeLocal targets first. Unknown -> USD.
CURRENCIES = {
    "NG": "NGN", "GH": "GHS", "KE": "KES", "ZA": "ZAR", "EG": "EGP", "ET": "ETB", "TZ": "TZS",
    "UG": "UGX", "RW": "RWF", "SN": "XOF", "CI": "XOF", "BJ": "XOF", "TG": "XOF", "ML": "XOF",
    "BF": "XOF", "NE": "XOF", "CM": "XAF", "GA": "XAF", "CG": "XAF", "TD": "XAF", "CF": "XAF",
    "MA": "MAD", "TN": "TND", "DZ": "DZD", "ZM": "ZMW", "ZW": "USD", "MW": "MWK", "MZ": "MZN",
    "AO": "AOA", "BW": "BWP", "NA": "NAD", "SL": "SLE", "LR": "LRD", "GM": "GMD", "SD": "SDG",
    "CD": "CDF", "MG": "MGA", "MU": "MUR", "IN": "INR", "PK": "PKR", "BD": "BDT", "ID": "IDR",
    "PH": "PHP", "VN": "VND", "BR": "BRL", "MX": "MXN", "US": "USD", "GB": "GBP", "CN": "CNY",
}


def currency_for(country_code: str) -> str:
    return CURRENCIES.get(country_code.upper(), "USD")


async def usd_rate(http: CachedHttp, currency: str, api_key: str = "") -> tuple[float, str]:
    """Units of `currency` per 1 USD, and where the rate came from."""
    if currency == "USD":
        return 1.0, "USD"
    if api_key:
        url = f"https://v6.exchangerate-api.com/v6/{api_key}/latest/USD"
        data = await http.json("GET", url, cache_url="exchangerate-api:latest/USD", ttl=DAY)
        rates, source = data.get("conversion_rates", {}), "ExchangeRate-API"
    else:
        data = await http.json("GET", "https://open.er-api.com/v6/latest/USD", ttl=DAY)
        rates, source = data.get("rates", {}), "ExchangeRate-API (open access)"
    if currency not in rates:
        raise SourceError(f"No exchange rate for {currency}")
    return float(rates[currency]), source
