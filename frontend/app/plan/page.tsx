import type { Metadata } from "next";
import { IntakeFlow } from "@/components/intake-flow";
import { projectParam } from "@/components/report-shell";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Tell us more | MakeLocal",
};

export default async function PlanPage({ searchParams }: PageProps<"/plan">) {
  const projectId = await projectParam(searchParams);
  return (
    <>
      <SiteHeader minimal />
      <main className="flex-1">
        <IntakeFlow projectId={projectId} />
      </main>
    </>
  );
}
