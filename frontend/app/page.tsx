import { HomePlanner } from "@/components/home-planner";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <HomePlanner />
      </main>
    </>
  );
}
