// Forwards /api/* to the FastAPI backend, so the browser never needs CORS or the
// backend's address. Pipeline stages can take a minute; fetch here has no short timeout.
const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";

// Seconds. Live research steps can take a minute or more; hosts like Vercel read this.
export const maxDuration = 300;

async function forward(request: Request, ctx: RouteContext<"/api/[...path]">) {
  const { path } = await ctx.params;
  const { search } = new URL(request.url);
  const target = `${API_URL}/${path.map(encodeURIComponent).join("/")}${search}`;
  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const res = await fetch(target, {
      method: request.method,
      headers: { "content-type": request.headers.get("content-type") ?? "application/json" },
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });
    return new Response(res.body, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return Response.json(
      {
        detail: "The MakeLocal API isn't running. Start it from backend/ with: uvicorn app.main:app --port 8000",
        code: "api_offline",
      },
      { status: 503 },
    );
  }
}

export { forward as GET, forward as POST, forward as PUT };
