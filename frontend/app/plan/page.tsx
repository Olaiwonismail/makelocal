import type { Metadata } from "next";
import { IntakeFlow } from "@/components/intake-flow";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Tell us more | MakeLocal",
};

export default async function PlanPage({ searchParams }: PageProps<"/plan">) {
  const { product } = await searchParams;

  return (
    <>
      <SiteHeader minimal />
      <main className="flex-1">
        <IntakeFlow product={typeof product === "string" ? product.trim() : ""} />
      </main>
    </>
  );
}
