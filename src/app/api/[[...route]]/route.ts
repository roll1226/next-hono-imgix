import { Hono } from "hono";
import { handle } from "hono/vercel";
import post from "./post";
import template from "./template";

// Dynamic APIを強制してキャッシュを無効化
export const dynamic = "force-dynamic";
export const revalidate = 0;

const app = new Hono()
  .basePath("/api")
  .route("/", template)
  .route("/posts", post);

export type AppType = typeof app;
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
