"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StageLoader } from "@/components/stage-loader";
import { StageError } from "@/components/stage-view";
import { ApiError, listProjects } from "@/lib/api";
import { moneyFormat, shortDate } from "@/lib/format";
import { withProject } from "@/lib/routes";
import type { ProjectCard } from "@/lib/types";

const projectStages = ["Analysis", "Costing", "Suppliers", "Quotes", "Production"];

export function ProjectsList() {
  const [state, setState] = useState<{ projects?: ProjectCard[]; error?: ApiError }>({});

  useEffect(() => {
    let cancelled = false;
    listProjects().then(
      (projects) => !cancelled && setState({ projects }),
      (error: ApiError) => !cancelled && setState({ error }),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.error) return <div className="mt-9"><StageError error={state.error} /></div>;
  if (!state.projects) {
    return (
      <div className="mt-9">
        <StageLoader stage="create" compact />
      </div>
    );
  }

  const count = state.projects.length;
  return (
    <>
      <p className="mt-4 text-[17px] text-ink/85">
        {count === 0
          ? "Nothing here yet. Start with something you currently import."
          : `${count} ${count === 1 ? "product" : "products"} in progress. Pick up wherever you left off.`}
      </p>
      <ul className="mt-9 flex flex-col gap-5">
        {state.projects.map((p) => (
          <Card key={p.id} project={p} />
        ))}
      </ul>
    </>
  );
}

function metricValue(m: ProjectCard["metric"]) {
  if (m.amount != null && m.currency) return `${moneyFormat(m.currency).format(m.amount)}${m.unit ? `/${m.unit}` : ""}`;
  return m.text ?? "";
}

function Card({ project: p }: { project: ProjectCard }) {
  const meta = [
    `Started ${shortDate(p.started)}`,
    p.units ? `${p.units.toLocaleString("en")} units` : "",
    p.location,
  ].filter(Boolean);

  return (
    <li className="flex flex-col gap-6 rounded-xl border-2 border-ink bg-cream px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="font-display text-[clamp(2rem,3.5vw,2.5rem)] leading-tight font-bold first-letter:uppercase">
            {p.product}
          </h2>
          <span className="text-[15px] text-ink/80">{meta.join(" · ")}</span>
        </div>
        <ol aria-label="Progress" className="mt-4 grid grid-cols-5 gap-2 sm:gap-2.5">
          {projectStages.map((stage, i) => {
            const done = i < p.stage;
            const current = i === p.stage;
            return (
              <li key={stage} aria-current={current ? "step" : undefined}>
                <span
                  className={`block h-2.5 rounded-full border-[1.5px] border-ink ${done || current ? "bg-ink" : ""}`}
                />
                <span
                  className={`mt-2 flex items-center gap-2 text-[13px] sm:text-[15px] ${
                    current ? "font-semibold" : done ? "" : "text-muted"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`hidden size-5 shrink-0 rounded-full border-[1.5px] border-ink sm:block ${
                      done ? "bg-ink" : current ? "bg-sun" : ""
                    }`}
                  />
                  <span className="truncate">{stage}</span>
                  <span className="sr-only">{done ? "(done)" : current ? "(in progress)" : "(not started)"}</span>
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-[15px] text-ink/85">{p.status}</p>
      </div>

      <div className="flex shrink-0 flex-col lg:w-[230px]">
        <p className="text-[14px] font-semibold text-muted">{p.metric.label}</p>
        <p className="font-display text-[clamp(1.875rem,3vw,2.25rem)] leading-tight font-bold">{metricValue(p.metric)}</p>
        <Link
          href={withProject(p.action.path, p.id)}
          className="mt-3 rounded-lg bg-ink px-4 py-3 text-center text-[16px] font-semibold text-sun hover:bg-ink/90"
        >
          {p.action.label}
        </Link>
      </div>
    </li>
  );
}
