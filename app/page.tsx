"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTokenList } from "@/hooks/useTokenData";
import { formatDateTime } from "@/lib/format";
import { ExportButton } from "@/components/export-button";
import { SearchInput } from "@/components/search-input";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SortKey,
  SortDirection,
  TokenTable,
} from "@/components/token-table";

const REFRESH_INTERVAL_MINUTES = 5;

type SortState = {
  key: SortKey;
  direction: SortDirection;
};

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "marketCap", direction: "desc" });
  const { data, isLoading, isFetching, isError, error } = useTokenList();

  const filteredTokens = useMemo(() => {
    const tokens = data?.tokens ?? [];
    const needle = search.trim().toLowerCase();
    if (!needle) {
      return tokens;
    }

    return tokens.filter((token) => {
      return (
        token.name.toLowerCase().includes(needle) ||
        token.symbol.toLowerCase().includes(needle)
      );
    });
  }, [data?.tokens, search]);

  const handleSort = (key: SortKey) => {
    setSort((previous) => {
      if (previous.key === key) {
        return {
          key,
          direction: previous.direction === "asc" ? "desc" : "asc",
        };
      }

      return { key, direction: key === "name" || key === "symbol" ? "asc" : "desc" };
    });
  };

  const lastUpdated = data?.asOf ? formatDateTime(data.asOf) : "-";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-success">Farcaster Ecosystem</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
            Token Performance Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Track live market performance for the Farcaster token ecosystem. Auto-refreshes every
            {" "}
            {REFRESH_INTERVAL_MINUTES} minutes with current market cap, historical highs, and
            contextual insights.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <ThemeToggle />
          <ExportButton tokens={filteredTokens} disabled={isLoading || isError} />
        </div>
      </header>

      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card/60 p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Last updated</p>
          <p className="text-lg font-semibold text-foreground">{lastUpdated}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Auto-refreshes every {REFRESH_INTERVAL_MINUTES} minutes. Next refresh triggers when the
          page stays open.
        </div>
      </section>

      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or symbol" />
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-success">
            Near ATH
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-warning/10 px-3 py-1 text-warning">
            Mid-range
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-danger/10 px-3 py-1 text-danger">
            Far from ATH
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        {isError ? (
          <div className="rounded-3xl border border-danger/40 bg-danger/10 p-6 text-sm text-danger">
            Unable to load live market data. {error instanceof Error ? error.message : "Try again later."}
          </div>
        ) : (
          <TokenTable tokens={filteredTokens} sort={sort} onSort={handleSort} isLoading={isFetching} />
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">Token Deep Dives</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Each token has a detailed page with charts comparing current market cap versus all-time
            highs, top-level liquidity metrics, and supply insights.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-success">
            {filteredTokens.slice(0, 6).map((token) => (
              <Link
                key={token.symbol}
                className="rounded-full border border-success/40 bg-success/10 px-3 py-1"
                href={`/tokens/${token.symbol.toLowerCase()}`}
              >
                {token.symbol}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">Price Alerts (Coming Soon)</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure custom alerts to get notified when your tracked tokens break above or below
            target thresholds. We are planning wallet notifications and email digests.
          </p>
          <button
            type="button"
            disabled
            className="mt-4 inline-flex items-center rounded-full border border-border px-4 py-2 text-sm text-muted-foreground"
          >
            Notify me when available
          </button>
        </div>
      </section>
    </main>
  );
}
