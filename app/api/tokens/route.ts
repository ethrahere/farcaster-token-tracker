import { NextResponse } from "next/server";
import { fetchTokensSnapshot } from "@/lib/tokenService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await fetchTokensSnapshot();
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch tokens", error);
    return NextResponse.json(
      {
        message: "Unable to load token data at this time.",
      },
      { status: 500 },
    );
  }
}
