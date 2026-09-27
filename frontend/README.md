# MakeLocal web app

Next.js 16 app. See the [root README](../README.md) for how to run everything.

```bash
npm install
npm run dev     # http://localhost:3000, expects the API on :8000
npm run lint
npm run build
```

- `app/`: pages. `/` home, `/plan` intake questions, `/plan/*` report sections, `/projects` workspace.
- `app/api/[...path]/route.ts`: forwards `/api/*` to the FastAPI backend (`API_URL`, default `http://127.0.0.1:8000`).
- `components/report/`: the content of each report section, loaded per project with a loading animation.
- `lib/types.ts`: mirrors `backend/app/models.py`. `lib/api.ts`: API client.
