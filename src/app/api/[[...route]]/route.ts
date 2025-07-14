import { Hono } from "hono";
import { handle } from "hono/vercel";
import template from "./template";

const app = new Hono().basePath("/api").route("/", template);

export type AppType = typeof app;
export const GET = handle(app);
