import type { Metadata } from "next";
import { CostContent } from "@/components/report/cost-content";
import { PageIntro, projectParam, ReportShell } from "@/components/report-shell";

export const metadata: Metadata = {
  title: "Feasibility & cost | MakeLocal",
};

export default async function CostPage({ searchParams }: PageProps<"/plan/cost">) {
  const projectId = await projectParam(searchParams);
  return (
    <ReportShell current="/plan/cost" projectId={projectId}>
      <div className="w-full max-w-[1120px] px-4 py-10 sm:px-12 md:py-12">
        <PageIntro title="Can we make it locally?" />
        <div className="mt-5">
          <CostContent projectId={projectId} />
        </div>
      </div>
    </ReportShell>
  );
}
