import { getTokenDefinitionBySymbol, getTokenDefinitions } from "@/lib/athData";
import type {
  TokenDetail,
  TokenMarketSnapshot,
  TokenResponse,
  TokensResponse,
} from "@/types/token";

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

const defaultBase = "https://api.coingecko.com/api/v3";

const COINGECKO_API_BASE = process.env.COINGECKO_API_BASE ?? defaultBase;

// Free API doesn't need authentication headers
const COINGECKO_API_KEY_HEADER = "x-cg-demo-api-key";

type CoinMarketResponse = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  market_cap_rank: number | null;
  current_price: number | null;
  market_cap: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number | null;
  price_change_percentage_24h: number | null;
  circulating_supply: number | null;
  last_updated: string | null;
};

async function fetchCoinMarkets(ids: string[]): Promise<CoinMarketResponse[]> {
  if (!ids.length) {
    return [];
  }

  const DISABLE_FETCH =
    process.env.COINGECKO_DISABLE === "1" ||
    process.env.DISABLE_EXTERNAL_REQUESTS === "1" ||
    process.env.NEXT_PUBLIC_OFFLINE === "1";

  if (DISABLE_FETCH) {
    return [];
  }

  const search = new URLSearchParams({
    vs_currency: "usd",
    ids: ids.join(","),
    order: "market_cap_desc",
    per_page: String(Math.max(ids.length, 50)),
    page: "1",
    sparkline: "false",
    price_change_percentage: "24h",
  });

  try {
    const response = await fetch(`${COINGECKO_API_BASE}/coins/markets?${search.toString()}`, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `CoinGecko request failed with status ${response.status}: ${errorText}`,
      );
      return [];
    }

    return (await response.json()) as CoinMarketResponse[];
  } catch (error) {
    console.error("CoinGecko request failed", error);
    return [];
  }
}

function computePercentBelowAth(marketCap: number | null, athMarketCap: number): number | null {
  if (marketCap === null || athMarketCap <= 0) {
    return null;
  }

  const percent = ((athMarketCap - marketCap) / athMarketCap) * 100;
  return Number(percent.toFixed(2));
}

function snapshotFromMarket(
  market: CoinMarketResponse | undefined,
  athMarketCap: number,
): Pick<
  TokenDetail,
  | "marketCap"
  | "percentBelowAth"
  | "priceChangePercentage24h"
  | "lastUpdated"
  | "image"
  | "rank"
  | "totalVolume"
  | "fullyDilutedValuation"
  | "circulatingSupply"
> {
  const marketCap = market?.market_cap ?? null;

  return {
    marketCap,
    percentBelowAth: computePercentBelowAth(marketCap, athMarketCap),
    priceChangePercentage24h: market?.price_change_percentage_24h ?? null,
    lastUpdated: market?.last_updated ?? null,
    image: market?.image ?? null,
    rank: market?.market_cap_rank ?? null,
    totalVolume: market?.total_volume ?? null,
    fullyDilutedValuation: market?.fully_diluted_valuation ?? null,
    circulatingSupply: market?.circulating_supply ?? null,
  };
}

export async function fetchTokensSnapshot(): Promise<TokensResponse> {
  const definitions = getTokenDefinitions();
  const ids = definitions.map((token) => token.coingeckoId);
  const markets = await fetchCoinMarkets(ids);

  const tokens = definitions.map<TokenMarketSnapshot>((definition) => {
    const market = markets.find(
      (entry) => entry.id.toLowerCase() === definition.coingeckoId.toLowerCase(),
    );

    const snapshot = snapshotFromMarket(market, definition.athMarketCap);

    return {
      name: definition.name,
      symbol: definition.symbol,
      coingeckoId: definition.coingeckoId,
      athMarketCap: definition.athMarketCap,
      marketCap: snapshot.marketCap,
      percentBelowAth: snapshot.percentBelowAth,
      priceChangePercentage24h: snapshot.priceChangePercentage24h,
      lastUpdated: snapshot.lastUpdated,
      image: snapshot.image,
      rank: snapshot.rank,
      totalVolume: snapshot.totalVolume,
      fullyDilutedValuation: snapshot.fullyDilutedValuation,
      circulatingSupply: snapshot.circulatingSupply,
    };
  });

  return {
    tokens,
    asOf: new Date().toISOString(),
  };
}

export async function fetchTokenSnapshot(symbol: string): Promise<TokenResponse> {
  const definition = getTokenDefinitionBySymbol(symbol);

  if (!definition) {
    return {
      token: null,
      asOf: new Date().toISOString(),
    };
  }

  const [market] = await fetchCoinMarkets([definition.coingeckoId]);
  const snapshot = snapshotFromMarket(market, definition.athMarketCap);

  const token: TokenDetail = {
    name: definition.name,
    symbol: definition.symbol,
    coingeckoId: definition.coingeckoId,
    athMarketCap: definition.athMarketCap,
    marketCap: snapshot.marketCap,
    percentBelowAth: snapshot.percentBelowAth,
    priceChangePercentage24h: snapshot.priceChangePercentage24h,
    lastUpdated: snapshot.lastUpdated,
    image: snapshot.image,
    rank: snapshot.rank ?? null,
    totalVolume: snapshot.totalVolume ?? null,
    fullyDilutedValuation: snapshot.fullyDilutedValuation ?? null,
    circulatingSupply: snapshot.circulatingSupply ?? null,
  };

  return {
    token,
    asOf: new Date().toISOString(),
  };
}
