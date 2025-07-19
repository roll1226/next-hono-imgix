import { db, withRetry, withTransaction } from "@/db";
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
      // リトライ機能付きでデータ取得
      const allPosts = await withRetry(async () => {
        return await db.select().from(posts);
      });

      // キャッシュを無効化するヘッダーを設定
      c.header(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
      c.header("Pragma", "no-cache");
      c.header("Expires", "0");

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

      // リトライ機能付きで個別投稿を取得
      const post = await withRetry(async () => {
        return await db.select().from(posts).where(eq(posts.id, numericId));
      });

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

      // トランザクション＋リトライでデータ整合性を保証
      const newPost = await withTransaction(async (tx) => {
        // 同じタイトルの投稿が既に存在しないかチェック（楽観的ロック）
        const existingPosts = await tx
          .select()
          .from(posts)
          .where(eq(posts.title, title.trim()));

        if (existingPosts.length > 0) {
          throw new Error("同じタイトルの投稿が既に存在します");
        }

        // 新しい投稿を作成
        const [insertedPost] = await tx
          .insert(posts)
          .values({
            title: title.trim(),
            description: description || null,
          })
          .returning();

        return insertedPost;
      });

      if (!newPost) {
        return c.json({ error: "投稿の作成に失敗しました" }, 500);
      }

      return c.json(newPost, 201);
    } catch (error) {
      console.error("Failed to create post:", error);

      // データベースエラーの詳細を判定
      if (error instanceof Error) {
        // 重複エラー
        if (
          error.message.includes("同じタイトルの投稿が既に存在します") ||
          error.message.includes("duplicate") ||
          error.message.includes("unique") ||
          error.message.includes("23505") // PostgreSQL unique violation
        ) {
          return c.json({ error: "同じタイトルの投稿が既に存在します" }, 409);
        }
        // 接続・タイムアウトエラー
        else if (
          error.message.includes("connection") ||
          error.message.includes("timeout") ||
          error.message.includes("pool") ||
          error.message.includes("53300") || // too_many_connections
          error.message.includes("08006") // connection_failure
        ) {
          return c.json(
            {
              error:
                "データベース接続エラーが発生しました。しばらくしてから再度お試しください。",
              retryable: true,
            },
            503
          );
        }
        // デッドロックエラー
        else if (
          error.message.includes("40P01") ||
          error.message.includes("deadlock")
        ) {
          return c.json(
            {
              error: "一時的な競合が発生しました。もう一度お試しください。",
              retryable: true,
            },
            409
          );
        }
        // 制約違反エラー
        else if (
          error.message.includes("constraint") ||
          error.message.includes("23") // PostgreSQL integrity constraint violation
        ) {
          return c.json({ error: "入力データに問題があります" }, 400);
        }
        // データベース容量・リソース不足
        else if (
          error.message.includes("53200") || // out_of_memory
          error.message.includes("53400") // configuration_limit_exceeded
        ) {
          return c.json(
            {
              error:
                "サーバーリソースが不足しています。しばらくしてから再度お試しください。",
              retryable: true,
            },
            503
          );
        }
      }

      return c.json(
        {
          error: "投稿の作成に失敗しました",
          retryable: false,
        },
        500
      );
    }
  });

export default app;
