import { client } from "@/lib/hono";
import { GetParams } from "./api/[[...route]]/post";

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
  try {
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
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    throw new Error("投稿一覧の取得に失敗しました");
  }
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
  try {
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
  } catch (error) {
    console.error("Failed to insert hot post:", error);

    // ネットワークエラーやその他のエラーを処理
    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        throw new Error(
          "ネットワークエラー: インターネット接続を確認してください"
        );
      } else if (error.message.includes("timeout")) {
        throw new Error("タイムアウト: リクエストがタイムアウトしました");
      } else if (
        error.message.startsWith("入力エラー:") ||
        error.message.startsWith("重複エラー:") ||
        error.message.startsWith("サーバーエラー:") ||
        error.message.startsWith("サービス利用不可:") ||
        error.message.startsWith("メソッドエラー:") ||
        error.message.startsWith("HTTPエラー")
      ) {
        throw error; // 既に処理済みのエラーはそのまま再投げ
      }
    }

    throw new Error("投稿の作成に失敗しました");
  }
};
