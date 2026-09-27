import type { Metadata } from "next";
import { AnalysisTree } from "@/components/analysis-tree";
import { NextLink, ReportShell } from "@/components/report-shell";
import { getProductAnalysis } from "@/lib/analysis";

export const metadata: Metadata = {
  title: "Product analysis | MakeLocal",
};

export default async function AnalysisPage({ searchParams }: PageProps<"/plan/analysis">) {
  const { product: raw } = await searchParams;
  const product = typeof raw === "string" ? raw.trim() : "";
  const analysis = getProductAnalysis(product);

  return (
    <ReportShell current="/plan/analysis" product={product}>
      <div className="flex flex-1 overflow-x-auto px-4 py-10 md:py-16">
        <AnalysisTree analysis={analysis} />
      </div>
      <div className="flex justify-end px-4 pb-10 sm:px-14">
        <NextLink href={`/plan/cost${product ? `?${new URLSearchParams({ product })}` : ""}`}>
          Next
        </NextLink>
      </div>
    </ReportShell>
  );
}
