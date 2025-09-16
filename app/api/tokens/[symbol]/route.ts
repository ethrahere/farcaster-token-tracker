import { NextResponse } from "next/server";
import { fetchTokenSnapshot } from "@/lib/tokenService";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  let symbol = 'unknown';
  try {
    ({ symbol } = await params);
    const payload = await fetchTokenSnapshot(symbol);
    if (!payload.token) {
      return NextResponse.json({ message: "Token not found" }, { status: 404 });
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch token detail for ${symbol}`, error);
    return NextResponse.json(
      {
        message: "Unable to load token data at this time.",
      },
      { status: 500 },
    );
  }
}
