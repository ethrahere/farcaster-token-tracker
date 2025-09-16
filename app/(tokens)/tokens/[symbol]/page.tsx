"use client";

import Link from "next/link";
import { useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, Cell } from "recharts";
import { useTokenDetail } from "@/hooks/useTokenData";
import { formatCurrency, formatDateTime, formatPercent } from "@/lib/format";

const COLORS = ["#6366F1", "#EC4899"];

export default function TokenDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol: symbolParam } = use(params);
  const symbol = symbolParam.toUpperCase();
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isFetching } = useTokenDetail(symbol);

  const token = data?.token ?? null;

  const chartData = useMemo(() => {
    if (!token) {
      return [];
    }

    return [
      { label: "Current", value: token.marketCap ?? 0, color: COLORS[0] },
      { label: "ATH", value: token.athMarketCap, color: COLORS[1] },
    ];
  }, [token]);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12">
        <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
        <div className="h-20 animate-pulse rounded-3xl bg-muted" />
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (isError || !token) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Token not available</h1>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "We couldn\'t load this token right now."}
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-border px-4 py-2 text-sm text-foreground"
          >
            Go back
          </button>
          <Link
            href="/"
            className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground"
          >
            View dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Farcaster Token</p>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            {token.name} ({token.symbol})
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Real-time market snapshot with performance versus all-time highs.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm"
          >
            ← Back to overview
          </Link>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm"
            disabled={isFetching}
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <section className="grid gap-4 rounded-3xl border border-border bg-card/60 p-6 shadow-card sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Current Market Cap</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {formatCurrency(token.marketCap)}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Last updated {formatDateTime(token.lastUpdated)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">ATH Market Cap</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {formatCurrency(token.athMarketCap)}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Currently {formatPercent(token.percentBelowAth)} below all-time high levels.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-card">
        <h2 className="text-lg font-semibold text-foreground">ATH vs Current Market Cap</h2>
        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer>
            <BarChart data={chartData} barSize={80}>
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                tickFormatter={(value) => formatCurrency(value as number)}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={120}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderRadius: 16,
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Bar dataKey="value" radius={[12, 12, 12, 12]}>
                {chartData.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-border bg-card/60 p-6 shadow-card">
          <h3 className="text-base font-semibold text-foreground">Liquidity & Volume</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Market Cap Rank</dt>
              <dd className="text-foreground">{token.rank ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">24h Volume</dt>
              <dd className="text-foreground">{formatCurrency(token.totalVolume ?? null)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Fully Diluted Valuation</dt>
              <dd className="text-foreground">
                {formatCurrency(token.fullyDilutedValuation ?? null)}
              </dd>
            </div>
          </dl>
        </article>
        <article className="rounded-3xl border border-border bg-card/60 p-6 shadow-card">
          <h3 className="text-base font-semibold text-foreground">Supply</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Circulating Supply</dt>
              <dd className="text-foreground">
                {token.circulatingSupply ? token.circulatingSupply.toLocaleString() : "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">ATH vs Current</dt>
              <dd className="text-foreground">{formatPercent(token.percentBelowAth)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Direct link</dt>
              <dd>
                <Link
                  href={`https://www.coingecko.com/en/coins/${token.coingeckoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-success underline underline-offset-2"
                >
                  View on CoinGecko
                </Link>
              </dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
}
