import { NodeExecutor } from "@/features/executions/components/type";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import { HttpRequestData, httpRequestDataSchema } from "./schema";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

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
    const endpoint = Handlebars.compile(safeData.data.endpoint)(context);

    const options: KyOptions = {
      method,
    };
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const resolved = Handlebars.compile(safeData.data.body)(context);
      try {
        JSON.parse(resolved); // Validate JSON
      } catch (e) {
        throw new NonRetriableError(
          `Invalid JSON body for HTTP Request node: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
      options.body = resolved;
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
