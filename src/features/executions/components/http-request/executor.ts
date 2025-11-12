import { NodeExecutor } from "@/features/executions/type";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import { httpRequestDataSchema } from "./schema";

type HttpRequestData = {
    variableName?: string;
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: string | undefined;
}

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
  publish,
}) => {
  await publish(
    httpRequestChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const safeData = httpRequestDataSchema.safeParse(data);
  if (!safeData.success) {
    // Publish error state for HTTP request node
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `Invalid data for HTTP Request node : ${safeData.error.issues.map((i) => i.message).join(", ")}`,
    );
  }

  try {
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

    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (error) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
