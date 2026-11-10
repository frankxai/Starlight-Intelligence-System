import { NextResponse } from "next/server";
import { geniusEngine } from "@/../../src/genius/genius-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = geniusEngine.getProfile();
  return NextResponse.json({
    success: true,
    profile,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action = "evaluate", task = "" } = body;

    if (!task.trim()) {
      return NextResponse.json(
        { success: false, error: "Task description is required." },
        { status: 400 }
      );
    }

    if (action === "plan") {
      const plan = geniusEngine.planDelegation(task);
      return NextResponse.json({ success: true, plan });
    }

    const evaluation = geniusEngine.evaluatePath(task);
    return NextResponse.json({ success: true, evaluation });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
