"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { StageLoader } from "@/components/stage-loader";
import type { ApiError } from "@/lib/api";
import { withProject } from "@/lib/routes";
import type { StageData, StageName } from "@/lib/types";
import { useStage } from "@/lib/use-stage";

export function StageView<S extends StageName>({
  projectId,
  stage,
  pad = false,
  children,
}: {
  projectId: string;
  stage: S;
  /** Wrap the loading and error states in page padding (for pages whose content is full-bleed). */
  pad?: boolean;
  children: (data: StageData[S], reload: (refresh?: boolean) => void) => ReactNode;
}) {
  const state = useStage(projectId, stage);
  const wrap = (node: ReactNode) =>
    pad ? <div className="w-full max-w-[1120px] px-4 py-10 sm:px-12 md:py-12">{node}</div> : node;
  if (state.status === "loading") return wrap(<StageLoader stage={stage} />);
  if (state.status === "error") {
    return wrap(<StageError error={state.error} projectId={projectId} onRetry={() => state.reload()} />);
  }
  return <div className="rise">{children(state.data, state.reload)}</div>;
}

export function StageError({
  error,
  projectId,
  onRetry,
}: {
  error: ApiError;
  projectId?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="rounded-xl border-2 border-ink bg-cream px-6 py-7 sm:px-8">
      <h2 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-bold">
        {error.code === "needs_location" ? "Where should it be made?" : "That didn't work"}
      </h2>
      <p className="mt-2 max-w-[640px] text-[16px] leading-relaxed text-ink/85">{error.message}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {error.code === "needs_location" && projectId ? (
          <Link
            href={withProject("/plan", projectId)}
            className="rounded-lg bg-ink px-5 py-3 text-[15px] font-semibold text-sun hover:bg-ink/90"
          >
            Add your location
          </Link>
        ) : error.code === "source_unavailable" ? (
          <Link href="/" className="rounded-lg bg-ink px-5 py-3 text-[15px] font-semibold text-sun hover:bg-ink/90">
            Try a demo instead
          </Link>
        ) : (
          onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-ink px-5 py-3 text-[15px] font-semibold text-sun hover:bg-ink/90"
            >
              Try again
            </button>
          )
        )}
      </div>
    </div>
  );
}

export function NoProject() {
  return (
    <div className="rounded-xl border-2 border-ink bg-cream px-6 py-7 sm:px-8">
      <h2 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-bold">No product selected</h2>
      <p className="mt-2 text-[16px] text-ink/85">Start with a product, or pick one up from your projects.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/" className="rounded-lg bg-ink px-5 py-3 text-[15px] font-semibold text-sun hover:bg-ink/90">
          New product
        </Link>
        <Link
          href="/projects"
          className="rounded-lg border-2 border-ink px-5 py-2.5 text-[15px] font-semibold hover:bg-cream"
        >
          My projects
        </Link>
      </div>
    </div>
  );
}

export function StageFooter({
  next,
  onRerun,
}: {
  next?: { href: string; label?: string };
  onRerun?: () => void;
}) {
  return (
    <div className="no-print mt-10 flex flex-wrap items-center justify-between gap-4">
      {onRerun ? (
        <button
          type="button"
          onClick={onRerun}
          className="px-1 py-2 text-[15px] font-medium underline underline-offset-4 hover:text-muted"
        >
          Run this step again
        </button>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={next.href}
          className="rounded-lg bg-ink px-7 py-3.5 text-[16px] font-semibold text-sun hover:bg-ink/90"
        >
          {next.label ?? "Next"}
        </Link>
      )}
    </div>
  );
}
