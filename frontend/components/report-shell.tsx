import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { withProduct } from "@/lib/routes";

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
  product,
  children,
}: {
  current: ReportSection;
  product: string;
  children: ReactNode;
}) {
  return (
    <>
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
            {/* Report export isn't built yet. */}
            <button
              type="button"
              className="rounded-lg bg-ink px-4 py-3 text-[15px] font-semibold whitespace-nowrap text-sun hover:bg-ink/90 sm:px-5"
            >
              Export report
            </button>
          </>
        }
      />
      <div className="flex flex-1 flex-col md:flex-row">
        <nav
          aria-label="Report sections"
          className="overflow-x-auto border-b-2 border-ink md:w-[280px] md:shrink-0 md:overflow-visible md:border-r-2 md:border-b-0"
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
                    href={withProduct(s.href, product)}
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
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </>
  );
}

export function NextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg bg-ink px-7 py-3.5 text-[16px] font-semibold text-sun hover:bg-ink/90"
    >
      {children}
    </Link>
  );
}
