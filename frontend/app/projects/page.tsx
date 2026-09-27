import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { projectStages, sampleProjects, type Project } from "@/lib/projects";
import { withProduct } from "@/lib/routes";

export const metadata: Metadata = {
  title: "My projects | MakeLocal",
};

const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

function formatStarted(iso: string) {
  const date = new Date(iso);
  return `${date.getUTCDate()} ${month.format(date)}`;
}

export default function ProjectsPage() {
  const count = sampleProjects.length;

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
        <p className="mt-4 text-[17px] text-ink/85">
          {count} {count === 1 ? "product" : "products"} in progress. Pick up wherever you left off.
        </p>

        <ul className="mt-9 flex flex-col gap-5">
          {sampleProjects.map((p) => (
            <ProjectCard key={p.product} project={p} />
          ))}
        </ul>
        <p className="mt-3 text-[13px] text-muted">
          Sample projects for the demo. Saved projects will appear here once accounts exist.
        </p>

        <section className="mt-8 rounded-xl border-2 border-dashed border-ink px-6 py-9 text-center">
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-bold">
            Start another product
          </h2>
          <p className="mx-auto mt-1 max-w-[460px] text-[16px] text-ink/85">
            Name anything you currently import and MakeLocal will work out whether you can produce it
            here instead.
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

function ProjectCard({ project: p }: { project: Project }) {
  return (
    <li className="flex flex-col gap-6 rounded-xl border-2 border-ink bg-cream px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="font-display text-[clamp(2rem,3.5vw,2.5rem)] leading-tight font-bold first-letter:uppercase">
            {p.product}
          </h2>
          <span className="text-[15px] text-ink/80">
            Started {formatStarted(p.started)} · {p.units.toLocaleString("en")} units ·{" "}
            {p.location}
          </span>
        </div>
        <ol aria-label="Progress" className="mt-4 grid grid-cols-5 gap-2 sm:gap-2.5">
          {projectStages.map((stage, i) => {
            const done = i < p.stage;
            const current = i === p.stage;
            return (
              <li key={stage} aria-current={current ? "step" : undefined}>
                <span
                  className={`block h-2.5 rounded-full border-[1.5px] border-ink ${done || current ? "bg-ink" : ""}`}
                />
                <span
                  className={`mt-2 flex items-center gap-2 text-[13px] sm:text-[15px] ${
                    current ? "font-semibold" : done ? "" : "text-muted"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`hidden size-5 shrink-0 rounded-full border-[1.5px] border-ink sm:block ${
                      done ? "bg-ink" : current ? "bg-sun" : ""
                    }`}
                  />
                  <span className="truncate">{stage}</span>
                  <span className="sr-only">{done ? "(done)" : current ? "(in progress)" : "(not started)"}</span>
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-[15px] text-ink/85">{p.status}</p>
      </div>

      <div className="flex shrink-0 flex-col lg:w-[230px]">
        <p className="text-[14px] font-semibold text-muted">{p.metric.label}</p>
        <p className="font-display text-[clamp(1.875rem,3vw,2.25rem)] leading-tight font-bold">{p.metric.value}</p>
        <Link
          href={withProduct(p.action.path, p.product)}
          className="mt-3 rounded-lg bg-ink px-4 py-3 text-center text-[16px] font-semibold text-sun hover:bg-ink/90"
        >
          {p.action.label}
        </Link>
      </div>
    </li>
  );
}
