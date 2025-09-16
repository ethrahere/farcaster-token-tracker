"use client";

import { useMemo } from "react";
import type { TokenMarketSnapshot } from "@/types/token";

interface ExportButtonProps {
  tokens: TokenMarketSnapshot[];
  disabled?: boolean;
}

export function ExportButton({ tokens, disabled }: ExportButtonProps) {
  const csvContent = useMemo(() => {
    const header = [
      "Token Name",
      "Symbol",
      "Current Market Cap",
      "ATH Market Cap",
      "% Below ATH",
      "24h Change %",
      "Last Updated",
    ];

    const rows = tokens.map((token) => [
      token.name,
      token.symbol,
      token.marketCap ?? "",
      token.athMarketCap,
      token.percentBelowAth ?? "",
      token.priceChangePercentage24h ?? "",
      token.lastUpdated ?? "",
    ]);

    return [header, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            if (cell === null || cell === undefined) {
              return "";
            }
            const stringValue = typeof cell === "number" ? cell.toString() : cell;
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");
  }, [tokens]);

  const handleExport = () => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.href = url;
    link.setAttribute("download", `farcaster-tokens-${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-card/80 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled || tokens.length === 0}
    >
      📄
      <span className="hidden sm:inline">Export CSV</span>
    </button>
  );
}
