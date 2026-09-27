import type { ProductAnalysis } from "@/lib/analysis";

// Branch width and gap are fixed so the horizontal connector can reach from one
// branch's centre to the next: each branch draws its share of the bar, spilling
// half the gap (35px) past each side.
export function AnalysisTree({ analysis }: { analysis: ProductAnalysis }) {
  return (
    <div className="m-auto flex w-full flex-col items-center xl:w-auto">
      <div className="w-full max-w-[320px] rounded-xl border-2 border-ink bg-cream px-6 py-4 text-center">
        <h2 className="font-display text-[34px] leading-tight font-bold">Product Analysis</h2>
        <p className="mt-0.5 text-[15px] text-ink/80">{analysis.product}</p>
      </div>
      <div aria-hidden="true" className="h-[58px] w-0.5 bg-ink" />

      <ul className="flex w-full flex-col items-center xl:w-auto xl:flex-row xl:items-start xl:gap-[70px]">
        {analysis.branches.map((branch) => (
          <li
            key={branch.title}
            className="relative w-full max-w-[320px] pt-[60px] before:absolute before:top-0 before:left-1/2 before:h-[60px] before:w-0.5 before:-translate-x-1/2 before:bg-ink first:pt-0 first:before:hidden xl:w-[220px] xl:first:pt-[60px] xl:first:before:block xl:after:absolute xl:after:top-0 xl:after:-right-[35px] xl:after:-left-[35px] xl:after:h-0.5 xl:after:bg-ink xl:first:after:left-1/2 xl:last:after:right-1/2 xl:only:after:hidden"
          >
            <h3 className="font-display grid h-[60px] place-items-center rounded-lg bg-ink px-3 text-center text-[28px] leading-none font-bold text-sun">
              {branch.title}
            </h3>
            <ul className="relative mt-[30px] flex flex-col gap-2.5 before:absolute before:-top-[30px] before:bottom-6 before:left-1/2 before:border-l-2 before:border-dashed before:border-ink">
              {branch.items.map((item) => (
                <li
                  key={item}
                  className="relative grid min-h-12 place-items-center rounded-lg border-[1.5px] border-ink bg-cream px-3 py-2 text-center text-[15px] leading-snug font-semibold"
                >
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
