import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // In a real application, you would forward this to a Google Apps Script Web App URL
    // const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    // await fetch(scriptUrl, { method: "POST", body: JSON.stringify(data) });

    console.log("[SYNC] Received payload:", data);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({ success: true, message: "Data synced successfully" });
  } catch (error) {
    console.error("[SYNC] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to sync" }, { status: 500 });
  }
}
