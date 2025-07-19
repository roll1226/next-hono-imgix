"use client";

import ErrorMessage from "@/components/error-message";
import { useEffect } from "react";

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <ErrorMessage
      title="アプリケーションエラー"
      message="申し訳ございません。アプリケーションでエラーが発生しました。下記ボタンで再試行していただくか、しばらく時間をおいて再度アクセスしてください。"
      onRetry={reset}
    />
  );
};

export default Error;
