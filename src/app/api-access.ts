import { client } from "@/lib/hono";
import { GetParams } from "./api/[[...route]]/post";

// リトライヘルパー関数
const withRetry = async <T>(
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

      // リトライ対象のエラーかチェック
      const isRetryableError =
        error instanceof Error &&
        (error.message.includes("fetch") ||
          error.message.includes("network") ||
          error.message.includes("timeout") ||
          error.message.includes("503") ||
          error.message.includes("502") ||
          error.message.includes("504") ||
          error.message.includes("ECONNRESET") ||
          error.message.includes("ENOTFOUND") ||
          error.message.includes("ETIMEDOUT") ||
          // リトライ可能フラグが含まれている場合
          error.message.includes('"retryable":true') ||
          error.message.includes("retryable: true"));

      // デッドロックや競合エラーは短い間隔でリトライ
      const isConflictError =
        lastError.message.includes("競合") ||
        lastError.message.includes("deadlock") ||
        (lastError.message.includes("409") &&
          lastError.message.includes("retryable"));

      if (isConflictError && attempt <= 2) {
        console.warn(
          `Conflict detected, quick retry (${attempt}/2):`,
          lastError.message
        );
        await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
        continue;
      }

      if (!isRetryableError || attempt === maxRetries) {
        console.error(
          `API request failed after ${attempt} attempts:`,
          lastError.message
        );
        throw lastError;
      }

      console.warn(
        `API request failed, retrying (${attempt}/${maxRetries}):`,
        lastError.message
      );

      // 指数バックオフでリトライ間隔を調整（最大8秒）
      const waitTime = Math.min(delay * Math.pow(2, attempt - 1), 8000);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
};

export const getHonoRoot = async () => {
  try {
    const res = await client.api.home.$get();
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.text();
  } catch (error) {
    console.error("Failed to fetch Hono root:", error);
    throw new Error("ホームデータの取得に失敗しました");
  }
};

export const getHonoHello = async () => {
  try {
    const res = await client.api.hello.$get();
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch Hono hello:", error);
    throw new Error("Hello APIの取得に失敗しました");
  }
};

export const getHonoPosts = async () => {
  return await withRetry(async () => {
    const res = await client.api.posts.$get(
      {},
      {
        // キャッシュを無効化してリアルタイムデータを取得
        init: {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        },
      }
    );
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  });
};

export const getHonoPostById = async (params: GetParams) => {
  try {
    const res = await client.api.posts[":id"].$get({
      param: { id: params.id },
    });
    if (!res.ok) {
      if (res.status === 404) {
        return null; // 404の場合はnullを返す（投稿が見つからない）
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch post ${params.id}:`, error);
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw new Error("投稿データの取得に失敗しました");
  }
};

export const getHonoOgpById = async (params: GetParams) => {
  try {
    const res = await client.api.posts.ogp[":id"].$get({
      param: { id: params.id },
    });
    if (!res.ok) {
      if (res.status === 404) {
        return null; // 404の場合はnullを返す（OGPが見つからない）
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch OGP ${params.id}:`, error);
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw new Error("OGPデータの取得に失敗しました");
  }
};

export const insertHotPost = async (postData: {
  title: string;
  description?: string;
}) => {
  return await withRetry(
    async () => {
      const formData: { title: string; description?: string } = {
        title: postData.title,
      };

      // descriptionがある場合のみフォームデータに追加
      if (
        postData.description !== undefined &&
        postData.description.trim() !== ""
      ) {
        formData.description = postData.description;
      }

      const res = await client.api.posts.$post({
        form: formData,
      });

      if (!res.ok) {
        const status = res.status;
        let errorData: { error?: string } = {
          error: "不明なエラーが発生しました",
        };

        try {
          errorData = await res.json();
        } catch (parseError) {
          console.warn("Failed to parse error response:", parseError);
        }

        switch (status) {
          case 400:
            throw new Error(
              `入力エラー: ${errorData.error || "無効なデータが送信されました"}`
            );
          case 409:
            throw new Error(
              `重複エラー: ${errorData.error || "同じデータが既に存在します"}`
            );
          case 500:
            throw new Error(
              `サーバーエラー: ${
                errorData.error || "サーバー内部エラーが発生しました"
              }`
            );
          case 503:
            throw new Error(
              `サービス利用不可: ${
                errorData.error || "現在サービスが利用できません"
              }`
            );
          default:
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _: never = status;
            throw new Error(
              `HTTPエラー (${status}): ${
                errorData.error || "不明なエラーが発生しました"
              }`
            );
        }
      }

      return res.json();
    },
    2,
    500
  ); // 投稿は2回リトライ、500ms間隔
};
