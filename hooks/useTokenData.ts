"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  TokenDetail,
  TokenMarketSnapshot,
  TokenResponse,
  TokensResponse,
} from "@/types/token";

const FIVE_MINUTES = 1000 * 60 * 5;

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function useTokenList() {
  return useQuery<{ tokens: TokenMarketSnapshot[]; asOf: string }>(
    {
      queryKey: ["tokens"],
      queryFn: () => fetchJson<TokensResponse>("/api/tokens"),
      refetchInterval: FIVE_MINUTES,
      refetchOnWindowFocus: false,
      staleTime: FIVE_MINUTES,
    },
  );
}

export function useTokenDetail(symbol: string) {
  return useQuery<{ token: TokenDetail | null; asOf: string }>(
    {
      queryKey: ["token", symbol.toLowerCase()],
      queryFn: () => fetchJson<TokenResponse>(`/api/tokens/${symbol}`),
      enabled: Boolean(symbol),
      refetchInterval: FIVE_MINUTES,
      refetchOnWindowFocus: false,
      staleTime: FIVE_MINUTES,
    },
  );
}
