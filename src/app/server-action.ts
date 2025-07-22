"use server";
import { revalidatePath } from "next/cache";
import {
  getHonoHello,
  getHonoOgpById,
  getHonoPostById,
  getHonoPosts,
  getHonoRoot,
  insertHotPost,
} from "./api-access";
import { InsertPostForm } from "./api/[[...route]]/post";

export const fetchHonoRootAction = async () => {
  try {
    return await getHonoRoot();
  } catch (error) {
    console.error("Server action error (fetchHonoRootAction):", error);
    throw error;
  }
};

export const fetchHonoHelloAction = async () => {
  try {
    return await getHonoHello();
  } catch (error) {
    console.error("Server action error (fetchHonoHelloAction):", error);
    throw error;
  }
};

export const getPosts = async () => {
  try {
    return await getHonoPosts();
  } catch (error) {
    console.error("Server action error (getPosts):", error);
    throw error;
  }
};

export const getPost = async (id: string) => {
  try {
    return await getHonoPostById({ id });
  } catch (error) {
    console.error(`Server action error (getPost ${id}):`, error);
    throw error;
  }
};

export const getOgp = async (id: string) => {
  try {
    return await getHonoOgpById({ id });
  } catch (error) {
    console.error(`Server action error (getOgp ${id}):`, error);
    throw error;
  }
};

export const insertPost = async (postData: InsertPostForm) => {
  try {
    // 入力データのバリデーション
    if (!postData.title?.trim()) {
      throw new Error("タイトルは必須項目です");
    }

    if (postData.title.trim().length > 32) {
      throw new Error("タイトルは32文字以内で入力してください");
    }

    if (postData.description && postData.description.length > 1000) {
      throw new Error("説明は1000文字以内で入力してください");
    }

    const trimmedDescription = postData.description?.trim();

    const result = await insertHotPost({
      title: postData.title.trim(),
      description:
        trimmedDescription && trimmedDescription.length > 0
          ? trimmedDescription
          : undefined,
    });

    if (!result) {
      throw new Error("投稿の作成に失敗しました");
    }

    // 投稿作成後にホームページのキャッシュを無効化
    revalidatePath("/");
    revalidatePath("/api/posts");

    return result;
  } catch (error) {
    console.error("Server action error (insertPost):", error);

    // エラーの種類に応じたメッセージを設定
    if (error instanceof Error) {
      if (
        error.message.includes("validation") ||
        error.message.includes("必須") ||
        error.message.includes("文字")
      ) {
        throw error; // バリデーションエラーはそのまま再投げ
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        throw new Error(
          "ネットワークエラーが発生しました。接続を確認してください。"
        );
      } else if (error.message.includes("timeout")) {
        throw new Error(
          "リクエストがタイムアウトしました。もう一度お試しください。"
        );
      } else if (error.message.includes("500")) {
        throw new Error(
          "サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。"
        );
      }
    }

    throw new Error("投稿の作成に失敗しました。もう一度お試しください。");
  }
};

type ElementType<T> = T extends (infer U)[] ? U : never;
export type Posts = Awaited<ReturnType<typeof getPosts>>;
export type Post = ElementType<Posts>;
