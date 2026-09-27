export function moneyFormat(currency: string, compact = false) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: 0,
    maximumFractionDigits: compact ? 1 : 0,
  });
}

const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

export function shortDate(iso: string) {
  const date = new Date(iso);
  return `${date.getUTCDate()} ${month.format(date)}`;
}
