# MakeLocal

Tell MakeLocal what you want to make, or show it something you currently import, and it works out how to make it locally, what it will cost against importing, and who nearby can help.

## Run it

You need Node 20+ and [uv](https://docs.astral.sh/uv/).

```bash
./scripts/dev.sh
```

This starts the API on http://localhost:8000 and the web app on http://localhost:3000.

To run them separately:

```bash
cd backend && uv run uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

**No API keys needed for the demo.** Type "tomato paste" on the home page: every step is served from researched data in `backend/data/demo/tomato-paste.json`. The workspace also starts with that project partway through.

For any other product, set keys in `backend/.env` (copy `backend/.env.example`) or in your environment:

| Variable | Used for | Needed? |
|---|---|---|
| `GEMINI_API_KEY` | The model (Gemma 4 31B via the Gemini API) for every step | Yes, for live products |
| `SERPER_API_KEY` | Finding real businesses on Google Maps | For the supply chain step |
| `TAVILY_API_KEY` | Web search for prices, wages, power and duty rates | Recommended |
| `FIRECRAWL_API_KEY` | Reading product links and supplier websites | Optional |
| `EXCHANGERATE_API_KEY` | Exchange rates (falls back to the open endpoint) | Optional |
| `API_NINJAS_KEY` | World commodity prices for matching materials | Optional |

`GET http://localhost:8000/health` shows which sources are switched on.

## Deploy

See [DEPLOY.md](DEPLOY.md): API on Render (`render.yaml` blueprint), web app on Vercel, both free.

## How it works

Each step is its own module in `backend/app/stages/`, run through `POST /projects/{id}/stages/{stage}` and stored in SQLite so it never reruns unless asked:

1. **Follow-up**: the one question that most changes how the product is made.
2. **Analysis**: materials, process and equipment.
3. **Cost**: local vs import, per unit. Every line says where its number came from and whether it's sourced or an estimate.
4. **Suppliers**: real listings from Google Maps (Serper). Names, addresses, phones and distances come from the listing, never from the model.
5. **Production plan**: workflow, batch, timing, machines and steps.
6. **Quotes**: a request brief and who to send it to. Nothing is sent automatically; the user copies it or opens it in WhatsApp.

All prompts live in `backend/app/llm/tasks.py` and all model calls in `backend/app/llm/client.py`. Each external API has its own module in `backend/app/sources/`, and every response is cached in SQLite.

The web app (`frontend/`, Next.js 16) talks to the API through `frontend/app/api/[...path]/route.ts`, so there's no CORS setup. Set `API_URL` if the API isn't on `127.0.0.1:8000`.

## Tests

```bash
cd backend && uv run pytest
cd frontend && npm run lint && npm run build
```

Backend tests use stand-in API responses and a stand-in model, so they need no keys.
