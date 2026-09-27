// Mirrors backend/app/models.py (serialised as camelCase).

export type StageName = "follow_up" | "analysis" | "cost" | "suppliers" | "production" | "quotes";

export type Source = { title: string; url?: string | null };

export type Answers = {
  quantity: string;
  exactQuantity: number | null;
  sellIn: string;
  makeIn: string;
  match: string;
  followUp: string;
  followUpText: string;
};

export type Project = {
  id: string;
  product: string;
  input: string;
  demo: boolean;
  answers: Answers;
  stages: StageName[];
  createdAt: string;
};

export type ProjectCard = {
  id: string;
  product: string;
  started: string;
  units: number | null;
  location: string;
  stage: number;
  status: string;
  metric: {
    label: string;
    amount?: number | null;
    currency?: string | null;
    unit?: string | null;
    text?: string | null;
  };
  action: { label: string; path: string };
};

export type FollowUpQuestion = { question: string; hint: string; options: string[] };

export type ProductAnalysis = {
  product: string;
  summary: string;
  branches: { title: string; items: string[] }[];
  materials: { name: string; role: string; perUnit: string; perBatch: string; source: string }[];
  process: { title: string; detail: string }[];
  equipment: { name: string; purpose: string; costUsdLow?: number | null; costUsdHigh?: number | null }[];
  context: string[];
  sources: Source[];
};

export type CostLine = { label: string; perUnit: number; basis: string; kind: "sourced" | "estimate" };

export type CostComparison = {
  product: string;
  unit: string;
  location: string;
  currency: string;
  units: number;
  local: CostLine[];
  imported: CostLine[];
  verdict: string;
  caveats: string[];
  references: { label: string; value: string; source: string }[];
  sources: Source[];
};

export type Price = {
  label: string;
  amount: number;
  unit?: string | null;
  compact?: boolean;
  basis?: string;
};

export type SupplierGroupName = "Materials" | "Workshops" | "Services";

export type Supplier = {
  name: string;
  kind: string;
  location: string;
  distanceKm?: number | null;
  leadTime?: string | null;
  capabilities: string[];
  note: string;
  price?: Price | null;
  phone?: string | null;
  website?: string | null;
  rating?: number | null;
};

export type SupplyChain = {
  product: string;
  origin: string;
  currency: string;
  groups: { name: SupplierGroupName; noun: string; description: string; suppliers: Supplier[] }[];
  sources: Source[];
};

export type ProductionPlan = {
  product: string;
  batch: number;
  unit: string;
  flow: { label: string; key?: boolean }[];
  stats: { label: string; value: string; note: string }[];
  materials: { item: string; quantity: string }[];
  machines: { item: string; source: string }[];
  steps: { title: string; when: string; detail: string; who: string }[];
};

export type Recipient = {
  name: string;
  kind: string;
  area: string;
  distanceKm?: number | null;
  price?: Price | null;
  selected: boolean;
  phone?: string | null;
  website?: string | null;
};

export type Quote = {
  supplier: string;
  note: string;
  perUnit?: number | null;
  minOrder?: number | null;
  leadTime: string;
  terms: string;
  flatTotal?: number | null;
};

export type QuoteRequest = {
  product: string;
  currency: string;
  batch: number;
  unit: string;
  brief: string;
  attachments: string[];
  recipients: Recipient[];
  quotes: Quote[];
};

export type StageData = {
  follow_up: FollowUpQuestion;
  analysis: ProductAnalysis;
  cost: CostComparison;
  suppliers: SupplyChain;
  production: ProductionPlan;
  quotes: QuoteRequest;
};
