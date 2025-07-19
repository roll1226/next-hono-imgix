import { db } from "@/db";
import { posts } from "@/db/schema";
import { generateImgixOgpUrl } from "@/lib/imgix";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono/tiny";
import { z } from "zod";

const insertPostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  description: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val.trim();
    }),
});

export type InsertPostForm = z.infer<typeof insertPostSchema>;

const schema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid ID format"),
});

export type GetParams = z.infer<typeof schema>;

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
  .get("/:id", zValidator("param", schema), async (c) => {
    try {
      const { id } = c.req.param();
      const numericId = parseInt(id);

      if (isNaN(numericId)) {
        return c.json({ error: "Invalid ID" }, 400);
      }

      const post = await db.select().from(posts).where(eq(posts.id, numericId));

      if (post.length === 0) {
        return c.json({ error: "Post not found" }, 404);
      }

      return c.json(post[0]);
    } catch (error) {
      console.error("Failed to fetch post:", error);
      return c.json({ error: "Failed to fetch post" }, 500);
    }
  })
  .get("/ogp/:id", zValidator("param", schema), async (c) => {
    try {
      const { id } = c.req.param();
      const numericId = parseInt(id);

      if (isNaN(numericId)) {
        return c.json({ error: "Invalid ID" }, 400);
      }

      const post = await db.select().from(posts).where(eq(posts.id, numericId));

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
  })
  .post("/", zValidator("form", insertPostSchema), async (c) => {
    try {
      const { title, description } = c.req.valid("form");

      // 追加のサーバーサイドバリデーション
      if (!title || !title.trim()) {
        return c.json({ error: "タイトルは必須です" }, 400);
      }

      if (title.trim().length > 255) {
        return c.json(
          { error: "タイトルは255文字以内で入力してください" },
          400
        );
      }

      if (description && description.length > 1000) {
        return c.json({ error: "説明は1000文字以内で入力してください" }, 400);
      }

      const [newPost] = await db
        .insert(posts)
        .values({
          title: title.trim(),
          description: description || null,
        })
        .returning();

      if (!newPost) {
        return c.json({ error: "投稿の作成に失敗しました" }, 500);
      }

      return c.json(newPost, 201);
    } catch (error) {
      console.error("Failed to create post:", error);

      // データベースエラーの詳細を判定
      if (error instanceof Error) {
        if (
          error.message.includes("duplicate") ||
          error.message.includes("unique")
        ) {
          return c.json({ error: "同じタイトルの投稿が既に存在します" }, 409);
        } else if (
          error.message.includes("connection") ||
          error.message.includes("timeout")
        ) {
          return c.json({ error: "データベース接続エラーが発生しました" }, 503);
        } else if (error.message.includes("constraint")) {
          return c.json({ error: "入力データに問題があります" }, 400);
        }
      }

      return c.json({ error: "投稿の作成に失敗しました" }, 500);
    }
  });

export default app;
