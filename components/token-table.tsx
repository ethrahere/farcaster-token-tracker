"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { TokenMarketSnapshot } from "@/types/token";
import { formatCurrency, formatDelta, formatPercent } from "@/lib/format";

export type SortKey = "name" | "symbol" | "marketCap" | "athMarketCap" | "percentBelowAth";

export type SortDirection = "asc" | "desc";

interface SortState {
  key: SortKey;
  direction: SortDirection;
}

interface TokenTableProps {
  tokens: TokenMarketSnapshot[];
  sort: SortState;
  onSort: (key: SortKey) => void;
  isLoading?: boolean;
}

const columnConfig: { key: SortKey; label: string; align?: "left" | "right" }[] = [
  { key: "name", label: "Token Name", align: "left" },
  { key: "symbol", label: "Symbol", align: "left" },
  { key: "marketCap", label: "Market Cap", align: "right" },
  { key: "athMarketCap", label: "ATH Market Cap", align: "right" },
  { key: "percentBelowAth", label: "% Below ATH", align: "right" },
];

function getPercentBadgeColor(percentBelowAth: number | null) {
  if (percentBelowAth === null) {
    return "bg-muted text-muted-foreground border border-border";
  }

  if (percentBelowAth <= 10) {
    return "bg-success/10 text-success border border-success/30";
  }

  if (percentBelowAth <= 30) {
    return "bg-warning/10 text-warning border border-warning/30";
  }

  return "bg-danger/10 text-danger border border-danger/30";
}

export function TokenTable({ tokens, sort, onSort, isLoading }: TokenTableProps) {
  const sortedTokens = useMemo(() => {
    const sorted = [...tokens].sort((a, b) => {
      const aValue = a[sort.key];
      const bValue = b[sort.key];

      // Handle market cap specifically - put zero/null values at the end
      if (sort.key === "marketCap") {
        const aMarketCap = a.marketCap ?? 0;
        const bMarketCap = b.marketCap ?? 0;

        if (aMarketCap === 0 && bMarketCap > 0) return 1;
        if (bMarketCap === 0 && aMarketCap > 0) return -1;
        if (aMarketCap === 0 && bMarketCap === 0) return 0;

        return sort.direction === "asc"
          ? aMarketCap - bMarketCap
          : bMarketCap - aMarketCap;
      }

      // General null/undefined handling
      if (aValue === null || aValue === undefined) {
        return 1;
      }
      if (bValue === null || bValue === undefined) {
        return -1;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sort.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const numericA = Number(aValue);
      const numericB = Number(bValue);

      return sort.direction === "asc"
        ? numericA - numericB
        : numericB - numericA;
    });

    return sorted;
  }, [tokens, sort]);

  const hasTokens = sortedTokens.length > 0;
  const statusLabel = tokens.length === 0 ? "Loading market data…" : "Refreshing market data…";

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      {hasTokens ? (
        <>
          <table className="hidden min-w-full divide-y divide-border md:table">
            <thead>
              <tr>
                {columnConfig.map((column) => {
                  const isActive = sort.key === column.key;
                  const directionSymbol = isActive ? (sort.direction === "asc" ? "↑" : "↓") : "";

                  return (
                    <th
                      key={column.key}
                      className={`px-6 py-4 ${column.align === "right" ? "text-right" : "text-left"}`}
                    >
                      <button
                        type="button"
                        onClick={() => onSort(column.key)}
                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:text-foreground"
                      >
                        <span className={`inline-flex items-center gap-2 ${column.align === "right" ? "justify-end" : "justify-start"}`}>
                          {column.label}
                          <span className="text-[10px]">{directionSymbol}</span>
                        </span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {sortedTokens.map((token) => (
                <tr key={token.symbol} className="transition hover:bg-muted/40">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    <Link
                      href={`/tokens/${token.symbol.toLowerCase()}`}
                      className="hover:text-success transition"
                    >
                      {token.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm uppercase tracking-wide text-muted-foreground">
                    {token.symbol}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-foreground">
                    {formatCurrency(token.marketCap)}
                    <div className="text-xs text-muted-foreground">
                      {formatDelta(token.priceChangePercentage24h)} 24h
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-foreground">
                    {formatCurrency(token.athMarketCap)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <span
                      className={`inline-flex min-w-[80px] justify-end rounded-full px-3 py-1 text-xs font-semibold ${getPercentBadgeColor(token.percentBelowAth)}`}
                    >
                      {formatPercent(token.percentBelowAth)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col gap-3 p-4 md:hidden">
            {sortedTokens.map((token) => (
              <Link
                key={token.symbol}
                href={`/tokens/${token.symbol.toLowerCase()}`}
                className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm transition hover:bg-background"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-foreground">{token.name}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {token.symbol}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getPercentBadgeColor(token.percentBelowAth)}`}
                  >
                    {formatPercent(token.percentBelowAth)}
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Market Cap</span>
                    <span>{formatCurrency(token.marketCap)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">ATH Market Cap</span>
                    <span>{formatCurrency(token.athMarketCap)}</span>
                  </p>
                  <p className="flex justify-between text-xs text-muted-foreground">
                    <span>24h Change</span>
                    <span>{formatDelta(token.priceChangePercentage24h)}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-sm text-muted-foreground">
          {isLoading ? "Loading market data…" : "No tokens to display right now."}
        </div>
      )}

      {isLoading && (
        <div className="border-t border-border p-6 text-center text-sm text-muted-foreground">
          {statusLabel}
        </div>
      )}
    </div>
  );
}
