import { checkWorkflowActive } from "@/features/triggers/utils/check-workflow-active";
import { sendWorkflowExecution } from "@/inngest/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required query parameter: workflowId",
        },
        { status: 400 },
      );
    }

    await checkWorkflowActive(workflowId);

    const body = await request.json();

    const stripeData = {
      // event metadata
      eventId: body.id,
      eventType: body.type,
      timestamp: body.created,
      livemode: body.livemode,
      raw: body.data?.object,
    };

    await sendWorkflowExecution({
      workflowId,
      initialData: {
        stripe: stripeData,
      },
    });

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to process stripe event:" +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    );
  }
}
