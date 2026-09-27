import type { Metadata } from "next";
import Link from "next/link";
import { AnalysisTree } from "@/components/analysis-tree";
import { SiteHeader } from "@/components/site-header";
import { getProductAnalysis } from "@/lib/analysis";

export const metadata: Metadata = {
  title: "Product analysis | MakeLocal",
};

export default async function AnalysisPage({ searchParams }: PageProps<"/plan/analysis">) {
  const { product } = await searchParams;
  const analysis = getProductAnalysis(typeof product === "string" ? product.trim() : "");

  return (
    <>
      <SiteHeader
        minimal
        actions={
          <>
            <Link href="/" className="text-[15px] font-semibold whitespace-nowrap underline-offset-4 hover:underline">
              New search
            </Link>
            {/* Report export isn't built yet. */}
            <button
              type="button"
              className="rounded-lg bg-ink px-4 py-3 text-[15px] sm:px-5 font-semibold whitespace-nowrap text-sun hover:bg-ink/90"
            >
              Export report
            </button>
          </>
        }
      />
      <div className="flex flex-1 flex-col md:flex-row">
        <nav
          aria-label="Report sections"
          className="border-ink md:flex md:w-[280px] md:shrink-0 md:items-center md:border-r-2 md:px-12"
        >
          <ul className="px-4 pt-8 md:p-0">
            <li>
              <span
                aria-current="page"
                className="font-display text-[30px] leading-tight font-bold"
              >
                Product Analysis
              </span>
            </li>
          </ul>
        </nav>
        <main className="flex min-w-0 flex-1 overflow-x-auto px-4 py-10 md:py-16">
          <AnalysisTree analysis={analysis} />
        </main>
      </div>
    </>
  );
}
