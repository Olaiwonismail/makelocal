import type { Metadata } from "next";
import { QuoteDesk } from "@/components/quote-desk";
import { ReportShell } from "@/components/report-shell";
import { getQuoteRequest } from "@/lib/quotes";

export const metadata: Metadata = {
  title: "Quotes & contact | MakeLocal",
};

export default async function QuotesPage({ searchParams }: PageProps<"/plan/quotes">) {
  const { product: raw } = await searchParams;
  const product = typeof raw === "string" ? raw.trim() : "";
  const request = getQuoteRequest(product);

  return (
    <ReportShell current="/plan/quotes" product={product}>
      <div className="w-full max-w-[1120px] px-4 py-10 sm:px-12 md:py-12">
        <h1 className="font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-none font-bold">
          Start producing
        </h1>
        <p className="mt-4 max-w-[700px] text-[17px] leading-relaxed text-ink/85">
          Send your spec to the businesses you shortlisted. Replies land here so you can compare them
          side by side.
        </p>
        <QuoteDesk request={request} />
      </div>
    </ReportShell>
  );
}
