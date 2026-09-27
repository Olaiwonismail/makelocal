import type { Metadata } from "next";
import { SuppliersContent } from "@/components/report/suppliers-content";
import { PageIntro, projectParam, ReportShell } from "@/components/report-shell";

export const metadata: Metadata = {
  title: "Local supply chain | MakeLocal",
};

export default async function SuppliersPage({ searchParams }: PageProps<"/plan/suppliers">) {
  const projectId = await projectParam(searchParams);
  return (
    <ReportShell current="/plan/suppliers" projectId={projectId}>
      <div className="w-full max-w-[1120px] px-4 py-10 sm:px-12 md:py-12">
        <PageIntro title="Who can help you make it?" />
        <div className="mt-4">
          <SuppliersContent projectId={projectId} />
        </div>
      </div>
    </ReportShell>
  );
}
