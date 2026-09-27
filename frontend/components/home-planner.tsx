"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { StageLoader } from "@/components/stage-loader";
import { ApiError, createProject } from "@/lib/api";
import { categories, importedProducts, suggestions, type Category } from "@/lib/catalog";
import { withProject } from "@/lib/routes";

type Filter = Category | "All";

const filters: Filter[] = ["All", ...categories];
const SUGGESTIONS_SHOWN = 4;
const suggestionPages = Math.ceil(suggestions.length / SUGGESTIONS_SHOWN);

export function HomePlanner() {
  const [prompt, setPrompt] = useState("");
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
  const [suggestionPage, setSuggestionPage] = useState(0);
  const [filter, setFilter] = useState<Filter>("All");
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo.url);
    };
  }, [photo]);

  const shownSuggestions = suggestions.slice(
    suggestionPage * SUGGESTIONS_SHOWN,
    (suggestionPage + 1) * SUGGESTIONS_SHOWN,
  );
  const products =
    filter === "All" ? importedProducts : importedProducts.filter((p) => p.category === filter);

  function fillPrompt(text: string) {
    setPrompt(text);
    promptRef.current?.focus({ preventScroll: true });
    promptRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhoto({ file, url: URL.createObjectURL(file) });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const product = prompt.trim();
    if (!product && !photo) {
      promptRef.current?.focus();
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const image = photo ? await shrinkImage(photo.file) : undefined;
      const project = await createProject(product, image);
      router.push(withProject("/plan", project.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The photo couldn't be read. Try another one.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="px-4 pt-16 text-center sm:pt-20">
        <h1 className="font-display text-[clamp(3.25rem,12vw,8rem)] leading-[0.84] font-extrabold">
          <span className="block">What do you want</span>
          <span className="block">made here?</span>
        </h1>
        <p className="mx-auto mt-7 max-w-[580px] text-[17px] leading-relaxed text-pretty text-ink/85">
          Name or describe a product. You get what it&apos;s made of, how to produce it, what it
          costs against importing, and who nearby can build it.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-12 w-full max-w-[745px] rounded-xl border-2 border-ink bg-cream text-left shadow-[7px_7px_0_0_var(--color-ink)]"
        >
          <label htmlFor="prompt" className="sr-only">
            Describe the product you want made
          </label>
          <textarea
            id="prompt"
            ref={promptRef}
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="You can type, upload a photo, or paste a product link"
            className="block w-full resize-none bg-transparent px-5 pt-5 text-[17px] leading-relaxed placeholder:text-faint focus:outline-none"
          />

          {photo && (
            <div className="px-5 pt-1">
              <div className="inline-flex items-center gap-2.5 rounded-lg border-[1.5px] border-ink bg-white/70 p-1 pr-1.5">
                <Image
                  src={photo.url}
                  alt=""
                  width={40}
                  height={40}
                  unoptimized
                  className="size-10 rounded-md object-cover"
                />
                <span className="max-w-[180px] truncate text-sm">{photo.file.name}</span>
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  aria-label="Remove photo"
                  className="grid size-7 place-items-center rounded-md hover:bg-ink/10"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Upload a photo"
              title="Upload a photo"
              className="grid size-10 place-items-center rounded-full border-[1.5px] border-ink hover:bg-sun/40"
            >
              <PlusIcon />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-ink px-5 py-3 text-[15px] font-semibold text-sun hover:bg-ink/90 disabled:opacity-60"
            >
              {submitting ? "Working…" : "Plan production"}
            </button>
          </div>
        </form>

        {submitting && (photo || /^https?:\/\//.test(prompt.trim())) && (
          <div className="mx-auto mt-6 max-w-[745px] text-left">
            <StageLoader stage="create" compact />
          </div>
        )}
        {error && (
          <p role="alert" className="mx-auto mt-5 max-w-[745px] rounded-lg border-2 border-ink bg-cream px-5 py-3 text-left text-[15px]">
            {error}
          </p>
        )}

        <div className="mx-auto mt-9 flex max-w-[745px] flex-wrap items-center justify-center gap-2.5">
          <span className="mr-1 text-[14px] text-muted">Try</span>
          {shownSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => fillPrompt(s)}
              className="rounded-full border-[1.5px] border-ink px-3.5 py-1.5 text-[14px] hover:bg-cream"
            >
              {s}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSuggestionPage((p) => (p + 1) % suggestionPages)}
            aria-label="Show other examples"
            title="Show other examples"
            className="grid size-[34px] place-items-center rounded-full border-[1.5px] border-ink hover:bg-cream"
          >
            <RefreshIcon />
          </button>
        </div>
      </section>

      <section
        id="imports"
        aria-labelledby="imports-heading"
        className="mx-auto w-full max-w-[1080px] px-4 pt-24 pb-24 sm:px-10 sm:pt-28"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id="imports-heading"
            className="font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-none font-bold"
          >
            Start from something we import
          </h2>
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`rounded-full border-[1.5px] border-ink px-3.5 py-2 text-[14px] font-medium sm:px-4 ${
                  filter === f ? "bg-ink text-cream" : "hover:bg-cream"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li
              key={p.name}
              className="relative rounded-lg border-2 border-ink bg-cream p-5 transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--color-ink)]"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-[28px] leading-tight font-bold">
                  <button
                    type="button"
                    onClick={() => fillPrompt(p.name)}
                    className="text-left after:absolute after:inset-0 after:rounded-lg"
                  >
                    {p.name}
                  </button>
                </h3>
                <span className="shrink-0 text-[12px] text-muted">{p.category}</span>
              </div>
              <dl className="mt-3 grid grid-cols-[88px_1fr] gap-x-3 gap-y-1.5 text-[13.5px] leading-snug">
                <dt className="text-muted">Made from</dt>
                <dd>{p.madeFrom}</dd>
                <dt className="text-muted">Process</dt>
                <dd>{p.process}</dd>
                <dt className="text-muted">Machines</dt>
                <dd>{p.machines}</dd>
              </dl>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// Keep uploads small: the model only needs enough detail to recognise the product.
async function shrinkImage(file: File, maxSide = 1280): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
