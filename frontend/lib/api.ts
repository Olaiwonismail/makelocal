import type { Answers, Project, ProjectCard, StageData, StageName } from "@/lib/types";

// Requests go through the Next route handler at app/api/[...path], which forwards
// them to the FastAPI backend.
const BASE = "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("Couldn't reach MakeLocal. Check your connection and try again.", 0, "network");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = typeof body?.detail === "string" ? body.detail : "Something went wrong. Try again.";
    throw new ApiError(detail, res.status, body?.code ?? "error");
  }
  return body as T;
}

export function createProject(product: string, image?: string) {
  return request<Project>("/projects", { method: "POST", body: JSON.stringify({ product, image }) });
}

export function getProject(id: string) {
  return request<Project>(`/projects/${encodeURIComponent(id)}`);
}

export function listProjects() {
  return request<ProjectCard[]>("/projects");
}

export function saveAnswers(id: string, answers: Answers) {
  return request<Project>(`/projects/${encodeURIComponent(id)}/answers`, {
    method: "PUT",
    body: JSON.stringify(answers),
  });
}

export function runStage<S extends StageName>(id: string, stage: S, refresh = false) {
  const query = refresh ? "?refresh=true" : "";
  return request<StageData[S]>(`/projects/${encodeURIComponent(id)}/stages/${stage}${query}`, { method: "POST" });
}
