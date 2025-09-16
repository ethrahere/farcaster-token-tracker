export function formatCurrency(value: number | null, options?: Intl.NumberFormatOptions) {
  if (value === null || Number.isNaN(value) || value === 0) {
    return "No data";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1 ? 0 : 2,
    notation: value >= 1_000_000_000 ? "compact" : "standard",
    ...options,
  }).format(value);
}

export function formatPercent(value: number | null, fallback = "-") {
  if (value === null || Number.isNaN(value)) {
    return fallback;
  }

  return `${value.toFixed(2)}%`;
}

export function formatDelta(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "-";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}
