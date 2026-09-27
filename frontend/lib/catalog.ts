export type Category = "Food" | "Household" | "Furniture" | "Packaging";

export type ImportedProduct = {
  name: string;
  category: Category;
  madeFrom: string;
  process: string;
  machines: string;
};

export const categories: Category[] = ["Food", "Household", "Furniture", "Packaging"];

export const importedProducts: ImportedProduct[] = [
  {
    name: "Tomato paste sachet",
    category: "Food",
    madeFrom: "Fresh tomatoes, laminate film",
    process: "Hot break, vacuum evaporation, sachet filling",
    machines: "Pulper, vacuum evaporator, form-fill-seal machine",
  },
  {
    name: "Plastic chair",
    category: "Household",
    madeFrom: "Polypropylene pellets",
    process: "Injection moulding",
    machines: "Injection moulding machine, steel mould",
  },
  {
    name: "School desk",
    category: "Furniture",
    madeFrom: "Mild steel tube, plywood",
    process: "Cutting, welding, painting",
    machines: "Pipe cutter, MIG welder, spray gun",
  },
  {
    name: "Face towel",
    category: "Household",
    madeFrom: "Cotton yarn",
    process: "Terry weaving, dyeing, hemming",
    machines: "Terry loom, dye vat, sewing machine",
  },
  {
    name: "25 litre jerrycan",
    category: "Packaging",
    madeFrom: "HDPE pellets",
    process: "Blow moulding",
    machines: "Extrusion blow moulder, mould",
  },
  {
    name: "Ceiling fan blade",
    category: "Household",
    madeFrom: "Aluminium sheet",
    process: "Cutting, pressing, powder coating",
    machines: "Hydraulic press, coating booth",
  },
];

export const suggestions = [
  "Tomato paste sachets",
  "Plastic chairs",
  "School desks",
  "Face towels",
  "Jerrycans",
  "Ceiling fan blades",
  "Exercise books",
  "Bar soap",
  "PVC pipes",
  "Paint buckets",
  "Foam mattresses",
  "Nylon shopping bags",
];
