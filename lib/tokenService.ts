import { getTokenDefinitionBySymbol, getTokenDefinitions } from "@/lib/athData";
import type {
  TokenDetail,
  TokenMarketSnapshot,
  TokenResponse,
  TokensResponse,
} from "@/types/token";

const _COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

const defaultBase = "https://api.coingecko.com/api/v3";

const COINGECKO_API_BASE = process.env.COINGECKO_API_BASE ?? defaultBase;

// Free API doesn't need authentication headers
const _COINGECKO_API_KEY_HEADER = "x-cg-demo-api-key";

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
  ath?: number | null;  // ATH price
  ath_change_percentage?: number | null;  // Percentage change from ATH (negative = below ATH)
  ath_date?: string | null;  // When ATH occurred
  ath_market_cap?: number | null;  // We'll calculate this
};

async function fetchFarcasterEcosystemTokens(): Promise<CoinMarketResponse[]> {
  const DISABLE_FETCH =
    process.env.COINGECKO_DISABLE === "1" ||
    process.env.DISABLE_EXTERNAL_REQUESTS === "1" ||
    process.env.NEXT_PUBLIC_OFFLINE === "1";

  if (DISABLE_FETCH) {
    return [];
  }

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&category=farcaster-ecosystem&order=market_cap_desc&per_page=50&page=1`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `CoinGecko Farcaster ecosystem request failed with status ${response.status}: ${errorText}`,
      );
      return [];
    }

    return (await response.json()) as CoinMarketResponse[];
  } catch (error) {
    console.error("CoinGecko Farcaster ecosystem request failed", error);
    return [];
  }
}

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

async function fetchIndividualTokenData(coingeckoId: string): Promise<CoinMarketResponse | null> {
  const DISABLE_FETCH =
    process.env.COINGECKO_DISABLE === "1" ||
    process.env.DISABLE_EXTERNAL_REQUESTS === "1" ||
    process.env.NEXT_PUBLIC_OFFLINE === "1";

  if (DISABLE_FETCH) {
    return null;
  }

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${coingeckoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      console.error(`Individual token fetch failed for ${coingeckoId}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Convert individual token API response to CoinMarketResponse format
    const currentPrice = data.market_data?.current_price?.usd || null;
    const athPrice = data.market_data?.ath?.usd || null;
    const circulatingSupply = data.market_data?.circulating_supply || null;

    // Calculate ATH market cap if we have the data
    let athMarketCap = null;
    if (athPrice && circulatingSupply) {
      athMarketCap = athPrice * circulatingSupply;
    }

    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      image: data.image?.large || data.image?.small || null,
      market_cap_rank: data.market_cap_rank || null,
      current_price: currentPrice,
      market_cap: data.market_data?.market_cap?.usd || null,
      fully_diluted_valuation: data.market_data?.fully_diluted_valuation?.usd || null,
      total_volume: data.market_data?.total_volume?.usd || null,
      price_change_percentage_24h: data.market_data?.price_change_percentage_24h || null,
      circulating_supply: circulatingSupply,
      last_updated: data.market_data?.last_updated || null,
      ath: athPrice,
      ath_market_cap: athMarketCap,
    } as CoinMarketResponse;
  } catch (error) {
    console.error(`Individual token fetch failed for ${coingeckoId}:`, error);
    return null;
  }
}

function getAthMarketCapFromStaticData(coingeckoId: string): number {
  const definitions = getTokenDefinitions();
  const definition = definitions.find(
    (token) => token.coingeckoId.toLowerCase() === coingeckoId.toLowerCase()
  );
  return definition?.athMarketCap || 0;
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
  athMarketCap?: number,
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
  // Use market cap if available, otherwise fall back to fully diluted valuation
  let marketCap = market?.market_cap ?? null;

  // If market cap is 0 or null, try to use fully diluted valuation as fallback
  if ((marketCap === null || marketCap === 0) && market?.fully_diluted_valuation && market.fully_diluted_valuation > 0) {
    marketCap = market.fully_diluted_valuation;
  }

  // Use ATH change percentage directly from API if available, otherwise calculate from athMarketCap
  let percentBelowAth: number | null = null;

  if (athMarketCap && athMarketCap > 0) {
    percentBelowAth = computePercentBelowAth(marketCap, athMarketCap);
  }

  return {
    marketCap,
    percentBelowAth,
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
  // Try to fetch from Farcaster ecosystem API first
  const farcasterTokens = await fetchFarcasterEcosystemTokens();

  let tokens: TokenMarketSnapshot[];

  if (farcasterTokens.length > 0) {
    // Use Farcaster ecosystem tokens
    tokens = farcasterTokens.map<TokenMarketSnapshot>((market) => {
      // Calculate ATH market cap from API's ATH price and circulating supply
      // This is more accurate than static data since it reflects actual ATH price
      let athMarketCap = 0;

      if (market.ath && market.circulating_supply && market.circulating_supply > 0) {
        athMarketCap = market.ath * market.circulating_supply;
      } else {
        // Fallback to static data only if API data is missing
        athMarketCap = getAthMarketCapFromStaticData(market.id);
      }

      const snapshot = snapshotFromMarket(market, athMarketCap);

      return {
        name: market.name,
        symbol: market.symbol.toUpperCase(),
        coingeckoId: market.id,
        athMarketCap: athMarketCap,
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
  } else {
    // Fallback to static data approach
    console.log("Falling back to static token data");
    const definitions = getTokenDefinitions();
    const ids = definitions.map((token) => token.coingeckoId);
    const markets = await fetchCoinMarkets(ids);

    tokens = definitions.map<TokenMarketSnapshot>((definition) => {
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
  }

  return {
    tokens,
    asOf: new Date().toISOString(),
  };
}

export async function fetchTokenSnapshot(symbol: string): Promise<TokenResponse> {
  // First, try to find token in our static data for ATH market cap
  const definition = getTokenDefinitionBySymbol(symbol);

  // If we have the token in our static data, use it with market data
  if (definition) {
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

  // If not in static data, try to find by symbol in Farcaster ecosystem
  const farcasterTokens = await fetchFarcasterEcosystemTokens();
  const farcasterToken = farcasterTokens.find(
    (token) => token.symbol.toUpperCase() === symbol.toUpperCase()
  );

  if (farcasterToken) {
    // Calculate ATH market cap from API's ATH price and circulating supply
    // This is more accurate than static data since it reflects actual ATH price
    let athMarketCap = 0;

    if (farcasterToken.ath && farcasterToken.circulating_supply && farcasterToken.circulating_supply > 0) {
      athMarketCap = farcasterToken.ath * farcasterToken.circulating_supply;
    } else {
      // Fallback to static data only if API data is missing
      athMarketCap = getAthMarketCapFromStaticData(farcasterToken.id);
    }

    const snapshot = snapshotFromMarket(farcasterToken, athMarketCap);

    const token: TokenDetail = {
      name: farcasterToken.name,
      symbol: farcasterToken.symbol.toUpperCase(),
      coingeckoId: farcasterToken.id,
      athMarketCap: athMarketCap,
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

  // Final fallback: try individual token API with guessed coingecko ID
  const guessedCoingeckoId = symbol.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const individualTokenData = await fetchIndividualTokenData(guessedCoingeckoId);

  if (individualTokenData) {
    let athMarketCap = getAthMarketCapFromStaticData(individualTokenData.id);

    // Use ATH market cap from individual API if available
    if (athMarketCap === 0 && individualTokenData.ath_market_cap) {
      athMarketCap = individualTokenData.ath_market_cap;
    }
    // Don't estimate ATH for tokens without verified data

    const snapshot = snapshotFromMarket(individualTokenData, athMarketCap);

    const token: TokenDetail = {
      name: individualTokenData.name,
      symbol: individualTokenData.symbol.toUpperCase(),
      coingeckoId: individualTokenData.id,
      athMarketCap: athMarketCap,
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

  // Token not found
  return {
    token: null,
    asOf: new Date().toISOString(),
  };
}
