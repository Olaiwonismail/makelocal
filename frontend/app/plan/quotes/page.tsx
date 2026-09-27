import type { Metadata } from "next";
import { QuotesContent, QuotesIntro } from "@/components/report/quotes-content";
import { PageIntro, projectParam, ReportShell } from "@/components/report-shell";

export const metadata: Metadata = {
  title: "Quotes & contact | MakeLocal",
};

export default async function QuotesPage({ searchParams }: PageProps<"/plan/quotes">) {
  const projectId = await projectParam(searchParams);
  return (
    <ReportShell current="/plan/quotes" projectId={projectId}>
      <div className="w-full max-w-[1120px] px-4 py-10 sm:px-12 md:py-12">
        <PageIntro title="Start producing">
          <QuotesIntro />
        </PageIntro>
        <div className="mt-2">
          <QuotesContent projectId={projectId} />
        </div>
      </div>
    </ReportShell>
  );
}
