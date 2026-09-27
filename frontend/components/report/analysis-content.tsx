"use client";

import { AnalysisTree } from "@/components/analysis-tree";
import { Card, Sources } from "@/components/report/ui";
import { StageFooter, StageView } from "@/components/stage-view";
import { withProject } from "@/lib/routes";
import type { ProductAnalysis } from "@/lib/types";

const usd = new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function costRange(low?: number | null, high?: number | null) {
  if (low == null && high == null) return "";
  if (low != null && high != null) return `${usd.format(low)} to ${usd.format(high)}`;
  return usd.format((low ?? high)!);
}

export function AnalysisContent({ projectId }: { projectId: string }) {
  return (
    <StageView projectId={projectId} stage="analysis" pad>
      {(analysis, reload) => (
        <>
          <div className="flex overflow-x-auto px-4 py-10 md:py-16">
            <AnalysisTree analysis={analysis} />
          </div>
          <div className="mx-auto w-full max-w-[1120px] px-4 pb-10 sm:px-12">
            <Details analysis={analysis} />
            <StageFooter
              next={{ href: withProject("/plan/cost", projectId) }}
              onRerun={() => reload(true)}
            />
          </div>
        </>
      )}
    </StageView>
  );
}

function Details({ analysis }: { analysis: ProductAnalysis }) {
  return (
    <div className="flex flex-col gap-6">
      {analysis.summary && <p className="max-w-[760px] text-[17px] leading-relaxed">{analysis.summary}</p>}

      {analysis.materials.length > 0 && (
        <Card title="Materials">
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[15px]">
              <thead>
                <tr className="border-b-2 border-ink text-[13px] text-muted">
                  <th scope="col" className="py-2 pr-4 font-semibold">Material</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Per unit</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Per batch</th>
                  <th scope="col" className="py-2 font-semibold">Where from</th>
                </tr>
              </thead>
              <tbody>
                {analysis.materials.map((m) => (
                  <tr key={m.name} className="border-b border-ink/15 align-top">
                    <th scope="row" className="py-3 pr-4 font-normal">
                      <span className="font-semibold">{m.name}</span>
                      {m.role && <span className="block text-[14px] text-ink/75">{m.role}</span>}
                    </th>
                    <td className="py-3 pr-4">{m.perUnit}</td>
                    <td className="py-3 pr-4">{m.perBatch}</td>
                    <td className="py-3 text-[14px] text-ink/85">{m.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {analysis.process.length > 0 && (
          <Card title="Process">
            <ol className="mt-4 flex flex-col gap-3">
              {analysis.process.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="font-display grid size-8 shrink-0 place-items-center rounded-full bg-ink text-[17px] font-bold text-sun"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    {step.detail && <p className="text-[15px] leading-relaxed text-ink/85">{step.detail}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        )}

        {analysis.equipment.length > 0 && (
          <Card title="Equipment">
            <dl className="mt-4">
              {analysis.equipment.map((e) => (
                <div
                  key={e.name}
                  className="flex items-baseline justify-between gap-4 border-b border-ink/15 py-3 text-[15px]"
                >
                  <dt>
                    {e.name}
                    {e.purpose && <span className="block text-[14px] text-ink/70">{e.purpose}</span>}
                  </dt>
                  <dd className="shrink-0 text-right font-semibold tabular-nums">
                    {costRange(e.costUsdLow, e.costUsdHigh)}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[13px] text-muted">Supplier price ranges, not quotes.</p>
          </Card>
        )}
      </div>

      {analysis.context.length > 0 && (
        <Card title="Why make it here">
          <ul className="mt-4 flex flex-col gap-2.5 text-[16px] leading-relaxed">
            {analysis.context.map((fact) => (
              <li key={fact} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 rounded-full bg-ink" />
                {fact}
              </li>
            ))}
          </ul>
          <Sources sources={analysis.sources} />
        </Card>
      )}
    </div>
  );
}
