"use client";

import { Fragment } from "react";
import { card, cardHeading, sectionHeading } from "@/components/report/ui";
import { StageFooter, StageView } from "@/components/stage-view";
import { withProject } from "@/lib/routes";
import type { ProductionPlan } from "@/lib/types";

export function ProductionContent({ projectId }: { projectId: string }) {
  return (
    <StageView projectId={projectId} stage="production">
      {(plan, reload) => (
        <>
          <Plan plan={plan} />
          <StageFooter next={{ href: withProject("/plan/quotes", projectId) }} onRerun={() => reload(true)} />
        </>
      )}
    </StageView>
  );
}

function Plan({ plan }: { plan: ProductionPlan }) {
  const batch = plan.batch.toLocaleString("en");
  const unitPlural = plan.unit === "unit" ? "units" : `${plan.unit}s`;
  const statCols = plan.stats.length >= 4 ? "sm:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3";

  return (
    <>
      <p className="max-w-[700px] text-[17px] leading-relaxed text-ink/85">
        A working plan for one batch of {batch} {unitPlural} of {plan.product}. Hand this to a workshop or use it to run
        your own line.
      </p>

      <ol aria-label="Workflow" className={`${card} mt-9 flex flex-wrap items-center gap-y-3 px-6 py-6 sm:px-7`}>
        {plan.flow.map((step, i) => (
          <Fragment key={step.label}>
            {i > 0 && (
              <li aria-hidden="true" className="px-2.5">
                <ArrowIcon />
              </li>
            )}
            <li
              className={`font-display rounded-lg border-2 border-ink px-4 py-1.5 text-[24px] leading-tight font-bold ${
                step.key ? "bg-ink text-sun" : "bg-sun"
              }`}
            >
              {step.label}
              {step.key && <span className="sr-only"> (critical step)</span>}
            </li>
          </Fragment>
        ))}
      </ol>

      {plan.stats.length > 0 && (
        <dl className={`mt-8 grid gap-5 ${statCols}`}>
          {plan.stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`rounded-xl border-2 border-ink px-6 py-6 ${i === 0 ? "bg-ink text-cream" : "bg-cream"}`}
            >
              <dt className={`text-[14px] font-semibold ${i === 0 ? "text-cream/85" : "text-muted"}`}>{stat.label}</dt>
              <dd>
                <span
                  className={`font-display block text-[clamp(2.25rem,3.5vw,2.75rem)] leading-tight font-bold ${
                    i === 0 ? "text-sun" : ""
                  }`}
                >
                  {stat.value}
                </span>
                {stat.note && <span className="block text-[15px]">{stat.note}</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className={`${card} px-6 py-7 sm:px-8`}>
          <h2 className={cardHeading}>
            Materials for {batch} {unitPlural}
          </h2>
          <table className="mt-4 w-full text-left text-[16px]">
            <thead>
              <tr className="border-b-2 border-ink text-[14px] text-muted">
                <th scope="col" className="py-2 font-semibold">Item</th>
                <th scope="col" className="py-2 text-right font-semibold">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {plan.materials.map((m) => (
                <tr key={m.item} className="border-b border-ink/15">
                  <td className="py-3 pr-4">{m.item}</td>
                  <td className="py-3 text-right font-semibold whitespace-nowrap tabular-nums">{m.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={`${card} px-6 py-7 sm:px-8`}>
          <h2 className={cardHeading}>Machines needed</h2>
          <dl className="mt-4">
            {plan.machines.map((m) => (
              <div
                key={m.item}
                className="flex items-baseline justify-between gap-4 border-b border-ink/15 py-3 text-[16px]"
              >
                <dt>{m.item}</dt>
                <dd className="text-right text-[14px] font-semibold">{m.source}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <h2 className={`${sectionHeading} mt-12`}>Production steps</h2>
      <ol className="mt-6 flex flex-col gap-5">
        {plan.steps.map((step, i) => (
          <li key={step.title} className="flex gap-4 sm:gap-5">
            <span
              aria-hidden="true"
              className="font-display grid size-12 shrink-0 place-items-center rounded-full bg-ink text-[26px] font-bold text-sun sm:size-14"
            >
              {i + 1}
            </span>
            <div className={`${card} min-w-0 flex-1 px-6 py-5`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-display text-[clamp(1.625rem,2.5vw,1.875rem)] leading-tight font-bold">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <span className="text-[14px] font-semibold text-muted">{step.when}</span>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/85">{step.detail}</p>
              <p className="mt-2 text-[14px] font-semibold text-muted">Who: {step.who}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 28 16" width="26" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8h23M19 2l6 6-6 6" />
    </svg>
  );
}
