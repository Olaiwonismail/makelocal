"use client";

import Link from "next/link";
import { QuoteDesk } from "@/components/quote-desk";
import { StageFooter, StageView } from "@/components/stage-view";

export function QuotesContent({ projectId }: { projectId: string }) {
  return (
    <StageView projectId={projectId} stage="quotes">
      {(request, reload) => (
        <>
          <QuoteDesk key={request.brief} request={request} />
          <StageFooter next={{ href: "/projects", label: "Back to my projects" }} onRerun={() => reload(true)} />
        </>
      )}
    </StageView>
  );
}

export function QuotesIntro() {
  return (
    <>
      Send your spec to the businesses you shortlisted. Replies land here so you can compare them side by side.{" "}
      <Link href="/projects" className="underline underline-offset-4">
        Saved in your projects
      </Link>
      .
    </>
  );
}
