import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextLink, ReportShell } from "@/components/report-shell";
import { getCostComparison, total, type CostLine } from "@/lib/cost";

export const metadata: Metadata = {
  title: "Feasibility & cost | MakeLocal",
};

export default async function CostPage({ searchParams }: PageProps<"/plan/cost">) {
  const { product: raw } = await searchParams;
  const product = typeof raw === "string" ? raw.trim() : "";
  const cost = getCostComparison(product);

  const money = new Intl.NumberFormat("en", {
    style: "currency",
    currency: cost.currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  });
  const compactMoney = new Intl.NumberFormat("en", {
    style: "currency",
    currency: cost.currency,
    currencyDisplay: "narrowSymbol",
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
  const units = cost.units.toLocaleString("en");

  const localTotal = total(cost.local);
  const importTotal = total(cost.imported);
  const saving = importTotal - localTotal;
  const localIsCheaper = saving > 0;
  const percent = new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 }).format(
    Math.abs(saving) / importTotal,
  );

  return (
    <ReportShell current="/plan/cost" product={product}>
      <div className="w-full max-w-[1120px] px-4 py-10 sm:px-14 md:py-12">
        <h1 className="font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-none font-bold">
          Can we make it locally?
        </h1>
        <p className="mt-4 max-w-[660px] text-[17px] leading-relaxed text-ink/85">
          Cost breakdown for producing {units} units of the {cost.product} near {cost.location} versus
          importing.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <CostCard title="Local Production" lines={cost.local} format={money.format} dark>
            <span>Estimated total</span>
            <span className="font-display text-[clamp(2rem,4vw,2.625rem)] leading-none font-bold">
              {money.format(localTotal)}/unit
            </span>
          </CostCard>
          <CostCard title="Import" lines={cost.imported} format={money.format}>
            <span>Estimated landed cost</span>
            <span className="font-display text-[clamp(2rem,4vw,2.625rem)] leading-none font-bold">
              {money.format(importTotal)}/unit
            </span>
          </CostCard>
        </div>

        <section className="mt-8 rounded-xl border-2 border-ink bg-cream px-6 py-8 shadow-[8px_8px_0_0_var(--color-ink)] sm:px-9">
          <h2 className="font-display text-[clamp(2.25rem,4vw,2.75rem)] leading-none font-bold">
            Local vs Import
          </h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-3">
            <Stat
              label={localIsCheaper ? "You save per unit" : "Importing saves per unit"}
              value={money.format(Math.abs(saving))}
            />
            <Stat
              label="That's"
              value={percent}
              note={localIsCheaper ? "cheaper to produce locally" : "cheaper to import"}
            />
            <Stat
              label={`On ${units} units`}
              value={compactMoney.format(Math.abs(saving) * cost.units)}
              note="total savings"
            />
          </dl>
          <p className="mt-7 max-w-[800px] text-[16px] leading-relaxed text-ink/85">{cost.verdict}</p>
          <p className="mt-4 text-[13px] text-muted">
            Figures are sample estimates, not supplier quotes.
          </p>
        </section>

        <div className="mt-10 flex justify-end">
          <NextLink href={`/plan/suppliers${product ? `?${new URLSearchParams({ product })}` : ""}`}>
            Next
          </NextLink>
        </div>
      </div>
    </ReportShell>
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
            <div
              key={line.label}
              title={line.basis}
              className="flex items-baseline justify-between gap-4 border-b border-ink/15 py-3 text-[16px]"
            >
              <dt>{line.label}</dt>
              <dd className="font-semibold tabular-nums">{format(line.perUnit)}</dd>
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
