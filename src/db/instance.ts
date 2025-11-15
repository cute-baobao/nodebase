import { env } from "@/env";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schemas";

const createDrizzleClient = () =>
  drizzle({
    connection: env.DATABASE_URL,
    schema,
    ws,
  });

// 使用全局对象存储 Drizzle 实例，防止热重载时重复创建
const globalForDrizzle = globalThis as unknown as {
  drizzle: ReturnType<typeof createDrizzleClient> | undefined;
};

export const db = globalForDrizzle.drizzle ?? createDrizzleClient();

// 在开发环境中，将实例存储到全局对象中，这样热重载时会复用实例
if (env.NODE_ENV !== "production") {
  globalForDrizzle.drizzle = db;
}
export default db;
