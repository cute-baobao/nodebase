import db from "@/db/instance";
import { NodeExecutor } from "@/features/executions/type";
import { resendChannel } from "@/inngest/channels";
import { updateNodeStatus } from "@/inngest/utils";
import { NodeStatus } from "@/lib/configs/workflow-constants";
import { decrypt } from "@/lib/utils/encryption";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { Resend } from "resend";
import { checkNodeCanExecute } from "../../utils/check-node-can-execute";
import { ResendData, resendDataSchema } from "./schema";

type ResendNodeData = Partial<ResendData>;

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

export const resendExecutor: NodeExecutor<ResendNodeData> = async ({
  data,
  nodeId,
  context,
  step,
  userId,
  publish,
  executionId,
}) => {
  const channel = resendChannel();
  const changeNodeStatusUtil = async (status: NodeStatus) => {
    await step.run("update-resend-node-status", async () => {
      return updateNodeStatus({
        channel,
        nodeId,
        executionId,
        status,
        publish,
      });
    });
  };
  try {
    await changeNodeStatusUtil("loading");

    await checkNodeCanExecute(nodeId);

    const safeData = resendDataSchema.safeParse(data);
    if (!safeData.success) {
      throw new NonRetriableError(
        `Invalid data for Resend node : ${safeData.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    const credential = await step.run("get-resend-credential", () => {
      return db.query.credential.findFirst({
        where: (c, { and, eq }) =>
          and(eq(c.id, safeData.data.credentialId), eq(c.userId, userId)),
      });
    });

    if (!credential) {
      throw new NonRetriableError("No valid Resend credential found");
    }

    const credentialValue = decrypt(credential.value);
    const from = Handlebars.compile(safeData.data.from)(context);
    const to = safeData.data.to.map((email) =>
      Handlebars.compile(email.email)(context),
    );
    const subject = Handlebars.compile(safeData.data.subject)(context);
    const content = Handlebars.compile(safeData.data.content)(context);

    const result = await step.run("resend-send-email", async () => {
      const resend = new Resend(credentialValue);
      return await resend.emails.send({
        from,
        to,
        subject,
        html: content,
      });
    });

    if (result.error) {
      throw new NonRetriableError(`Resend API error: ${result.error.message}`);
    }

    await changeNodeStatusUtil("success");

    return {
      ...context,
      [safeData.data.variableName]: {
        data: result.data,
      },
    };
  } catch (error) {
    if (error instanceof NonRetriableError) {
      await changeNodeStatusUtil("error");
    } else {
      await changeNodeStatusUtil("retrying");
    }
    throw error;
  }
};
