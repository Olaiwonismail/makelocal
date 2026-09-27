import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

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
  const query = product ? `?${new URLSearchParams({ product })}` : "";

  return (
    <>
      <SiteHeader
        minimal
        actions={
          <>
            <Link
              href="/"
              className="text-[15px] font-semibold whitespace-nowrap underline-offset-4 hover:underline"
            >
              New search
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
        <nav aria-label="Report sections" className="border-ink md:w-[280px] md:shrink-0 md:border-r-2">
          <ul className="flex border-b-2 border-ink md:block md:border-b-0">
            {sections.map((s) => {
              const active = s.href === current;
              return (
                <li key={s.href} className="flex-1 border-ink not-last:border-r-2 md:border-b-2 md:not-last:border-r-0">
                  <Link
                    href={`${s.href}${query}`}
                    aria-current={active ? "page" : undefined}
                    className={`block h-full px-4 py-4 md:px-7 md:py-5 ${active ? "bg-cream" : "hover:bg-cream/50"}`}
                  >
                    <span className="font-display block text-[22px] leading-tight font-bold md:text-[28px]">
                      {s.title}
                    </span>
                    <span className="mt-1 block text-[13px] leading-snug text-muted md:text-[14px]">
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
