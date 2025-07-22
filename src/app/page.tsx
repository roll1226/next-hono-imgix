import ErrorMessage from "@/components/error-message";
import PostsActions from "@/components/posts-actions";
import PostsList from "@/components/posts-list";
import type { Metadata } from "next";
import { getPosts } from "./server-action";

// Dynamic Renderingを強制してSSR時のキャッシュを無効化
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "投稿一覧",
  description: "作成された投稿の一覧を表示します",
};

const Home = async () => {
  try {
    const posts = await getPosts();

    return (
      <div style={{ padding: "24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <PostsActions
            title="投稿一覧"
            subtitle="投稿をクリックして詳細を確認できます"
          />
          <PostsList posts={posts} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Home page error:", error);
    return (
      <ErrorMessage
        title="ページの読み込みエラー"
        message="投稿一覧の取得に失敗しました。しばらく時間をおいて再度お試しください。"
      />
    );
  }
};

export default Home;
