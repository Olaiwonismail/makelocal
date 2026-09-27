export type CostLine = {
  label: string;
  perUnit: number;
  // Where the number comes from. Costs are what users act on financially, so every
  // figure keeps its source or assumption alongside it.
  basis: string;
};

export type CostComparison = {
  product: string;
  location: string;
  currency: string;
  units: number;
  local: CostLine[];
  imported: CostLine[];
  verdict: string;
};

// Placeholder until the backend exists: the AI will estimate these per product,
// region and quantity. Every product gets the Lagos jerrycan example for now.
export function getCostComparison(product: string): CostComparison {
  return {
    product: product || "25 litre jerrycan",
    location: "Lagos",
    currency: "NGN",
    units: 1000,
    local: [
      { label: "Materials", perUnit: 1850, basis: "Placeholder estimate" },
      { label: "Labour", perUnit: 320, basis: "Placeholder estimate" },
      { label: "Machine / process", perUnit: 480, basis: "Placeholder estimate" },
      { label: "Transport", perUnit: 150, basis: "Placeholder estimate" },
    ],
    imported: [
      { label: "Product cost (FOB)", perUnit: 1200, basis: "Placeholder estimate" },
      { label: "Shipping", perUnit: 650, basis: "Placeholder estimate" },
      { label: "Duties and tariffs", perUnit: 740, basis: "Placeholder estimate" },
      { label: "Clearing, demurrage, transport", perUnit: 580, basis: "Placeholder estimate" },
    ],
    verdict:
      "Local production is cheaper at this volume. The main risk is the upfront equipment cost of roughly ₦24M for new machines, or ₦11M used. At 1,000 units per month, the equipment pays for itself within 6 months from the savings alone.",
  };
}

export function total(lines: CostLine[]) {
  return lines.reduce((sum, line) => sum + line.perUnit, 0);
}
