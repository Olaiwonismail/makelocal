export type ProductionPlan = {
  product: string;
  batch: number;
  flow: { label: string; key?: boolean }[];
  stats: { label: string; value: string; note: string }[];
  materials: { item: string; quantity: string }[];
  machines: { item: string; source: string }[];
  steps: { title: string; when: string; detail: string; who: string }[];
};

// Placeholder until the backend exists: the AI will turn the product analysis into a
// workflow for each product. Every product gets the jerrycan plan for now.
export function getProductionPlan(product: string): ProductionPlan {
  return {
    product: product || "25 litre jerrycan",
    batch: 500,
    flow: [
      { label: "Buy HDPE" },
      { label: "Make mould" },
      { label: "Blow mould", key: true },
      { label: "Trim" },
      { label: "Leak test" },
      { label: "Cap & pack" },
    ],
    stats: [
      { label: "Suggested batch", value: "500 units", note: "One resin order, one machine booking" },
      { label: "Production time", value: "3 shifts", note: "Roughly 24 working hours" },
      { label: "First batch ready", value: "7 weeks", note: "Mould making is the long pole" },
    ],
    materials: [
      { item: "HDPE resin pellets, blow grade", quantity: "600 kg" },
      { item: "Masterbatch colorant", quantity: "12 kg" },
      { item: "Screw caps with liner", quantity: "510 pcs" },
      { item: "Labels", quantity: "510 pcs" },
      { item: "Shrink wrap and pallets", quantity: "5 pallets" },
    ],
    machines: [
      { item: "Extrusion blow moulder, 25 L", source: "Rent from workshop" },
      { item: "Jerrycan mould, 2-cavity", source: "One-off build" },
      { item: "Air compressor, 10 HP", source: "Workshop has one" },
      { item: "Hopper dryer and mixer", source: "Workshop has one" },
      { item: "Leak test rig", source: "Manual water bath" },
    ],
    steps: [
      {
        title: "Order resin and caps",
        when: "Week 1",
        detail:
          "Place the HDPE and colorant order with Harbour Polymers and the cap order with Capstone Closures. Both need lead time, so do this first.",
        who: "You",
      },
      {
        title: "Commission the mould",
        when: "Weeks 1 to 6",
        detail:
          "Send the jerrycan drawing to Precision Mould & Die. This is the longest item in the plan. Everything else waits on it.",
        who: "Mould maker",
      },
      {
        title: "Book machine time",
        when: "Week 5",
        detail:
          "Reserve three shifts on the blow moulder at Mainland Blow Moulders. Confirm they can mount your mould and that their compressor holds 8 bar.",
        who: "You and workshop",
      },
      {
        title: "Dry, mix and run",
        when: "3 shifts",
        detail:
          "Dry the resin, blend in colorant, mount the mould, set the parison and run. Expect the first 30 units to be scrap while the settings are dialled in.",
        who: "Workshop operator",
      },
      {
        title: "Trim and leak test",
        when: "Week 7",
        detail:
          "Trim the flash from the neck and handle, then leak test every unit in the water bath. Reject anything that bubbles.",
        who: "Workshop operator",
      },
      {
        title: "Cap, label and pack",
        when: "Week 7",
        detail:
          "Fit caps, apply labels and shrink wrap 100 units to a pallet. Arrange collection from the workshop.",
        who: "You and workshop",
      },
    ],
  };
}
