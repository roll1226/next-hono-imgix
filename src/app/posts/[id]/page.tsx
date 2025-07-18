import { getOgp, getPost } from "@/app/server-action";
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
  const { id } = await params;
  const ogpData = await getOgp(id);

  if (!ogpData) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: ogpData.title,
    description: ogpData.description || "No description available",
    openGraph: {
      title: ogpData.title,
      description: ogpData.description || "No description available",
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
      title: ogpData.title,
      description: ogpData.description || "No description available",
      images: [ogpData.ogpUrl],
    },
  };
};

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article>
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        {post.description && (
          <p className="text-gray-600 mb-6">{post.description}</p>
        )}
        <div className="mt-8">
          <p className="text-sm text-gray-500">
            Created: {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </article>
    </div>
  );
}
