import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  // Validate CRON_SECRET to ensure the request comes from Vercel Cron
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const supabase = await createClient();

    // Call RPC to auto-complete expired contracts
    // This would call: supabase.rpc('auto_complete_expired_contracts')
    // For now, mock implementation that finds and updates expired contracts
    const { data, error } = await supabase
      .from("contracts")
      .update({ status: "completed" })
      .eq("status", "active")
      .lt("end_date", new Date().toISOString())
      .select("id");

    if (error) {
      console.error("[cron/expire-contracts] Error:", error.message);
      return NextResponse.json(
        { error: "Failed to expire contracts", details: error.message },
        { status: 500 }
      );
    }

    const count = data?.length ?? 0;
    console.log(`[cron/expire-contracts] Expired ${count} contracts`);

    return NextResponse.json({
      success: true,
      expiredCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cron/expire-contracts] Unexpected error:", message);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
