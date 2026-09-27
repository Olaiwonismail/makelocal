"use client";

import { useState } from "react";
import { moneyFormat } from "@/lib/format";
import type { Supplier, SupplierGroupName, SupplyChain } from "@/lib/types";

type Filter = SupplierGroupName | "All";

export function SupplierDirectory({ chain }: { chain: SupplyChain }) {
  const [filter, setFilter] = useState<Filter>("All");
  const filters: Filter[] = ["All", ...chain.groups.map((g) => g.name)];
  const groups = filter === "All" ? chain.groups : chain.groups.filter((g) => g.name === filter);
  const money = moneyFormat(chain.currency);
  const compactMoney = moneyFormat(chain.currency, true);

  return (
    <>
      <div role="group" aria-label="Filter by type" className="no-print mt-7 flex flex-wrap gap-2.5">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-full border-[1.5px] border-ink px-4.5 py-2.5 text-[16px] font-semibold ${
              filter === f ? "bg-ink text-cream" : "hover:bg-cream"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {groups.map((group) => (
        <section key={group.name} aria-labelledby={`group-${group.name}`} className="mt-11">
          <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
            <h2
              id={`group-${group.name}`}
              className="font-display text-[clamp(2.5rem,4.5vw,3.25rem)] leading-none font-bold"
            >
              {group.name}
            </h2>
            <span className="text-[15px] font-semibold text-muted">
              {group.suppliers.length} {group.noun}
              {group.suppliers.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-4 text-[17px] text-ink/85">{group.description}</p>
          {group.suppliers.length === 0 ? (
            <p className="mt-5 rounded-xl border-2 border-dashed border-ink px-6 py-5 text-[15px]">
              Nothing relevant turned up nearby for this group.
            </p>
          ) : (
            <ul className="mt-5 flex flex-col gap-5">
              {group.suppliers.map((s) => (
                <SupplierCard
                  key={`${s.name}${s.location}`}
                  supplier={s}
                  product={chain.product}
                  formatMoney={(n, compact) => (compact ? compactMoney : money).format(n)}
                />
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}

function whatsappLink(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

function SupplierCard({
  supplier: s,
  product,
  formatMoney,
}: {
  supplier: Supplier;
  product: string;
  formatMoney: (n: number, compact?: boolean) => string;
}) {
  const [quoting, setQuoting] = useState(false);
  const [draft, setDraft] = useState(
    `Hello ${s.name},\n\nI'm planning to produce ${product}${
      s.capabilities[0] ? ` and would like a quote for ${s.capabilities[0]}` : " and would like a quote"
    }. Please share your price, minimum order and lead time.\n\nThank you.`,
  );
  const [copied, setCopied] = useState(false);

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <li className="rounded-xl border-2 border-ink bg-cream">
      <div className="flex flex-col gap-6 px-6 py-6 sm:px-7 md:flex-row md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-display text-[clamp(1.75rem,3vw,2.125rem)] leading-tight font-bold">{s.name}</h3>
            <span className="text-[15px] font-semibold text-muted">{s.kind}</span>
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-ink/85">
            {s.location && (
              <span className="inline-flex items-center gap-1.5">
                <PinIcon />
                {s.location}
              </span>
            )}
            {s.distanceKm != null && <span className="font-semibold text-ink">{s.distanceKm} km</span>}
            {s.leadTime && <span>{s.leadTime}</span>}
            {s.rating != null && <span>★ {s.rating.toFixed(1)}</span>}
          </p>
          {s.capabilities.length > 0 && (
            <ul aria-label="Capabilities" className="mt-4 flex flex-wrap gap-2">
              {s.capabilities.map((c) => (
                <li key={c} className="rounded-md border-[1.5px] border-ink px-3 py-1 text-[14px]">
                  {c}
                </li>
              ))}
            </ul>
          )}
          {s.note && <p className="mt-4 text-[15px] leading-relaxed text-ink/85">{s.note}</p>}
        </div>

        <div className="no-print flex shrink-0 flex-col md:w-[210px]">
          {s.price && (
            <>
              <p className="text-[14px] font-semibold text-muted">{s.price.label}</p>
              <p
                title={s.price.basis}
                className="font-display text-[clamp(1.75rem,3vw,2rem)] leading-tight font-bold"
              >
                {formatMoney(s.price.amount, s.price.compact)}
                {s.price.unit && `/${s.price.unit}`}
              </p>
            </>
          )}
          <button
            type="button"
            aria-expanded={quoting}
            onClick={() => setQuoting((q) => !q)}
            className={`${s.price ? "mt-3" : ""} rounded-lg bg-ink px-4 py-3 text-[16px] font-semibold text-sun hover:bg-ink/90`}
          >
            Request quote
          </button>
          {s.phone && (
            <a
              href={whatsappLink(s.phone)}
              target="_blank"
              rel="noreferrer"
              className="mt-2.5 rounded-lg border-[1.5px] border-ink px-4 py-2.5 text-center text-[15px] font-semibold hover:bg-sun/40"
            >
              Call or WhatsApp
            </a>
          )}
          {s.website && (
            <a
              href={s.website}
              target="_blank"
              rel="noreferrer"
              className="mt-2.5 text-center text-[15px] font-semibold underline underline-offset-4"
            >
              Website
            </a>
          )}
          {s.phone && <p className="mt-1.5 text-center text-[13px] text-ink/70">{s.phone}</p>}
        </div>
      </div>

      {quoting && (
        <div className="border-t-[1.5px] border-ink px-6 py-5 sm:px-7">
          <label htmlFor={`draft-${s.name}`} className="text-[15px] font-semibold">
            Draft quote request
          </label>
          <p className="mt-1 text-[14px] text-muted">
            MakeLocal doesn&apos;t send anything for you. Edit it, copy it, and send it yourself.
          </p>
          <textarea
            id={`draft-${s.name}`}
            rows={6}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setCopied(false);
            }}
            className="mt-3 block w-full resize-y rounded-lg border-[1.5px] border-ink bg-white px-3.5 py-3 text-[15px] leading-relaxed focus:outline-2 focus:outline-offset-2 focus:outline-ink"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copyDraft}
              className="rounded-lg bg-ink px-4 py-2.5 text-[15px] font-semibold text-sun hover:bg-ink/90"
            >
              Copy message
            </button>
            {s.phone && (
              <a
                href={`${whatsappLink(s.phone)}?text=${encodeURIComponent(draft)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border-[1.5px] border-ink px-4 py-2 text-[15px] font-semibold hover:bg-sun/40"
              >
                Open in WhatsApp
              </a>
            )}
            <span aria-live="polite" className="text-[14px] text-muted">
              {copied ? "Copied" : ""}
            </span>
          </div>
        </div>
      )}
    </li>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
