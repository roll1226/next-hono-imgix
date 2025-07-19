"use client";

import PostError from "@/components/post-error";

const CreatePostError = () => {
  return (
    <PostError
      title="投稿作成エラー"
      message="投稿作成ページの読み込み中にエラーが発生しました。ページを更新するか、しばらく時間をおいて再度お試しください。"
    />
  );
};

export default CreatePostError;
