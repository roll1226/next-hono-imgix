import { db } from "@/db";
import { posts } from "@/db/schema";
import { generateImgixOgpUrl } from "@/lib/imgix";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono/tiny";
import z from "zod";

const app = new Hono()
  .get("/", async (c) => {
    try {
      const allPosts = await db.select().from(posts);
      return c.json(allPosts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      return c.json({ error: "Failed to fetch posts" }, 500);
    }
  })
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().regex(/^\d+$/, "Invalid ID format"),
      })
    ),
    async (c) => {
      try {
        const { id } = c.req.param();
        const numericId = parseInt(id);

        if (isNaN(numericId)) {
          return c.json({ error: "Invalid ID" }, 400);
        }

        const post = await db
          .select()
          .from(posts)
          .where(eq(posts.id, numericId));

        if (post.length === 0) {
          return c.json({ error: "Post not found" }, 404);
        }

        return c.json(post[0]);
      } catch (error) {
        console.error("Failed to fetch post:", error);
        return c.json({ error: "Failed to fetch post" }, 500);
      }
    }
  )
  .get(
    "/ogp/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().regex(/^\d+$/, "Invalid ID format"),
      })
    ),
    async (c) => {
      try {
        const { id } = c.req.param();
        const numericId = parseInt(id);

        if (isNaN(numericId)) {
          return c.json({ error: "Invalid ID" }, 400);
        }

        const post = await db
          .select()
          .from(posts)
          .where(eq(posts.id, numericId));

        if (post.length === 0) {
          return c.json({ error: "Post not found" }, 404);
        }

        const ogpUrl = generateImgixOgpUrl(post[0].title);

        return c.json({
          ogpUrl,
          title: post[0].title,
          description: post[0].description,
        });
      } catch (error) {
        console.error("Failed to generate OGP:", error);
        return c.json({ error: "Failed to generate OGP" }, 500);
      }
    }
  );

export default app;
