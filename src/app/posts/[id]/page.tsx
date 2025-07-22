import { getOgp, getPost } from "@/app/server-action";
import PostDetail from "@/components/post-detail";
import PostError from "@/components/post-error";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type PostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: PostPageProps): Promise<Metadata> => {
  try {
    const { id } = await params;
    const ogpData = await getOgp(id);

    if (!ogpData) {
      return {
        title: "投稿が見つかりません",
        description:
          "指定された投稿は存在しないか、削除された可能性があります。",
      };
    }

    return {
      title: ogpData.title,
      description: ogpData.description || "投稿の詳細を表示しています",
      openGraph: {
        title: `${ogpData.title} | yep demo post`,
        description: ogpData.description || "投稿の詳細を表示しています",
        images: [
          {
            url: ogpData.ogpUrl,
            width: 1200,
            height: 630,
            alt: ogpData.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${ogpData.title} | yep demo post`,
        description: ogpData.description || "投稿の詳細を表示しています",
        images: [ogpData.ogpUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "エラーが発生しました",
      description: "メタデータの生成中にエラーが発生しました。",
    };
  }
};

const PostPage = async ({ params }: PostPageProps) => {
  try {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
      notFound();
    }

    return <PostDetail post={post} />;
  } catch (error) {
    console.error("Error loading post:", error);
    return <PostError />;
  }
};

export default PostPage;
