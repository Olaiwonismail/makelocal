"use client";

import { useEffect, useState } from "react";
import type { StageName } from "@/lib/types";

const MESSAGES: Record<StageName | "create", string[]> = {
  create: ["Reading what you gave us", "Working out the product", "Setting up your project"],
  follow_up: ["Thinking about how this is made", "Writing the one question that matters most"],
  analysis: ["Reading the product", "Breaking it into materials", "Working out the process", "Listing the machines"],
  cost: [
    "Finding your location",
    "Checking the exchange rate",
    "Searching local prices",
    "Pricing the import route",
    "Comparing both",
  ],
  suppliers: [
    "Mapping your area",
    "Searching for suppliers",
    "Checking workshops and services",
    "Reading their websites",
    "Measuring distances",
  ],
  production: ["Sequencing the steps", "Sizing the batch", "Planning machines and materials", "Timing the first batch"],
  quotes: ["Picking who to ask", "Drafting your request"],
};

const STEP_MS = 3200;

export function StageLoader({ stage, compact = false }: { stage: StageName | "create"; compact?: boolean }) {
  const messages = MESSAGES[stage];
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Advance through the messages, then hold on the last one until the stage finishes.
    const id = setInterval(() => setStep((s) => Math.min(s + 1, messages.length - 1)), STEP_MS);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rise w-full rounded-xl border-2 border-ink bg-cream ${compact ? "px-5 py-5" : "px-6 py-8 sm:px-9"}`}
    >
      <div aria-hidden="true" className="h-3 overflow-hidden rounded-full border-2 border-ink">
        <div className="conveyor h-full w-full" />
      </div>
      <ol className="mt-6 flex flex-col gap-2.5">
        {messages.map((message, i) => (
          <li
            key={message}
            className={`flex items-center gap-3 text-[16px] transition-opacity ${
              i > step ? "opacity-35" : ""
            } ${i === step ? "font-semibold" : ""}`}
          >
            <span
              aria-hidden="true"
              className={`grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] border-ink text-[11px] ${
                i < step ? "bg-ink text-sun" : i === step ? "bg-sun" : ""
              }`}
            >
              {i < step ? "✓" : ""}
            </span>
            {message}
            {i === step && <span className="sr-only">(in progress)</span>}
          </li>
        ))}
      </ol>
      {!compact && <p className="mt-6 text-[14px] text-muted">Live research can take up to a minute.</p>}
    </div>
  );
}
