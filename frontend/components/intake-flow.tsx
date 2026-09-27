"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { StageLoader } from "@/components/stage-loader";
import { NoProject, StageError } from "@/components/stage-view";
import { ApiError, getProject, saveAnswers } from "@/lib/api";
import { intakeSteps, matchLevels, quantityPresets, salesMarkets } from "@/lib/intake";
import { withProject } from "@/lib/routes";
import type { Answers as SavedAnswers, FollowUpQuestion, Project } from "@/lib/types";
import { useStage } from "@/lib/use-stage";

// Form state keeps the exact quantity as text while it's being typed.
type Answers = Omit<SavedAnswers, "exactQuantity"> & { exactQuantity: string };

const stepAnswerKeys: (keyof Answers)[][] = [
  ["quantity", "exactQuantity"],
  ["sellIn", "makeIn"],
  ["match"],
  ["followUp", "followUpText"],
];

function toForm(a: SavedAnswers): Answers {
  return { ...a, exactQuantity: a.exactQuantity ? String(a.exactQuantity) : "" };
}

function fromForm(a: Answers): SavedAnswers {
  const exact = Number.parseInt(a.exactQuantity, 10);
  return { ...a, makeIn: a.makeIn.trim(), exactQuantity: Number.isFinite(exact) && exact > 0 ? exact : null };
}

const container = "mx-auto w-full max-w-[1040px] px-4 pt-12 pb-24 sm:pt-14";

export function IntakeFlow({ projectId }: { projectId: string }) {
  const [state, setState] = useState<{ project?: Project; error?: ApiError }>({});

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    getProject(projectId).then(
      (project) => !cancelled && setState({ project }),
      (error: ApiError) => !cancelled && setState({ error }),
    );
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (!projectId) {
    return (
      <div className={container}>
        <NoProject />
      </div>
    );
  }
  if (state.error) {
    return (
      <div className={container}>
        <StageError error={state.error} />
      </div>
    );
  }
  if (!state.project) {
    return (
      <div className={container}>
        <StageLoader stage="create" compact />
      </div>
    );
  }
  return <IntakeForm project={state.project} />;
}

function IntakeForm({ project }: { project: Project }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() => toForm(project.answers));
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<ApiError | null>(null);
  const followUp = useStage(project.id, "follow_up");
  const question: FollowUpQuestion | null = followUp.status === "done" ? followUp.data : null;
  const isLast = step === intakeSteps.length - 1;
  const product = project.product;

  function set(patch: Partial<Answers>) {
    setAnswers((a) => ({ ...a, ...patch }));
  }

  function goTo(next: number) {
    setStep(next);
    setReached((r) => Math.max(r, next));
  }

  async function finish(current: Answers) {
    setSaving(true);
    setSaveError(null);
    try {
      await saveAnswers(project.id, fromForm(current));
      setDone(true);
    } catch (e) {
      setSaveError(e as ApiError);
    } finally {
      setSaving(false);
    }
  }

  function advance(current = answers) {
    if (isLast) void finish(current);
    else goTo(step + 1);
  }

  function skip() {
    const cleared = { ...answers, ...Object.fromEntries(stepAnswerKeys[step].map((k) => [k, ""])) };
    setAnswers(cleared);
    advance(cleared);
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
            followUpQuestion={question?.question ?? "Product detail"}
            onNext={() => router.push(withProject("/plan/analysis", project.id))}
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

              {step === 3 &&
                (question ? (
                  <Question title={question.question} hint={question.hint}>
                    <ChipGroup
                      label={question.question}
                      options={question.options}
                      value={answers.followUp}
                      onChange={(value) => set({ followUp: value })}
                    />
                    <FreeText value={answers.followUpText} onChange={(followUpText) => set({ followUpText })} />
                  </Question>
                ) : followUp.status === "loading" ? (
                  <div className="mt-4">
                    <StageLoader stage="follow_up" compact />
                  </div>
                ) : (
                  <Question
                    title="Anything else we should know?"
                    hint="We couldn't write a question for this product just now. Add any detail that changes how it's made."
                  >
                    <FreeText
                      label="Size, format, material or use"
                      value={answers.followUpText}
                      onChange={(followUpText) => set({ followUpText })}
                    />
                  </Question>
                ))}
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
                onClick={() => advance()}
                disabled={saving}
                className="rounded-lg bg-ink px-7 py-3.5 text-[16px] font-semibold text-sun hover:bg-ink/90 disabled:opacity-60"
              >
                {saving ? "Saving…" : isLast ? "Finish" : "Continue"}
              </button>
            </div>
            {saveError && (
              <p role="alert" className="px-6 pb-6 text-right text-[15px] font-semibold sm:px-9">
                {saveError.message}
              </p>
            )}
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

function FreeText({
  label = "Or tell us in your own words",
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <>
      <label htmlFor="follow-up-text" className="mt-6 block text-[15px] font-medium">
        {label}
      </label>
      <textarea
        id="follow-up-text"
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2.5 block w-full max-w-[620px] resize-none rounded-lg border-[1.5px] border-ink bg-white px-3.5 py-3 text-[16px] leading-relaxed focus:outline-2 focus:outline-offset-2 focus:outline-ink"
      />
    </>
  );
}

function Summary({
  product,
  answers,
  followUpQuestion,
  onEdit,
  onNext,
}: {
  product: string;
  answers: Answers;
  followUpQuestion: string;
  onEdit: () => void;
  onNext: () => void;
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
        Here&apos;s what we&apos;ll plan around.
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
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-ink px-7 py-3.5 text-[16px] font-semibold text-sun hover:bg-ink/90"
        >
          Next
        </button>
      </div>
    </div>
  );
}
