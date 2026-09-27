export type IntakeStep = "Quantity" | "Market" | "Match" | "One more thing";

export const intakeSteps: IntakeStep[] = ["Quantity", "Market", "Match", "One more thing"];

export const quantityPresets = [
  "Just one to test",
  "Up to 100",
  "100 to 1,000",
  "1,000 to 10,000",
  "More than 10,000",
];

export const salesMarkets = [
  "My city",
  "Across my country",
  "Neighbouring countries",
  "Export overseas",
];

export type MatchLevel = {
  title: string;
  description: string;
};

export const matchLevels: MatchLevel[] = [
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

export type FollowUpQuestion = {
  question: string;
  hint: string;
  options: string[];
};

// Placeholder until the backend exists: the AI will write this question and its
// answer options for each product. Every product gets the jerrycan example for now.
export function getFollowUpQuestion(product: string): FollowUpQuestion {
  void product;
  return {
    question: "What will the jerrycan hold?",
    hint: "Food-grade, fuel and chemical containers need different plastics and wall thickness.",
    options: ["Drinking water", "Cooking oil", "Fuel or kerosene", "Chemicals"],
  };
}
