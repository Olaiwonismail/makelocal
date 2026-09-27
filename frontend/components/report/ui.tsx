import type { ReactNode } from "react";
import type { Source } from "@/lib/types";

export const card = "rounded-xl border-2 border-ink bg-cream";
export const cardHeading = "font-display text-[clamp(2rem,3.5vw,2.5rem)] leading-tight font-bold";
export const sectionHeading = "font-display text-[clamp(2.5rem,4.5vw,3.25rem)] leading-none font-bold";

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`${card} px-6 py-7 sm:px-8 ${className}`}>
      {title && <h2 className={cardHeading}>{title}</h2>}
      {children}
    </section>
  );
}

export function Sources({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;
  return (
    <details className="mt-6 text-[14px]">
      <summary className="cursor-pointer font-semibold text-muted">Sources ({sources.length})</summary>
      <ul className="mt-2 flex flex-col gap-1.5 pl-4">
        {sources.map((s) => (
          <li key={`${s.title}${s.url ?? ""}`} className="list-disc">
            {s.url ? (
              <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                {s.title || s.url}
              </a>
            ) : (
              s.title
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}
