"use client";

import ErrorMessage from "@/components/error-message";

type PostErrorProps = {
  title?: string;
  message?: string;
};

const PostError = ({
  title = "投稿の読み込みエラー",
  message = "投稿データの取得中にエラーが発生しました。ページを更新するか、しばらく時間をおいて再度お試しください。",
}: PostErrorProps) => {
  return (
    <ErrorMessage
      title={title}
      message={message}
      onRetry={() => window.location.reload()}
    />
  );
};

export default PostError;
