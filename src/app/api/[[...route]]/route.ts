import { Hono } from "hono";
import { handle } from "hono/vercel";
import post from "./post";
import template from "./template";

const app = new Hono()
  .basePath("/api")
  .route("/", template)
  .route("/posts", post);

export type AppType = typeof app;
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
