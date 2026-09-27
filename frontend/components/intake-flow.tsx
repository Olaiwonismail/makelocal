"use client";

import { useState, type ReactNode } from "react";
import {
  getFollowUpQuestion,
  intakeSteps,
  matchLevels,
  quantityPresets,
  salesMarkets,
} from "@/lib/intake";

type Answers = {
  quantity: string;
  exactQuantity: string;
  sellIn: string;
  makeIn: string;
  match: string;
  followUp: string;
  followUpText: string;
};

const emptyAnswers: Answers = {
  quantity: "",
  exactQuantity: "",
  sellIn: "",
  makeIn: "",
  match: "",
  followUp: "",
  followUpText: "",
};

const stepAnswerKeys: (keyof Answers)[][] = [
  ["quantity", "exactQuantity"],
  ["sellIn", "makeIn"],
  ["match"],
  ["followUp", "followUpText"],
];

export function IntakeFlow({ product }: { product: string }) {
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [done, setDone] = useState(false);
  const followUp = getFollowUpQuestion(product);
  const isLast = step === intakeSteps.length - 1;

  function set(patch: Partial<Answers>) {
    setAnswers((a) => ({ ...a, ...patch }));
  }

  function goTo(next: number) {
    setStep(next);
    setReached((r) => Math.max(r, next));
  }

  function advance() {
    if (isLast) setDone(true);
    else goTo(step + 1);
  }

  function skip() {
    const cleared = Object.fromEntries(stepAnswerKeys[step].map((k) => [k, ""]));
    set(cleared);
    advance();
  }

  return (
    <div className="mx-auto w-full max-w-[1040px] px-4 pt-12 pb-24 sm:pt-14">
      <h1 className="font-display text-[clamp(3rem,8.5vw,7.25rem)] leading-[0.84] font-extrabold">
        Let&apos;s get to know your need better
      </h1>
      {product && (
        <p className="mt-4 text-[17px] text-ink/85">
          Planning production for <span className="font-semibold">{product}</span>.
        </p>
      )}

      <ol className="mt-10 grid grid-cols-4 gap-2.5">
        {intakeSteps.map((label, i) => {
          const filled = done || i <= step;
          const current = !done && i === step;
          const reachable = i <= reached && !done;
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => goTo(i)}
                disabled={!reachable || current}
                aria-current={current ? "step" : undefined}
                className="block w-full text-left disabled:cursor-default"
              >
                <span
                  className={`block h-2.5 rounded-full border-[1.5px] border-ink ${filled ? "bg-ink" : ""}`}
                />
                <span
                  className={`mt-2.5 block text-[13px] sm:text-[15px] ${current ? "font-semibold" : ""} ${
                    reachable && !current ? "underline-offset-4 hover:underline" : ""
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-9 rounded-xl border-2 border-ink bg-cream shadow-[8px_8px_0_0_var(--color-ink)]">
        {done ? (
          <Summary
            product={product}
            answers={answers}
            followUpQuestion={followUp.question}
            onEdit={() => {
              setDone(false);
              setStep(0);
            }}
          />
        ) : (
          <>
            <div className="min-h-[340px] px-6 pt-9 pb-6 sm:px-9">
              <p className="text-[14px] font-semibold text-muted">
                Question {step + 1} of {intakeSteps.length}
                {isLast && <span className="font-normal"> · Written by MakeLocal for this product</span>}
              </p>

              {step === 0 && (
                <Question
                  title="How many do you need?"
                  hint="This decides whether a small workshop can do it or you need a factory line."
                >
                  <ChipGroup
                    label="Quantity"
                    options={quantityPresets}
                    value={answers.quantity}
                    onChange={(quantity) => set({ quantity, exactQuantity: "" })}
                  />
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <label htmlFor="exact-quantity" className="text-[15px] font-medium">
                      Or an exact number
                    </label>
                    <input
                      id="exact-quantity"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      placeholder="2500"
                      value={answers.exactQuantity}
                      onChange={(e) => set({ exactQuantity: e.target.value, quantity: "" })}
                      className="h-[46px] w-[150px] rounded-lg border-[1.5px] border-ink bg-white px-3.5 text-[16px] placeholder:text-faint focus:outline-2 focus:outline-offset-2 focus:outline-ink"
                    />
                  </div>
                </Question>
              )}

              {step === 1 && (
                <Question
                  title="Where will you sell it?"
                  hint="Prices, suppliers and import duties all depend on the place."
                >
                  <ChipGroup
                    label="Where you will sell it"
                    options={salesMarkets}
                    value={answers.sellIn}
                    onChange={(sellIn) => set({ sellIn })}
                  />
                  <div className="mt-7">
                    <label htmlFor="make-in" className="block text-[15px] font-medium">
                      Where do you want it made?
                    </label>
                    <input
                      id="make-in"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="City and country, e.g. Kano, Nigeria"
                      value={answers.makeIn}
                      onChange={(e) => set({ makeIn: e.target.value })}
                      className="mt-2.5 h-[46px] w-full max-w-[420px] rounded-lg border-[1.5px] border-ink bg-white px-3.5 text-[16px] placeholder:text-faint focus:outline-2 focus:outline-offset-2 focus:outline-ink"
                    />
                  </div>
                </Question>
              )}

              {step === 2 && (
                <Question
                  title="How close to the original?"
                  hint="Loosening this often opens up cheaper local materials and more workshops."
                >
                  <div role="radiogroup" aria-label="Match" className="grid gap-3 sm:grid-cols-3">
                    {matchLevels.map((m) => {
                      const selected = answers.match === m.title;
                      return (
                        <button
                          key={m.title}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => set({ match: selected ? "" : m.title })}
                          className={`rounded-lg border-2 border-ink p-5 text-left transition-[translate,box-shadow] ${
                            selected
                              ? "bg-ink text-cream"
                              : "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--color-ink)]"
                          }`}
                        >
                          <span className="font-display block text-[26px] leading-tight font-bold">
                            {m.title}
                          </span>
                          <span
                            className={`mt-2 block text-[14.5px] leading-snug ${selected ? "text-cream/85" : "text-ink/80"}`}
                          >
                            {m.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Question>
              )}

              {step === 3 && (
                <Question title={followUp.question} hint={followUp.hint}>
                  <ChipGroup
                    label={followUp.question}
                    options={followUp.options}
                    value={answers.followUp}
                    onChange={(value) => set({ followUp: value })}
                  />
                  <label htmlFor="follow-up-text" className="mt-6 block text-[15px] font-medium">
                    Or tell us in your own words
                  </label>
                  <textarea
                    id="follow-up-text"
                    rows={2}
                    value={answers.followUpText}
                    onChange={(e) => set({ followUpText: e.target.value })}
                    className="mt-2.5 block w-full max-w-[620px] resize-none rounded-lg border-[1.5px] border-ink bg-white px-3.5 py-3 text-[16px] leading-relaxed focus:outline-2 focus:outline-offset-2 focus:outline-ink"
                  />
                </Question>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 px-6 pb-7 sm:px-9">
              <button
                type="button"
                onClick={skip}
                className="px-3.5 py-2 text-[15px] font-medium underline underline-offset-4 hover:text-muted"
              >
                Skip this question
              </button>
              <button
                type="button"
                onClick={advance}
                className="rounded-lg bg-ink px-7 py-3.5 text-[16px] font-semibold text-sun hover:bg-ink/90"
              >
                {isLast ? "Finish" : "Continue"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Question({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <>
      <h2 className="font-display mt-2 text-[clamp(2.25rem,5vw,3rem)] leading-[1.05] font-bold">{title}</h2>
      <p className="mt-2 text-[16px] text-ink/85">{hint}</p>
      <div className="mt-7">{children}</div>
    </>
  );
}

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2.5">
      {options.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(selected ? "" : option)}
            className={`rounded-full border-[1.5px] border-ink px-5 py-3 text-[16px] font-semibold ${
              selected ? "bg-ink text-cream" : "hover:bg-sun/40"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function Summary({
  product,
  answers,
  followUpQuestion,
  onEdit,
}: {
  product: string;
  answers: Answers;
  followUpQuestion: string;
  onEdit: () => void;
}) {
  const quantity = answers.exactQuantity
    ? Number(answers.exactQuantity).toLocaleString("en")
    : answers.quantity;
  const followUp = [answers.followUp, answers.followUpText.trim()].filter(Boolean).join(". ");
  const rows: [string, string][] = [
    ["Quantity", quantity],
    ["Sell in", answers.sellIn],
    ["Make in", answers.makeIn.trim()],
    ["Match", answers.match],
    [followUpQuestion, followUp],
  ];

  return (
    <div className="px-6 py-9 sm:px-9">
      <h2 className="font-display text-[clamp(2.25rem,5vw,3rem)] leading-[1.05] font-bold">
        Got it{product ? `: ${product}` : ""}
      </h2>
      <p className="mt-2 text-[16px] text-ink/85">
        Here&apos;s what we&apos;ll plan around. Production plans aren&apos;t wired up yet.
      </p>
      <dl className="mt-7 grid gap-x-6 gap-y-3 text-[16px] sm:grid-cols-[220px_1fr]">
        {rows.map(([term, value]) => (
          <div key={term} className="contents">
            <dt className="text-muted">{term}</dt>
            <dd className={value ? "font-medium" : "text-faint"}>{value || "Skipped"}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-9 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onEdit}
          className="px-3.5 py-2 text-[15px] font-medium underline underline-offset-4 hover:text-muted"
        >
          Change my answers
        </button>
        {/* No plan page yet: this will lead to the generated production plan. */}
        <button
          type="button"
          className="rounded-lg bg-ink px-7 py-3.5 text-[16px] font-semibold text-sun hover:bg-ink/90"
        >
          Next
        </button>
      </div>
    </div>
  );
}
