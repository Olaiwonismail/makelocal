export type SupplierGroup = "Materials" | "Workshops" | "Services";

export type Supplier = {
  name: string;
  kind: string;
  location: string;
  distanceKm: number;
  leadTime: string;
  capabilities: string[];
  note: string;
  price: {
    label: string;
    amount: number;
    unit?: string;
    // Where the price comes from, so a guess is never shown as a quote.
    basis: string;
  };
  phone?: string;
};

export type SupplyChain = {
  product: string;
  origin: string;
  currency: string;
  groups: {
    name: SupplierGroup;
    noun: string;
    description: string;
    suppliers: Supplier[];
  }[];
};

const sample = "Sample listing, not a live price";

// Placeholder until the backend exists: the AI will find real businesses near the
// user's stated location. These are made-up sample listings, not real companies.
export function getSupplyChain(product: string): SupplyChain {
  return {
    product: product || "25 litre jerrycan",
    origin: "Ikeja",
    currency: "NGN",
    groups: [
      {
        name: "Materials",
        noun: "supplier",
        description:
          "Resin, colorant and caps. Prices move with the exchange rate, so treat these as indicative.",
        suppliers: [
          {
            name: "Harbour Polymers",
            kind: "Polymer distributor",
            location: "Trade Fair, Ojo, Lagos",
            distanceKm: 28,
            leadTime: "Stock on hand",
            capabilities: ["HDPE blow-moulding grade", "PP injection grade", "25 kg bags"],
            note: "Holds HM9450F and equivalent grades. Minimum order one tonne. Delivers within Lagos.",
            price: { label: "From", amount: 1540, unit: "kg", basis: sample },
          },
          {
            name: "Alaba Resin Hub",
            kind: "Resin and masterbatch",
            location: "Alaba International, Lagos",
            distanceKm: 32,
            leadTime: "2 days",
            capabilities: ["Masterbatch colorant", "Recycled HDPE", "Small quantities"],
            note: "Good for colorant and trial quantities under 500 kg. Cash or transfer on collection.",
            price: { label: "Colorant from", amount: 3200, unit: "kg", basis: sample },
          },
          {
            name: "Eastline Steel & Metals",
            kind: "Steel supplier",
            location: "Ikorodu Road, Lagos",
            distanceKm: 14,
            leadTime: "3 days",
            capabilities: ["Mild steel sheet", "P20 tool steel", "Cutting to size"],
            note: "Supplies the tool steel a mould maker will need. Will cut blanks to your drawing.",
            price: { label: "Tool steel from", amount: 4800, unit: "kg", basis: sample },
          },
          {
            name: "Capstone Closures",
            kind: "Cap manufacturer",
            location: "Agbara, Ogun State",
            distanceKm: 46,
            leadTime: "1 week",
            capabilities: ["58 mm DIN caps", "Food-safe PP", "Foam liners"],
            note: "Moulds caps in volume. Cheaper than making your own below 10,000 units.",
            price: { label: "Per cap", amount: 145, basis: sample },
          },
        ],
      },
      {
        name: "Workshops",
        noun: "workshop",
        description:
          "One of these runs your production. The mould maker is a one-off cost before the first run.",
        suppliers: [
          {
            name: "Mainland Blow Moulders",
            kind: "Blow moulding",
            location: "Ikeja Industrial Estate, Lagos",
            distanceKm: 6,
            leadTime: "2 weeks",
            capabilities: ["Extrusion blow moulding", "Up to 30 litres", "HDPE"],
            note: "Runs jerrycans and chemical drums on contract. Can use your mould or rent one of theirs.",
            price: { label: "Per unit, 1,000 pcs", amount: 980, basis: sample },
          },
          {
            name: "Isolo Plastics Workshop",
            kind: "Injection moulding",
            location: "Isolo, Lagos",
            distanceKm: 12,
            leadTime: "10 days",
            capabilities: ["Injection moulding", "250 ton press", "PP and HDPE"],
            note: "Makes handles, caps and small parts. Useful if you bring cap production in-house later.",
            price: { label: "Per unit, 1,000 pcs", amount: 620, basis: sample },
          },
          {
            name: "Precision Mould & Die",
            kind: "Tool / mould maker",
            location: "Ilupeju, Lagos",
            distanceKm: 9,
            leadTime: "6 to 8 weeks",
            capabilities: ["CNC machining", "Blow moulds", "Mould repair"],
            note: "Builds single and double cavity blow moulds from a sample or drawing.",
            price: { label: "Per mould", amount: 6500000, basis: sample },
          },
          {
            name: "Ojota Fabrication Works",
            kind: "Machine repair",
            location: "Ojota, Lagos",
            distanceKm: 5,
            leadTime: "Same week",
            capabilities: ["Machine servicing", "Welding", "Spare parts"],
            note: "Services used blow moulders and compressors. Worth a visit before buying second-hand.",
            price: { label: "Call-out from", amount: 45000, basis: sample },
          },
        ],
      },
      {
        name: "Services",
        noun: "service",
        description: "Finishing, packing and getting it to buyers.",
        suppliers: [
          {
            name: "Allen Print & Finish",
            kind: "Printing and painting",
            location: "Allen Avenue, Ikeja",
            distanceKm: 3,
            leadTime: "5 days",
            capabilities: ["Screen printing", "Spray painting", "Labels"],
            note: "Prints your brand and capacity marks on HDPE. Minimum run 500 pieces.",
            price: { label: "Per unit from", amount: 35, basis: sample },
          },
          {
            name: "Oregun Packaging",
            kind: "Packaging",
            location: "Oregun, Ikeja",
            distanceKm: 4,
            leadTime: "3 days",
            capabilities: ["Stretch wrap", "Cartons", "Palletising"],
            note: "Bundles and wraps finished units for distributors. Can collect from the workshop.",
            price: { label: "Per 100 units", amount: 2500, basis: sample },
          },
          {
            name: "Swift Haulage",
            kind: "Transport",
            location: "Apapa, Lagos",
            distanceKm: 22,
            leadTime: "Next day",
            capabilities: ["Truck hire", "Lagos and Ogun routes", "Warehouse pickup"],
            note: "Moves resin in and finished stock out. Book a day ahead for a 10 tonne truck.",
            price: { label: "Per trip from", amount: 85000, basis: sample },
          },
        ],
      },
    ],
  };
}
