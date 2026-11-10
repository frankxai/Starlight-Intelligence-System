import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestId, action } = body; // action: 'approve' | 'reject'

    return NextResponse.json({
      success: true,
      requestId,
      status: action === "approve" ? "approved" : "rejected",
      timestamp: new Date().toISOString(),
      receipt: `sip:receipt:${Date.now()}:${requestId}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}
