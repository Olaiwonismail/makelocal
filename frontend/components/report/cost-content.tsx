"use client";

import type { ReactNode } from "react";
import { Card, Sources } from "@/components/report/ui";
import { StageFooter, StageView } from "@/components/stage-view";
import { moneyFormat } from "@/lib/format";
import { withProject } from "@/lib/routes";
import type { CostComparison, CostLine } from "@/lib/types";

const total = (lines: CostLine[]) => lines.reduce((sum, l) => sum + l.perUnit, 0);

export function CostContent({ projectId }: { projectId: string }) {
  return (
    <StageView projectId={projectId} stage="cost">
      {(cost, reload) => (
        <>
          <Comparison cost={cost} />
          <StageFooter next={{ href: withProject("/plan/suppliers", projectId) }} onRerun={() => reload(true)} />
        </>
      )}
    </StageView>
  );
}

function Comparison({ cost }: { cost: CostComparison }) {
  const money = moneyFormat(cost.currency);
  const compact = moneyFormat(cost.currency, true);
  const units = cost.units.toLocaleString("en");
  const per = `/${cost.unit}`;

  const localTotal = total(cost.local);
  const importTotal = total(cost.imported);
  const saving = importTotal - localTotal;
  const localIsCheaper = saving >= 0;
  const percent = new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 }).format(
    importTotal ? Math.abs(saving) / importTotal : 0,
  );

  return (
    <>
      <p className="max-w-[700px] text-[17px] leading-relaxed text-ink/85">
        Cost breakdown for producing {units} {cost.unit === "unit" ? "units" : `${cost.unit}s`} of {cost.product} near{" "}
        {cost.location} versus importing. Hover or read under each line for where the number comes from.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <CostCard title="Local Production" lines={cost.local} format={money.format} dark>
          <span>Estimated total</span>
          <span className="font-display text-[clamp(2rem,4vw,2.625rem)] leading-none font-bold">
            {money.format(localTotal)}
            {per}
          </span>
        </CostCard>
        <CostCard title="Import" lines={cost.imported} format={money.format}>
          <span>Estimated landed cost</span>
          <span className="font-display text-[clamp(2rem,4vw,2.625rem)] leading-none font-bold">
            {money.format(importTotal)}
            {per}
          </span>
        </CostCard>
      </div>

      <section className="mt-8 rounded-xl border-2 border-ink bg-cream px-6 py-8 shadow-[8px_8px_0_0_var(--color-ink)] sm:px-9">
        <h2 className="font-display text-[clamp(2.25rem,4vw,2.75rem)] leading-none font-bold">Local vs Import</h2>
        <dl className="mt-6 grid gap-6 sm:grid-cols-3">
          <Stat
            label={localIsCheaper ? `You save per ${cost.unit}` : `Importing saves per ${cost.unit}`}
            value={money.format(Math.abs(saving))}
          />
          <Stat
            label="That's"
            value={percent}
            note={localIsCheaper ? "cheaper to produce locally" : "cheaper to import"}
          />
          <Stat
            label={`On ${units} ${cost.unit === "unit" ? "units" : `${cost.unit}s`}`}
            value={compact.format(Math.abs(saving) * cost.units)}
            note={localIsCheaper ? "total savings" : "extra cost of making it here"}
          />
        </dl>
        <p className="mt-7 max-w-[800px] text-[16px] leading-relaxed">{cost.verdict}</p>
      </section>

      {(cost.caveats.length > 0 || cost.references.length > 0) && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {cost.caveats.length > 0 && (
            <Card title="Watch out for">
              <ul className="mt-4 flex flex-col gap-3 text-[15px] leading-relaxed">
                {cost.caveats.map((c) => (
                  <li key={c} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-ink" />
                    {c}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {cost.references.length > 0 && (
            <Card title="Price references">
              <dl className="mt-4">
                {cost.references.map((r) => (
                  <div key={r.label} className="border-b border-ink/15 py-3 text-[15px]">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt>{r.label}</dt>
                      <dd className="text-right font-semibold">{r.value}</dd>
                    </div>
                    {r.source && <p className="mt-0.5 text-[13px] text-ink/70">{r.source}</p>}
                  </div>
                ))}
              </dl>
            </Card>
          )}
        </div>
      )}
      <Sources sources={cost.sources} />
    </>
  );
}

function CostCard({
  title,
  lines,
  format,
  dark = false,
  children,
}: {
  title: string;
  lines: CostLine[];
  format: (n: number) => string;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-cream shadow-[8px_8px_0_0_var(--color-ink)]">
      <div className="flex-1 px-6 pt-7 pb-5 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-[clamp(2.25rem,4vw,2.75rem)] leading-none font-bold">{title}</h2>
          <span
            className={`mt-2 shrink-0 rounded-full border-[1.5px] border-ink px-3 py-1 text-[13px] font-semibold ${
              dark ? "bg-ink text-sun" : ""
            }`}
          >
            Per unit
          </span>
        </div>
        <dl className="mt-5">
          {lines.map((line) => (
            <div key={line.label} title={line.basis} className="border-b border-ink/15 py-3">
              <div className="flex items-baseline justify-between gap-4 text-[16px]">
                <dt>{line.label}</dt>
                <dd className="font-semibold tabular-nums">{format(line.perUnit)}</dd>
              </div>
              <p className="mt-0.5 text-[13px] leading-snug text-ink/70">
                <span
                  className={`mr-1.5 inline-block rounded px-1.5 text-[11px] font-semibold tracking-wide uppercase ${
                    line.kind === "sourced" ? "bg-ink text-sun" : "border border-ink/40"
                  }`}
                >
                  {line.kind === "sourced" ? "Sourced" : "Estimate"}
                </span>
                {line.basis}
              </p>
            </div>
          ))}
        </dl>
      </div>
      <div
        className={`flex flex-wrap items-end justify-between gap-x-4 gap-y-1 px-6 py-5 text-[16px] font-semibold sm:px-8 ${
          dark ? "bg-ink text-sun" : "border-t-2 border-ink"
        }`}
      >
        {children}
      </div>
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <dt className="text-[14px] font-semibold text-muted">{label}</dt>
      <dd>
        <span className="font-display block text-[clamp(2.5rem,4.5vw,3.25rem)] leading-tight font-bold">
          {value}
        </span>
        {note && <span className="block text-[15px] text-ink/80">{note}</span>}
      </dd>
    </div>
  );
}
