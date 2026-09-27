"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      title="Print or save this page as a PDF"
      className="rounded-lg bg-ink px-4 py-3 text-[15px] font-semibold whitespace-nowrap text-sun hover:bg-ink/90 sm:px-5"
    >
      Export report
    </button>
  );
}
