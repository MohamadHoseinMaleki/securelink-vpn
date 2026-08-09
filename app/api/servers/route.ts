import { NextResponse } from "next/server";
import { mockServers } from "@/lib/servers";

// Simple demo endpoint. In production you can fetch from publicvpnlist.com
// or any free source and cache the result here.
export async function GET() {
  // Simulate slight delay
  await new Promise((r) => setTimeout(r, 200));

  return NextResponse.json({
    success: true,
    updatedAt: new Date().toISOString(),
    servers: mockServers,
  });
}