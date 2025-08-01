import type { Metadata } from "next";

import PageHeader from "@/components/page-header";
import PostForm from "@/components/post-form";

export const metadata: Metadata = {
  title: "新規投稿",
  description: "新しい投稿を作成してください",
};

const CreatePostPage = () => {
  return (
    <>
      <PageHeader title="新規投稿" subtitle="新しい投稿を作成してください" />
      <PostForm />
    </>
  );
};

export default CreatePostPage;
