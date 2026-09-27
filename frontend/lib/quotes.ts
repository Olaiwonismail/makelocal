export type Recipient = {
  name: string;
  kind: string;
  area: string;
  distanceKm: number;
  price: { label: string; amount: number; unit?: string; compact?: boolean };
  selected: boolean;
};

export type Quote = {
  supplier: string;
  note: string;
  perUnit?: number;
  minOrder?: number;
  leadTime: string;
  mould: string;
  // Used when the quote is a single job price rather than a per-unit price.
  flatTotal?: number;
};

export type QuoteRequest = {
  product: string;
  currency: string;
  batch: number;
  brief: string;
  attachments: string[];
  recipients: Recipient[];
  quotes: Quote[];
};

// Placeholder until the backend exists. The businesses are the same made-up sample
// listings as the supply chain page, and the replies are invented for the demo.
export function getQuoteRequest(product: string): QuoteRequest {
  const name = product || "25 litre jerrycan";
  return {
    product: name,
    currency: "NGN",
    batch: 500,
    brief: `${name}, blow moulded HDPE, with 58 mm screw cap and integrated handle. Batch of 500, first delivery within 8 weeks, collection in Ikeja. Please quote per unit, your minimum order, and whether the price includes the mould.`,
    attachments: ["Production plan attached", "Drawing attached", "Reply by 10 Oct"],
    recipients: [
      {
        name: "Mainland Blow Moulders",
        kind: "Blow moulding",
        area: "Ikeja",
        distanceKm: 6,
        price: { label: "Indicative", amount: 620, unit: "unit" },
        selected: true,
      },
      {
        name: "Isolo Plastics Workshop",
        kind: "Injection and blow",
        area: "Isolo",
        distanceKm: 12,
        price: { label: "Indicative", amount: 740, unit: "unit" },
        selected: true,
      },
      {
        name: "Precision Mould & Die",
        kind: "Tool and mould maker",
        area: "Ilupeju",
        distanceKm: 9,
        price: { label: "Mould", amount: 4200000, compact: true },
        selected: true,
      },
      {
        name: "Harbour Polymers",
        kind: "Polymer distributor",
        area: "Ojo",
        distanceKm: 28,
        price: { label: "Resin", amount: 1540, unit: "kg" },
        selected: false,
      },
      {
        name: "Capstone Closures",
        kind: "Cap manufacturer",
        area: "Agbara",
        distanceKm: 46,
        price: { label: "Per cap", amount: 145 },
        selected: false,
      },
    ],
    quotes: [
      {
        supplier: "Mainland Blow Moulders",
        note: "Mould quoted separately at ₦4.2M",
        perUnit: 598,
        minOrder: 500,
        leadTime: "2 weeks",
        mould: "Not included",
      },
      {
        supplier: "Isolo Plastics Workshop",
        note: "Mould amortised over first 2,000 units",
        perUnit: 810,
        minOrder: 250,
        leadTime: "3 weeks",
        mould: "Included",
      },
      {
        supplier: "Precision Mould & Die",
        note: "2-cavity mould, one revision included",
        leadTime: "6 weeks",
        mould: "The job itself",
        flatTotal: 4200000,
      },
    ],
  };
}

export function batchTotal(quote: Quote, batch: number) {
  return quote.flatTotal ?? (quote.perUnit ?? 0) * batch;
}
