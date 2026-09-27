import type { Metadata } from "next";
import { ProductionContent } from "@/components/report/production-content";
import { PageIntro, projectParam, ReportShell } from "@/components/report-shell";

export const metadata: Metadata = {
  title: "Production plan | MakeLocal",
};

export default async function ProductionPage({ searchParams }: PageProps<"/plan/production">) {
  const projectId = await projectParam(searchParams);
  return (
    <ReportShell current="/plan/production" projectId={projectId}>
      <div className="w-full max-w-[1120px] px-4 py-10 sm:px-12 md:py-12">
        <PageIntro title="How do you actually make it?" />
        <div className="mt-4">
          <ProductionContent projectId={projectId} />
        </div>
      </div>
    </ReportShell>
  );
}
