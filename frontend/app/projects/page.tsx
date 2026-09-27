import type { Metadata } from "next";
import Link from "next/link";
import { ProjectsList } from "@/components/projects-list";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "My projects | MakeLocal",
};

export default function ProjectsPage() {
  return (
    <>
      <SiteHeader
        minimal
        actions={
          <Link
            href="/"
            className="rounded-lg bg-ink px-4 py-3 text-[15px] font-semibold whitespace-nowrap text-sun hover:bg-ink/90 sm:px-5"
          >
            New product
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-[1296px] flex-1 px-4 py-10 sm:px-10 md:py-12">
        <h1 className="font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-none font-bold">
          Your manufacturing workspace
        </h1>
        <ProjectsList />

        <section className="mt-8 rounded-xl border-2 border-dashed border-ink px-6 py-9 text-center">
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-bold">
            Start another product
          </h2>
          <p className="mx-auto mt-1 max-w-[460px] text-[16px] text-ink/85">
            Name anything you currently import and MakeLocal will work out whether you can produce it here instead.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-lg border-2 border-ink px-6 py-2.5 text-[16px] font-semibold hover:bg-cream"
          >
            New product
          </Link>
        </section>
      </main>
    </>
  );
}
