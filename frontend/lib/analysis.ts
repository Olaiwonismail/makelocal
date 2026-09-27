export type AnalysisBranch = {
  title: string;
  items: string[];
};

export type ProductAnalysis = {
  product: string;
  branches: AnalysisBranch[];
};

// Placeholder until the backend exists: the AI will break each product down into
// its own branches and items, and the counts vary per product. Every product gets
// the jerrycan breakdown for now.
export function getProductAnalysis(product: string): ProductAnalysis {
  return {
    product: product || "25 litre jerrycan",
    branches: [
      {
        title: "Materials",
        items: ["HDPE resin pellets", "Masterbatch colorant", "Screw cap and liner"],
      },
      {
        title: "Manufacturing",
        items: ["Dry and mix resin", "Extrude and blow mould", "Trim, test and pack"],
      },
      {
        title: "Equipment",
        items: ["Blow moulder", "Jerrycan mould", "Compressor + dryer"],
      },
    ],
  };
}
