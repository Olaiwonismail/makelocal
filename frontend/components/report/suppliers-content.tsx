"use client";

import { SupplierDirectory } from "@/components/supplier-directory";
import { Sources } from "@/components/report/ui";
import { StageFooter, StageView } from "@/components/stage-view";
import { withProject } from "@/lib/routes";

export function SuppliersContent({ projectId }: { projectId: string }) {
  return (
    <StageView projectId={projectId} stage="suppliers">
      {(chain, reload) => {
        const all = chain.groups.flatMap((g) => g.suppliers);
        const distances = all.map((s) => s.distanceKm).filter((d): d is number => d != null);
        const furthest = distances.length ? Math.ceil(Math.max(...distances)) : null;
        return (
          <>
            <p className="max-w-[700px] text-[17px] leading-relaxed text-ink/85">
              {all.length} {all.length === 1 ? "business" : "businesses"}
              {furthest != null ? ` within ${furthest} km of ${chain.origin}` : ` for production near ${chain.origin}`}{" "}
              can supply, produce or finish {chain.product}.
              {furthest != null && " Distances are straight-line from your stated location."}
            </p>
            <SupplierDirectory chain={chain} />
            <Sources sources={chain.sources} />
            <StageFooter
              next={{ href: withProject("/plan/production", projectId) }}
              onRerun={() => reload(true)}
            />
          </>
        );
      }}
    </StageView>
  );
}
