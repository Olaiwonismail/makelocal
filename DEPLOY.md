# Deploying MakeLocal

Two pieces, both on free tiers:

| Piece | Where | Why |
|---|---|---|
| API (`backend/`, FastAPI) | [Render](https://render.com) | Runs Python, free web service, deploys from `render.yaml` |
| Web app (`frontend/`, Next.js) | [Vercel](https://vercel.com) | Made by the Next.js team, zero config |

The web app calls the API through its own `/api` route, so you only need to tell the web app where the API lives (`API_URL`). No CORS setup.

Total time: about 15 minutes. Deploy the API first, because the web app needs its URL.

## 1. API on Render

1. Sign in at https://dashboard.render.com with GitHub.
2. **New → Blueprint**, pick the `makelocal` repo and the `master` branch. Render reads `render.yaml` and creates `makelocal-api`.
3. It asks for the environment variables marked in the blueprint. Paste your keys:
   - `GEMINI_API_KEY` (required for any product other than the tomato paste demo)
   - `SERPER_API_KEY`, `TAVILY_API_KEY`, `FIRECRAWL_API_KEY`, `EXCHANGERATE_API_KEY`, `API_NINJAS_KEY` (leave any you don't have blank)
4. **Apply**. The first build takes a few minutes.
5. Open `https://<your-service>.onrender.com/health`. You should see the model name and which sources are on (`true`). Copy the base URL, without `/health`.

If you'd rather click through manually: **New → Web Service**, root directory `backend`, build command `pip install uv && uv sync --frozen --no-dev`, start command `uv run --no-dev uvicorn app.main:app --host 0.0.0.0 --port $PORT`, then add the same environment variables.

## 2. Web app on Vercel

1. Sign in at https://vercel.com with GitHub.
2. **Add New → Project**, import the `makelocal` repo.
3. Set **Root Directory** to `frontend`. Vercel detects Next.js.
4. Under **Environment Variables** add `API_URL` = your Render URL from step 1 (e.g. `https://makelocal-api.onrender.com`, no trailing slash).
5. **Deploy**. Under **Settings → Git**, make sure the production branch is `master`.

Open the Vercel URL, type "tomato paste" and click through. That path works even with no API keys.

## Before you demo

- **Wake the API.** Render's free tier sleeps after 15 minutes without traffic, and the first request after that takes about a minute. Open `/health` a couple of minutes before presenting.
- **Data resets on restart.** SQLite lives on Render's temporary disk, so saved projects and the lookup cache disappear when the service restarts or redeploys. The tomato paste demo project is re-created automatically on startup. To keep data, add a Render persistent disk (paid) and set `MAKELOCAL_DB` to a path on it, e.g. `/var/data/makelocal.db`.
- **Long steps.** Live cost and supplier research can take a minute. The `/api` route allows up to 300 seconds (`maxDuration`); if your Vercel plan caps functions lower, a slow step can time out: press "Try again" and it usually finishes from cache.
- **API usage.** Serper's free credits are one-time (2,500). Every lookup is cached, so re-opening a page costs nothing, but each new product uses roughly 5 to 10 searches.

## Updating

Push to `master`. Render and Vercel both redeploy automatically.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Page says "The MakeLocal API isn't running" | `API_URL` on Vercel is missing or wrong, or Render is still waking up. Check `<API_URL>/health` in a browser. |
| "Live analysis needs GEMINI_API_KEY" | Add the key in Render → your service → Environment, then **Manual Deploy**. |
| Supplier step says it needs `SERPER_API_KEY` | Same as above, for Serper. |
| Render build fails on Python version | Make sure `PYTHON_VERSION` is `3.11` in the service's environment. |
