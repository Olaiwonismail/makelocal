export const projectStages = ["Analysis", "Costing", "Suppliers", "Quotes", "Production"] as const;

export type Project = {
  product: string;
  started: string;
  units: number;
  location: string;
  // Index into projectStages of the stage in progress.
  stage: number;
  status: string;
  metric: { label: string; value: string };
  action: { label: string; path: string };
};

// Placeholder until projects are saved: there's no database yet, so the workspace
// shows sample projects.
export const sampleProjects: Project[] = [
  {
    product: "Plastic chair",
    started: "2026-09-12",
    units: 5000,
    location: "Lagos",
    stage: 3,
    status: "3 quotes received. Compare them and pick a workshop.",
    metric: { label: "Best quote so far", value: "₦2,140/unit" },
    action: { label: "Compare quotes", path: "/plan/quotes" },
  },
  {
    product: "25 litre jerrycan",
    started: "2026-09-24",
    units: 500,
    location: "Ikeja",
    stage: 3,
    status: "Waiting on 2 replies. Mainland and Isolo have quoted.",
    metric: { label: "Saving vs import", value: "₦370/unit" },
    action: { label: "Open project", path: "/plan/quotes" },
  },
  {
    product: "School desk",
    started: "2026-09-03",
    units: 200,
    location: "Ibadan",
    stage: 2,
    status: "Six welding workshops found near Ibadan. Shortlist who to contact.",
    metric: { label: "Workshops found", value: "6 nearby" },
    action: { label: "View suppliers", path: "/plan/suppliers" },
  },
  {
    product: "Ceiling fan blade",
    started: "2026-09-27",
    units: 1200,
    location: "Kano",
    stage: 1,
    status: "Analysis complete. Costing in progress.",
    metric: { label: "Status", value: "Costing" },
    action: { label: "Continue", path: "/plan/cost" },
  },
];
