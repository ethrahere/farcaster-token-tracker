export type TokenMeta = {
  name: string;
  symbol: string;
  coingeckoId: string;
  athMarketCap: number;
};

export type TokenMarketSnapshot = {
  name: string;
  symbol: string;
  coingeckoId: string;
  marketCap: number | null;
  athMarketCap: number;
  percentBelowAth: number | null;
  priceChangePercentage24h: number | null;
  lastUpdated: string | null;
  image?: string | null;
  rank?: number | null;
  totalVolume?: number | null;
  fullyDilutedValuation?: number | null;
  circulatingSupply?: number | null;
};

export type TokenDetail = TokenMarketSnapshot & {
  rank: number | null;
  totalVolume: number | null;
  fullyDilutedValuation: number | null;
  circulatingSupply: number | null;
};

export type TokensResponse = {
  tokens: TokenMarketSnapshot[];
  asOf: string;
};

export type TokenResponse = {
  token: TokenDetail | null;
  asOf: string;
};
