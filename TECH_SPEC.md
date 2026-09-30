# MakeLocal: Technical Spec and Budget

## 1. What it does

A user names a product (text, photo or link). MakeLocal returns six steps: product analysis, cost vs import, verdict, local suppliers, production plan and a quote request to send.

## 2. Architecture

```
Browser ──> Web app (Next.js, Vercel) ──/api──> API (FastAPI, Render) ──> SQLite
                                                   │
                                                   ├─> Gemma 4 31B (Gemini API)
                                                   └─> Data APIs (Serper, Tavily, Firecrawl, FX, commodities, maps)
```

- **Web app** shows the pages and forwards `/api/*` to the API.
- **API** runs the steps, one module each, and saves every result.
- **SQLite** stores projects, step results and a cache of every outside lookup.

## 3. Stack

| Part | Choice |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Python 3.11, FastAPI, Pydantic |
| Database | SQLite |
| AI model | Gemma 4 31B via the Gemini API |
| Hosting | Vercel (web), Render (API) |
| Tests | pytest (22 tests), ESLint, TypeScript |

## 4. The steps

| Step | Input | Uses | Output |
|---|---|---|---|
| Follow-up | Product | AI | One question with answer options |
| Analysis | Product, answers | AI | Materials, process, machines |
| Cost | Analysis, location | FX, web search, commodity prices, AI | Per-unit cost, local vs import, each line tagged Sourced or Estimate |
| Suppliers | Analysis, location | Google Maps (Serper), websites (Firecrawl), AI | Real businesses with distance and phone |
| Plan | All of the above | AI | Workflow, batch, timing, steps |
| Quotes | Suppliers, plan | AI | Draft brief and recipients (never sent automatically) |

Each step runs once, is saved, and can be rerun on its own.

## 5. Data sources

| Source | Used for | Free tier |
|---|---|---|
| Gemini API (Gemma 4 31B) | Every AI step | Free |
| Serper | Businesses from Google Maps | 2,500 searches, one-time |
| Tavily | Prices, wages, power, duties | 1,000 credits/month |
| Firecrawl | Product links, supplier websites | 1,000 credits/month |
| ExchangeRate-API | Exchange rates | 1,500 requests/month |
| API Ninjas | World commodity prices | Free plan |
| OpenStreetMap Nominatim | Place to coordinates | Free |

## 6. API

| Method | Path | Does |
|---|---|---|
| GET | `/health` | Model name and which sources are on |
| POST | `/projects` | Create a project from text, link or photo |
| GET | `/projects` | List projects |
| GET | `/projects/{id}` | One project |
| PUT | `/projects/{id}/answers` | Save the intake answers |
| POST | `/projects/{id}/stages/{stage}` | Run or fetch a step (`?refresh=true` reruns it) |

## 7. Rules

- Every cost says where it came from. Guesses are labelled Estimate.
- Supplier names, addresses, phones and distances come from the listing, never from the AI.
- Nothing is sent to a supplier without the user.
- API keys live in environment variables, never in code.
- The tomato paste demo runs from researched data with no API keys.

## 8. Known limits

- No accounts: everyone sees the same project list.
- On Render's free tier, data resets when the server restarts.
- Supplier coverage depends on Google Maps. Only the demo has a hand-checked list.
- No profit calculation, payments, order tracking or supplier-managed listings.

---

## 9. Budget

### Now (hackathon): $0 / month

Everything runs on free tiers. Limits: the API sleeps after 15 minutes idle, data resets on restart, and Serper's 2,500 searches are one-time.

### Pilot: about $90 / month (about ₦125,000)

Sized for about **300 new product analyses a month**. Each uses roughly 10 map searches, 8 web searches and 5 page reads.

| Item | Plan | $/month |
|---|---|---|
| API hosting | Render Starter, always on | 7 |
| Saved data | Render disk, 5 GB | 1 |
| Web hosting | Vercel Pro (needed for commercial use) | 20 |
| AI model | Gemma 4 31B, Gemini API | 0 |
| Business search | Serper, $50 per 50,000 searches, lasts 6 months | 9 |
| Web search | Tavily Project, 4,000 credits | 30 |
| Page reading | Firecrawl Hobby, 5,000 credits | 19 |
| Exchange rates, commodities, maps | Free tiers | 0 |
| Domain | About $15 a year | 1 |
| **Total** | | **≈ 87** |

Naira at ₦1,390 per $1. Prices checked September 2026; confirm before paying.

### What moves the budget

- **More users:** Tavily and Firecrawl grow first. Caching means a repeat product costs almost nothing.
- **Accounts and saved projects:** the Render disk covers it at pilot size; a hosted Postgres adds about $7–20 a month later.
- **A paid AI model:** if Gemma's free tier stops being enough, budget roughly $10–50 a month at pilot volume.
