import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Connection Pool設定（同時接続対応）
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  // 同時接続対応の設定
  max: 20, // 最大接続数
  min: 2, // 最小接続数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // リトライ設定
  maxUses: 7500,
  allowExitOnIdle: false,
  // ヘルスチェック設定
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
});

// プールエラーハンドリング
pool.on("error", (err, client) => {
  console.error("Database pool error:", err);
  console.error("Client info:", client ? "Client exists" : "No client");
});

pool.on("connect", (client) => {
  console.log("Database pool connected");
  // 接続時のクライアント設定
  client.query("SET application_name = $1", ["next-hono-imgix"]);
});

pool.on("acquire", () => {
  console.log("Database connection acquired from pool");
});

pool.on("release", () => {
  console.log("Database connection released back to pool");
});

// Graceful shutdown処理
process.on("SIGINT", async () => {
  console.log("Received SIGINT, closing database pool...");
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, closing database pool...");
  await pool.end();
  process.exit(0);
});

export const db = drizzle(pool, { schema });

// リトライ機能付きの実行ヘルパー
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // PostgreSQL特有のエラーコードも含めてリトライ対象をチェック
      const isRetryableError =
        error instanceof Error &&
        (error.message.includes("connection") ||
          error.message.includes("timeout") ||
          error.message.includes("ECONNRESET") ||
          error.message.includes("ENOTFOUND") ||
          error.message.includes("ETIMEDOUT") ||
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("pool") ||
          error.message.includes("53300") || // PostgreSQL: too_many_connections
          error.message.includes("08006") || // PostgreSQL: connection_failure
          error.message.includes("08001") || // PostgreSQL: sqlclient_unable_to_establish_sqlconnection
          error.message.includes("57P01") || // PostgreSQL: admin_shutdown
          error.message.includes("57P02") || // PostgreSQL: crash_shutdown
          error.message.includes("57P03")); // PostgreSQL: cannot_connect_now

      // デッドロックは即座にリトライ（PostgreSQLの40P01エラー）
      const isDeadlock =
        lastError.message.includes("40P01") ||
        lastError.message.includes("deadlock");

      if (isDeadlock) {
        console.warn(
          `Deadlock detected, retrying immediately (${attempt}/${maxRetries})`
        );
        // デッドロックの場合は短い間隔でリトライ
        await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
        continue;
      }

      if (!isRetryableError || attempt === maxRetries) {
        // リトライ不可能なエラーまたは最大試行回数に達した場合
        console.error(
          `Operation failed after ${attempt} attempts:`,
          lastError.message
        );
        throw lastError;
      }

      console.warn(
        `Operation failed, retrying (${attempt}/${maxRetries}):`,
        error.message
      );

      // 指数バックオフでリトライ間隔を調整（最大10秒）
      const waitTime = Math.min(delay * Math.pow(2, attempt - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
};

// トランザクション実行ヘルパー（同時実行制御）
export const withTransaction = async <T>(
  callback: (
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
  ) => Promise<T>
): Promise<T> => {
  return await withRetry(async () => {
    return await db.transaction(callback);
  });
};
