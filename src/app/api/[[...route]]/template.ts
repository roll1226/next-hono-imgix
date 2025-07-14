import { Hono } from "hono/tiny";

const app = new Hono()
  .get("/home", (c) => c.text("Hello from Hono in Next.js RouteHandler!"))
  .get("/hello", (c) => c.json({ message: "Hello from Hono!" }));

export default app;
