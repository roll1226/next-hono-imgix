"use client";

import { HomeOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Input, message, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import styled from "styled-components";
import { z } from "zod";

import { insertPost } from "@/app/server-action";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Zod スキーマ定義
const postFormSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルを入力してください")
    .max(32, "タイトルは32文字以内で入力してください"),
  description: z
    .string()
    .max(1000, "説明は1000文字以内で入力してください")
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val.trim();
    }),
});

//Styled Components
const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RequiredMark = styled.span`
  color: #ff4d4f;
  margin-left: 4px;
`;

const ErrorText = styled.span`
  color: #ff4d4f;
  font-size: 14px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
`;

const LeftButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const RightButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const StyledTitle = styled(Title)`
  text-align: center;
  margin-bottom: 2rem;
`;

const StyledAlert = styled(Alert)`
  margin-bottom: 1rem;
`;

const PostForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof postFormSchema>> = useCallback(
    async (values) => {
      // 完了状態では実行しない
      if (isCompleted) return;

      setLoading(true);
      setError(null);

      try {
        // バリデーション
        if (!values.title?.trim()) {
          throw new Error("タイトルは必須です");
        }

        if (values.title.length > 32) {
          throw new Error("タイトルは32文字以内で入力してください");
        }

        if (values.description && values.description.length > 1000) {
          throw new Error("説明は1000文字以内で入力してください");
        }

        const trimmedDescription = values.description?.trim();

        await insertPost({
          title: values.title.trim(),
          description:
            trimmedDescription && trimmedDescription.length > 0
              ? trimmedDescription
              : undefined,
        });

        message.success("投稿を作成しました！");
        setIsCompleted(true); // 完了状態に設定

        // 少し遅延してからリダイレクト（ユーザーが成功メッセージを確認できるように）
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } catch (error) {
        console.error("投稿作成エラー:", error);

        let errorMessage = "投稿の作成に失敗しました。";

        if (error instanceof Error) {
          // 特定のエラーメッセージを処理
          if (
            error.message.includes("network") ||
            error.message.includes("fetch")
          ) {
            errorMessage =
              "ネットワークエラーが発生しました。インターネット接続を確認してください。";
          } else if (error.message.includes("timeout")) {
            errorMessage =
              "リクエストがタイムアウトしました。もう一度お試しください。";
          } else if (error.message.includes("validation")) {
            errorMessage = "入力内容に問題があります。内容を確認してください。";
          } else if (
            error.message.includes("title") ||
            error.message.includes("タイトル")
          ) {
            errorMessage = error.message;
          } else if (
            error.message.includes("description") ||
            error.message.includes("説明")
          ) {
            errorMessage = error.message;
          } else {
            errorMessage = `エラー: ${error.message}`;
          }
        }

        setError(errorMessage);
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [isCompleted, router]
  );

  const onReset = useCallback(() => {
    // 完了状態では実行しない
    if (isCompleted) return;

    // form.resetFields();
    setError(null);
  }, [isCompleted]);

  return (
    <FormContainer>
      <StyledTitle level={2}>新規投稿</StyledTitle>

      {error && (
        <StyledAlert
          message="エラー"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}

      {isCompleted && (
        <StyledAlert
          message="投稿作成完了"
          description="投稿が正常に作成されました。しばらくお待ちください..."
          type="success"
          showIcon
        />
      )}

      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <FormItem>
          <Text strong>
            タイトル<RequiredMark>*</RequiredMark>
          </Text>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="title"
                placeholder="投稿のタイトルを入力"
                maxLength={32}
                showCount
                disabled={loading || isCompleted}
                status={errors.title ? "error" : ""}
              />
            )}
          />
          {errors.title && <ErrorText>{errors.title.message}</ErrorText>}
        </FormItem>

        <FormItem>
          <Text strong>説明</Text>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                id="description"
                rows={6}
                placeholder="投稿の説明を入力（任意）"
                showCount
                maxLength={1000}
                disabled={loading || isCompleted}
                status={errors.description ? "error" : ""}
              />
            )}
          />
          {errors.description && (
            <ErrorText>{errors.description.message}</ErrorText>
          )}
        </FormItem>

        <ButtonContainer>
          <LeftButtons>
            <Link href="/">
              <Button icon={<HomeOutlined />} disabled={loading || isCompleted}>
                ホームに戻る
              </Button>
            </Link>
          </LeftButtons>

          <RightButtons>
            <Button onClick={onReset} disabled={loading || isCompleted}>
              リセット
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={isCompleted}
            >
              投稿を作成
            </Button>
          </RightButtons>
        </ButtonContainer>
      </StyledForm>
    </FormContainer>
  );
};

export default PostForm;
