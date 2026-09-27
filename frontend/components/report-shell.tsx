import Link from "next/link";
import type { ReactNode } from "react";
import { PrintButton } from "@/components/print-button";
import { SiteHeader } from "@/components/site-header";
import { NoProject } from "@/components/stage-view";
import { withProject } from "@/lib/routes";

const sections = [
  {
    href: "/plan/analysis",
    title: "Product Analysis",
    description: "Materials, manufacturing and required equipment",
  },
  {
    href: "/plan/cost",
    title: "Feasibility & Cost",
    description: "Local production vs import cost",
  },
  {
    href: "/plan/suppliers",
    title: "Local Supply Chain",
    description: "Suppliers, workshops and services near you",
  },
  {
    href: "/plan/production",
    title: "Production Plan",
    description: "Workflow, timing and batch size",
  },
  {
    href: "/plan/quotes",
    title: "Quotes & Contact",
    description: "Send requests and compare replies",
  },
] as const;

export type ReportSection = (typeof sections)[number]["href"];

export function ReportShell({
  current,
  projectId,
  children,
}: {
  current: ReportSection;
  projectId: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className="no-print">
        <SiteHeader
          minimal
          actions={
            <>
              <Link
                href="/"
                className="hidden text-[15px] font-semibold whitespace-nowrap underline-offset-4 hover:underline sm:inline"
              >
                New search
              </Link>
              <Link
                href="/projects"
                className="text-[15px] font-semibold whitespace-nowrap underline-offset-4 hover:underline"
              >
                My projects
              </Link>
              {projectId && <PrintButton />}
            </>
          }
        />
      </div>
      <div className="flex flex-1 flex-col md:flex-row">
        <nav
          aria-label="Report sections"
          className="no-print overflow-x-auto border-b-2 border-ink md:w-[280px] md:shrink-0 md:overflow-visible md:border-r-2 md:border-b-0"
        >
          <ul className="flex md:block">
            {sections.map((s) => {
              const active = s.href === current;
              return (
                <li
                  key={s.href}
                  className="shrink-0 border-ink not-last:border-r-2 md:border-b-2 md:not-last:border-r-0"
                >
                  <Link
                    href={projectId ? withProject(s.href, projectId) : s.href}
                    aria-current={active ? "page" : undefined}
                    className={`block h-full px-4 py-3.5 md:px-7 md:py-5 ${active ? "bg-cream" : "hover:bg-cream/50"}`}
                  >
                    <span className="font-display block text-[19px] leading-tight font-bold whitespace-nowrap md:text-[28px] md:whitespace-normal">
                      {s.title}
                    </span>
                    <span className="mt-1 hidden text-[14px] leading-snug text-muted md:block">
                      {s.description}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <main className="flex min-w-0 flex-1 flex-col">
          {projectId ? (
            children
          ) : (
            <div className="w-full max-w-[1120px] px-4 py-10 sm:px-12 md:py-12">
              <NoProject />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export function PageIntro({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <>
      <h1 className="font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-none font-bold">{title}</h1>
      {children && <div className="mt-4 max-w-[700px] text-[17px] leading-relaxed text-ink/85">{children}</div>}
    </>
  );
}

export async function projectParam(searchParams: Promise<Record<string, string | string[] | undefined>>) {
  const { project } = await searchParams;
  return typeof project === "string" ? project : "";
}
