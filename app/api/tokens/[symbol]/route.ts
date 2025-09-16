import { NextResponse } from "next/server";
import { fetchTokenSnapshot } from "@/lib/tokenService";

export const dynamic = "force-dynamic";

type Params = {
  params: {
    symbol: string;
  };
};

export async function GET(request: Request, { params }: Params) {
  try {
    const { symbol } = await params;
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
