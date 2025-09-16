import tokens from "@/data/athData.json";
import type { TokenMeta } from "@/types/token";

export function getTokenDefinitions(): TokenMeta[] {
  return tokens as TokenMeta[];
}

export function getTokenDefinitionBySymbol(symbol: string): TokenMeta | undefined {
  const normalized = symbol.toLowerCase();
  return getTokenDefinitions().find(
    (token) => token.symbol.toLowerCase() === normalized,
  );
}

export function getTokenDefinitionById(id: string): TokenMeta | undefined {
  const normalized = id.toLowerCase();
  return getTokenDefinitions().find(
    (token) => token.coingeckoId.toLowerCase() === normalized,
  );
}
