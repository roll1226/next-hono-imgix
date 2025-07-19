"use client";

import ErrorMessage from "@/components/error-message";
import { useEffect } from "react";

const PostPageError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error("Post page error:", error);
  }, [error]);

  return (
    <ErrorMessage
      title="投稿ページエラー"
      message="投稿ページの読み込み中にエラーが発生しました。下記ボタンで再試行していただくか、しばらく時間をおいて再度アクセスしてください。"
      onRetry={reset}
    />
  );
};

export default PostPageError;
