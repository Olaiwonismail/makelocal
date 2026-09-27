import type { Metadata } from "next";
import { ReportShell } from "@/components/report-shell";
import { SupplierDirectory } from "@/components/supplier-directory";
import { getSupplyChain } from "@/lib/suppliers";

export const metadata: Metadata = {
  title: "Local supply chain | MakeLocal",
};

export default async function SuppliersPage({ searchParams }: PageProps<"/plan/suppliers">) {
  const { product: raw } = await searchParams;
  const product = typeof raw === "string" ? raw.trim() : "";
  const chain = getSupplyChain(product);
  const all = chain.groups.flatMap((g) => g.suppliers);
  const furthest = Math.max(...all.map((s) => s.distanceKm));

  return (
    <ReportShell current="/plan/suppliers" product={product}>
      <div className="w-full max-w-[1120px] px-4 py-10 sm:px-12 md:py-12">
        <h1 className="font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-none font-bold">
          Who can help you make it?
        </h1>
        <p className="mt-4 max-w-[680px] text-[17px] leading-relaxed text-ink/85">
          {all.length} businesses within {furthest} km of {chain.origin} can supply, produce or finish
          the {chain.product}. Distances are from your stated location.
        </p>
        <p className="mt-2 text-[14px] text-muted">
          These are sample listings for the demo, not real businesses.
        </p>
        <SupplierDirectory chain={chain} />
      </div>
    </ReportShell>
  );
}
