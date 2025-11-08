import { NodeExecutor } from "@/features/executions/components/type";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import { HttpRequestData, httpRequestDataSchema } from "./schema";

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  const safeData = httpRequestDataSchema.safeParse(data);
  if (!safeData.success) {
    throw new NonRetriableError(
      `Invalid data for HTTP Request node : ${safeData.error.issues.map((i) => i.message).join(", ")}`,
    );
  }
  // TODO: Publish loading state for HTTP request node
  const result = await step.run("http-request", async () => {
    const method = safeData.data.method;
    const endpoint = safeData.data.endpoint;

    const options: KyOptions = {
      method,
    };
    if (["POST", "PUT", "PATCH"].includes(method)) {
      options.body = safeData.data.body;
      options.headers = {
        "Content-Type": "application/json",
      };
    }

    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type") || "";
    const responseData = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    const responsePaylod = {
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };
    return {
      ...context,
      [safeData.data.variableName]: responsePaylod,
    };
  });

  // TODO: Publish success state for HTTP request node
  return result;
};
