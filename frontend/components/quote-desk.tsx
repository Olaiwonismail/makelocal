"use client";

import { useState } from "react";
import { moneyFormat } from "@/lib/format";
import type { Quote, QuoteRequest } from "@/lib/types";

function batchTotal(quote: Quote, batch: number) {
  return quote.flatTotal ?? (quote.perUnit ?? 0) * batch;
}

export function QuoteDesk({ request }: { request: QuoteRequest }) {
  const [brief, setBrief] = useState(request.brief);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(
    () => new Set(request.recipients.filter((r) => r.selected).map((r) => r.name)),
  );
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  const money = moneyFormat(request.currency);
  const compactMoney = moneyFormat(request.currency, true);
  const unitPlural = request.unit === "unit" ? "units" : `${request.unit}s`;
  const chosen = request.recipients.filter((r) => selected.has(r.name));

  const perUnitQuotes = request.quotes.filter((q) => q.perUnit != null);
  const lowest = perUnitQuotes.length
    ? perUnitQuotes.reduce((a, b) => (batchTotal(a, request.batch) <= batchTotal(b, request.batch) ? a : b))
    : undefined;

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
    setConfirming(false);
  }

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <section className="mt-9 rounded-xl border-2 border-ink bg-cream px-6 py-7 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-[clamp(2rem,3.5vw,2.5rem)] leading-tight font-bold">Your request</h2>
          <button
            type="button"
            aria-pressed={editing}
            onClick={() => setEditing((e) => !e)}
            className="no-print shrink-0 rounded-lg border-[1.5px] border-ink px-4 py-2 text-[15px] font-semibold hover:bg-sun/40"
          >
            {editing ? "Done" : "Edit brief"}
          </button>
        </div>
        {editing ? (
          <>
            <label htmlFor="brief" className="sr-only">
              Brief
            </label>
            <textarea
              id="brief"
              rows={4}
              value={brief}
              onChange={(e) => {
                setBrief(e.target.value);
                setCopied(false);
              }}
              className="mt-5 block w-full resize-y rounded-lg border-[1.5px] border-ink bg-white px-5 py-4 text-[16px] leading-relaxed focus:outline-2 focus:outline-offset-2 focus:outline-ink"
            />
          </>
        ) : (
          <p className="mt-5 rounded-lg bg-ink/5 px-5 py-4 text-[16px] leading-relaxed">{brief}</p>
        )}
        {request.attachments.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {request.attachments.map((a) => (
              <li key={a} className="rounded-md border-[1.5px] border-ink px-3 py-1 text-[14px]">
                {a}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="send-to" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="send-to" className="font-display text-[clamp(2.5rem,4.5vw,3.25rem)] leading-none font-bold">
              Send to
            </h2>
            <p className="mt-1 text-[15px] text-ink/85">
              {selected.size} of {request.recipients.length} selected
            </p>
          </div>
          <button
            type="button"
            disabled={selected.size === 0}
            aria-expanded={confirming}
            onClick={() => setConfirming(true)}
            className="no-print rounded-lg bg-ink px-6 py-3.5 text-[16px] font-semibold text-sun hover:bg-ink/90 disabled:opacity-50"
          >
            Send request
          </button>
        </div>

        {confirming && (
          <div role="status" className="no-print mt-5 rounded-xl border-2 border-ink bg-cream px-6 py-5">
            <p className="text-[16px] font-semibold">This goes to {chosen.map((r) => r.name).join(", ")}.</p>
            <p className="mt-1 text-[15px] text-ink/85">
              MakeLocal doesn&apos;t send anything on your behalf, so nothing has been sent. Copy the brief, or open it
              in WhatsApp for anyone with a listed number, and send it yourself.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={copyBrief}
                className="rounded-lg bg-ink px-4 py-2.5 text-[15px] font-semibold text-sun hover:bg-ink/90"
              >
                Copy brief
              </button>
              {chosen
                .filter((r) => r.phone)
                .map((r) => (
                  <a
                    key={r.name}
                    href={`https://wa.me/${r.phone!.replace(/\D/g, "")}?text=${encodeURIComponent(brief)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border-[1.5px] border-ink px-4 py-2 text-[15px] font-semibold hover:bg-sun/40"
                  >
                    WhatsApp {r.name}
                  </a>
                ))}
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="px-3 py-2 text-[15px] font-medium underline underline-offset-4"
              >
                Cancel
              </button>
              <span aria-live="polite" className="text-[14px] text-muted">
                {copied ? "Copied" : ""}
              </span>
            </div>
          </div>
        )}

        {request.recipients.length === 0 ? (
          <p className="mt-5 rounded-xl border-2 border-dashed border-ink px-6 py-5 text-[15px]">
            No businesses to send to yet. Find suppliers first.
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-4">
            {request.recipients.map((r) => {
              const checked = selected.has(r.name);
              const id = `recipient-${r.name.replace(/\W+/g, "-")}`;
              const detail = [r.kind, r.area, r.distanceKm != null ? `${r.distanceKm} km` : ""].filter(Boolean);
              return (
                <li key={r.name}>
                  <label
                    htmlFor={id}
                    className={`flex cursor-pointer items-center gap-5 rounded-xl border-2 border-ink px-6 py-4 ${
                      checked ? "bg-cream" : "hover:bg-cream/40"
                    }`}
                  >
                    <input
                      id={id}
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(r.name)}
                      className="size-7 shrink-0 cursor-pointer accent-ink"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-display block text-[clamp(1.5rem,2.5vw,1.875rem)] leading-tight font-bold">
                        {r.name}
                      </span>
                      <span className="block text-[15px] text-ink/80">{detail.join(" · ")}</span>
                    </span>
                    {r.price && (
                      <span className="shrink-0 text-right">
                        <span className="block text-[13px] font-semibold text-muted">{r.price.label}</span>
                        <span className="font-display block text-[clamp(1.375rem,2.2vw,1.75rem)] leading-tight font-bold">
                          {(r.price.compact ? compactMoney : money).format(r.price.amount)}
                          {r.price.unit && `/${r.price.unit}`}
                        </span>
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="quotes-received" className="mt-12">
        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
          <h2
            id="quotes-received"
            className="font-display text-[clamp(2.5rem,4.5vw,3.25rem)] leading-none font-bold"
          >
            Quotes received
          </h2>
          <span className="text-[15px] font-semibold text-muted">
            {request.quotes.length} of {request.recipients.length} replied
          </span>
        </div>

        {request.quotes.length === 0 ? (
          <div className="mt-5 rounded-xl border-2 border-dashed border-ink px-6 py-8 text-center">
            <p className="font-display text-[clamp(1.5rem,2.5vw,1.875rem)] leading-tight font-bold">No replies yet</p>
            <p className="mx-auto mt-1 max-w-[520px] text-[15px] text-ink/85">
              Once businesses reply, their price per {request.unit}, minimum order and lead time line up here so you
              can compare them side by side.
            </p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-xl border-2 border-ink bg-cream">
            <table className="w-full min-w-[760px] text-left text-[15px]">
              <thead className="bg-ink text-sun">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Business</th>
                  <th scope="col" className="px-4 py-4 text-right font-semibold">Per {request.unit}</th>
                  <th scope="col" className="px-4 py-4 text-right font-semibold">Min order</th>
                  <th scope="col" className="px-4 py-4 text-right font-semibold">Lead time</th>
                  <th scope="col" className="px-4 py-4 text-right font-semibold">Terms</th>
                  <th scope="col" className="px-6 py-4 text-right font-semibold">
                    {request.batch.toLocaleString("en")} {unitPlural}
                  </th>
                </tr>
              </thead>
              <tbody>
                {request.quotes.map((q) => (
                  <tr key={q.supplier} className="border-t border-ink/15 even:bg-ink/5">
                    <th scope="row" className="px-6 py-4 font-normal">
                      <span className="flex flex-wrap items-center gap-2 font-semibold">
                        {q.supplier}
                        {q === lowest && (
                          <span className="rounded-full bg-ink px-2 py-0.5 text-[12px] text-sun">Lowest</span>
                        )}
                      </span>
                      {q.note && <span className="block text-[14px] text-ink/75">{q.note}</span>}
                    </th>
                    <td className="px-4 py-4 text-right font-semibold tabular-nums">
                      {q.perUnit != null ? money.format(q.perUnit) : "—"}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums">
                      {q.minOrder != null ? q.minOrder.toLocaleString("en") : "—"}
                    </td>
                    <td className="px-4 py-4 text-right">{q.leadTime || "—"}</td>
                    <td className="px-4 py-4 text-right">{q.terms || "—"}</td>
                    <td className="px-6 py-4 text-right font-semibold tabular-nums">
                      {money.format(batchTotal(q, request.batch))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
