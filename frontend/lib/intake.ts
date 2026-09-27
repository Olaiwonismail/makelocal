export const intakeSteps = ["Quantity", "Market", "Match", "One more thing"] as const;

export const quantityPresets = [
  "Just one to test",
  "Up to 100",
  "100 to 1,000",
  "1,000 to 10,000",
  "More than 10,000",
];

export const salesMarkets = ["My city", "Across my country", "Neighbouring countries", "Export overseas"];

export const matchLevels = [
  {
    title: "Exact match",
    description: "Same materials, size and finish as the one you have in mind.",
  },
  {
    title: "Similar is fine",
    description: "Same job, but local materials or methods where they're cheaper.",
  },
  {
    title: "Make it better",
    description: "Improve on it: stronger, lighter, or cheaper to run.",
  },
];
