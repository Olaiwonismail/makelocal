import type { Metadata } from "next";
import { AnalysisContent } from "@/components/report/analysis-content";
import { projectParam, ReportShell } from "@/components/report-shell";

export const metadata: Metadata = {
  title: "Product analysis | MakeLocal",
};

export default async function AnalysisPage({ searchParams }: PageProps<"/plan/analysis">) {
  const projectId = await projectParam(searchParams);
  return (
    <ReportShell current="/plan/analysis" projectId={projectId}>
      <AnalysisContent projectId={projectId} />
    </ReportShell>
  );
}
