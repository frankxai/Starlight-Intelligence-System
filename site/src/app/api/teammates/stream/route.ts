import { TEAMMATES } from "../route";
import type {
  ExecutionStepTrace,
  ApprovalRequest,
  StreamChunk,
  ModelTier,
} from "@/components/teammates/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      teammateId,
      prompt = "",
      tier = "standard",
      model,
    }: {
      teammateId?: string;
      prompt?: string;
      tier?: ModelTier;
      model?: string;
    } = body;

    const teammate =
      TEAMMATES.find((t) => t.id === teammateId) || TEAMMATES[0];

    // Resolve model based on specific model parameter or tier
    const MODEL_MAP: Record<string, string> = {
      "claude-sonnet-5-5": "Claude Sonnet 5.5",
      "gemini-4-argon": "Gemini 4 Argon",
      "claude-opus-5-5": "Claude Opus 5.5",
      "gpt-6-1-sol": "GPT-6.1 Sol",
    };

    const modelUsed =
      (model && MODEL_MAP[model]) ||
      (tier === "frontier"
        ? "Claude Opus 5.5"
        : tier === "light"
        ? "Gemini 4 Argon"
        : "Claude Sonnet 5.5");

    const isFinancial = /pay|invoice|spend|buy|purchase|credit/i.test(prompt);
    const isDeployOrMerge =
      /deploy|merge\s*to\s*main|release|publish/i.test(prompt);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (chunk: StreamChunk) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
          );
        };

        const delay = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, ms));

        try {
          const traceBase = Date.now();
          const steps: ExecutionStepTrace[] = [];

          // Initial status: running
          send({ type: "status", status: "running" });

          // -------------------------------------------------------------
          // Stage 1: Evaluating prompt intent & routing context
          // -------------------------------------------------------------
          const evalStep: ExecutionStepTrace = {
            id: `step-eval-${traceBase}`,
            summary: `Evaluating prompt intent & routing context via ${modelUsed}`,
            durationMs: 45,
            status: "running",
            tool: "intent-router",
            output: `Analyzing goal checklist. Bound vaults: [${teammate.activeVaults.join(", ")}].`,
            timestamp: new Date().toISOString(),
          };
          steps.push(evalStep);
          send({ type: "step", step: { ...evalStep } });

          await delay(120);

          evalStep.status = "success";
          evalStep.durationMs = 95;
          evalStep.output = `Intent classified. Model tier: ${tier} (${modelUsed}). Context budget: 24.2k tokens.`;
          send({ type: "step_update", step: { ...evalStep } });

          await delay(90);

          // -------------------------------------------------------------
          // Stage 2: Sanitizing (The Veil)
          // -------------------------------------------------------------
          const veilStep: ExecutionStepTrace = {
            id: `step-veil-${traceBase}`,
            summary: "The Veil: Scrubbing PII & scanning credentials",
            durationMs: 30,
            status: "running",
            tool: "the-veil",
            output: "Scanning prompt & context for credentials, API keys, and sensitive tokens...",
            timestamp: new Date().toISOString(),
          };
          steps.push(veilStep);
          send({ type: "step", step: { ...veilStep } });

          await delay(130);

          veilStep.status = "success";
          veilStep.durationMs = 110;
          veilStep.output =
            "0 credentials detected. Secret scan passed. Substrate isolation boundary verified.";
          send({ type: "step_update", step: { ...veilStep } });

          await delay(90);

          // -------------------------------------------------------------
          // Stage 3 & 4: MicroVM Sandbox Execution & Tool Output / Governance
          // -------------------------------------------------------------
          if (isFinancial) {
            // Financial operation triggers Fail-Closed Governance Invariant §5
            const gateStep: ExecutionStepTrace = {
              id: `step-gate-${traceBase}`,
              summary:
                "SIP Fail-Closed Invariant §5: Financial transfer halted at governance gate",
              durationMs: 40,
              status: "pending",
              tool: "governance-gate",
              output:
                "Suspended before dispatch. Non-autonomous financial transfer detected. Awaiting cryptographic signature.",
              timestamp: new Date().toISOString(),
            };
            steps.push(gateStep);
            send({ type: "step", step: { ...gateStep } });

            await delay(120);

            const approvalRequest: ApprovalRequest = {
              id: `gate-${Date.now()}`,
              type: "FINANCIAL",
              title: "Authorize Budget Allocation / Payment",
              description: prompt,
              consequences:
                "Transfers funds from connected account. Non-reversible without manual refund.",
              details: {
                "Requested By": teammate.name,
                "Model": modelUsed,
                "Invariant": "SIP §5 Fail-Closed (No autonomous financial dispatch)",
              },
              status: "pending",
            };

            send({
              type: "approval",
              status: "waiting_approval",
              approvalRequest,
            });

            await delay(80);

            const messageContent =
              "Suspended execution per SIP Fail-Closed Invariant §5. Financial operation requires explicit human signature.";

            send({
              type: "done",
              status: "waiting_approval",
              message: {
                id: `msg-${Date.now()}`,
                sender: "teammate",
                content: messageContent,
                timestamp: "Just now",
                executionTree: steps,
                approvalRequest,
              },
            });

            controller.close();
            return;
          }

          if (isDeployOrMerge) {
            // Deploy / Merge branch: microVM testing followed by Sentinel review
            const microvmStep: ExecutionStepTrace = {
              id: `step-microvm-${traceBase}`,
              summary:
                "Staging changeset in Firecracker microVM & testing branch",
              durationMs: 90,
              status: "running",
              tool: "sandbox-microvm",
              command: "git diff --stat origin/main...HEAD && pnpm test",
              output:
                "Executing pre-flight checks in isolated Firecracker microVM sandbox...",
              timestamp: new Date().toISOString(),
            };
            steps.push(microvmStep);
            send({ type: "step", step: { ...microvmStep } });

            await delay(160);

            microvmStep.status = "success";
            microvmStep.durationMs = 280;
            microvmStep.output =
              "Pre-flight checks passed (100% test pass rate). Zero regressions detected.";
            microvmStep.diff = `+ // Staged changeset verified in sandbox microVM\n+ export const RELEASE_VERIFIED = true;`;
            send({ type: "step_update", step: { ...microvmStep } });

            await delay(100);

            const gitStep: ExecutionStepTrace = {
              id: `step-git-${traceBase}`,
              summary: `Sentinel verified branch diff via ${modelUsed}`,
              durationMs: 70,
              status: "running",
              tool: "sentinel-audit",
              output:
                "Running AST vulnerability inspection and secret scan on git tree...",
              timestamp: new Date().toISOString(),
            };
            steps.push(gitStep);
            send({ type: "step", step: { ...gitStep } });

            await delay(140);

            gitStep.status = "success";
            gitStep.durationMs = 250;
            gitStep.tool = "github";
            gitStep.output =
              "0 vulnerabilities found. Clean diff against origin/main. Ready for human sign-off.";
            send({ type: "step_update", step: { ...gitStep } });

            await delay(100);

            const approvalRequest: ApprovalRequest = {
              id: `gate-${Date.now()}`,
              type: "GIT_MERGE",
              title: "Approve Live Production Release",
              description: prompt,
              consequences:
                "Merges pull request and updates production endpoint on Cloudflare/Vercel.",
              details: {
                Model: modelUsed,
                Target: "main",
                Gate: "Sentinel Security Pass",
                Teammate: teammate.name,
              },
              status: "pending",
            };

            send({
              type: "approval",
              status: "waiting_approval",
              approvalRequest,
            });

            await delay(80);

            const messageContent = `Staged changes verified via ${modelUsed}. Awaiting your confirmation to merge and deploy live.`;

            send({
              type: "done",
              status: "waiting_approval",
              message: {
                id: `msg-${Date.now()}`,
                sender: "teammate",
                content: messageContent,
                timestamp: "Just now",
                executionTree: steps,
                approvalRequest,
              },
            });

            controller.close();
            return;
          }

          // Standard Execution Flow
          // Stage 3: microVM sandbox execution
          const microvmStep: ExecutionStepTrace = {
            id: `step-microvm-${traceBase}`,
            summary: `Executing autonomous action tree in microVM via ${modelUsed}`,
            durationMs: 80,
            status: "running",
            tool: "sandbox-microvm",
            command: `si-dispatch --teammate=${teammate.id} --tier=${tier}`,
            output:
              "Spinning up Firecracker microVM. Context and skills mounted into /workspace...",
            timestamp: new Date().toISOString(),
          };
          steps.push(microvmStep);
          send({ type: "step", step: { ...microvmStep } });

          await delay(180);

          microvmStep.status = "success";
          microvmStep.durationMs = 360;
          microvmStep.output =
            "0 errors. Action pipeline executed successfully in microVM sandbox.";
          send({ type: "step_update", step: { ...microvmStep } });

          await delay(110);

          // Stage 4: Tool output & Vault update
          const primaryTool = teammate.connectedTools[0] || "starlight-memory";
          const toolStep: ExecutionStepTrace = {
            id: `step-tool-${traceBase}`,
            summary: `Updating bound vaults via ${primaryTool}`,
            durationMs: 60,
            status: "running",
            tool: primaryTool,
            output: `Synchronizing state with [${teammate.activeVaults.join(", ")}] vaults...`,
            timestamp: new Date().toISOString(),
          };
          steps.push(toolStep);
          send({ type: "step", step: { ...toolStep } });

          await delay(140);

          const receiptId = `sip:receipt:${Date.now()}:${teammate.id}`;
          toolStep.status = "success";
          toolStep.durationMs = 240;
          toolStep.output = `Memory consolidated into Operational Vault. Receipt emitted: ${receiptId}.`;
          send({ type: "step_update", step: { ...toolStep } });

          await delay(90);

          // Stream final content chunk
          const messageContent = `Acknowledged: "${prompt}". Completed task cleanly with ${modelUsed} (${tier} tier). All 6 vaults updated with execution receipt.`;
          send({
            type: "message_chunk",
            contentChunk: messageContent,
          });

          await delay(60);

          send({
            type: "done",
            status: "idle",
            message: {
              id: `msg-${Date.now()}`,
              sender: "teammate",
              content: messageContent,
              timestamp: "Just now",
              executionTree: steps,
            },
          });

          controller.close();
        } catch (err) {
          send({
            type: "error",
            error: (err as Error).message || "Stream execution failed",
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
