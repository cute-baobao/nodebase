import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schemas';

const createDrizzleClient = () =>
  drizzle({
    connection: process.env.DATABASE_URL!,
    schema,
  });

// 使用全局对象存储 Drizzle 实例，防止热重载时重复创建
const globalForDrizzle = globalThis as unknown as {
  drizzle: ReturnType<typeof createDrizzleClient> | undefined;
};

export const db = globalForDrizzle.drizzle ?? createDrizzleClient();

// 在开发环境中，将实例存储到全局对象中，这样热重载时会复用实例
if (process.env.NODE_ENV !== 'production') {
  globalForDrizzle.drizzle = db;
}

export * from './schemas';

export default db;
