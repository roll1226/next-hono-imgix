"use client";

import {
  ExclamationCircleOutlined,
  HomeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Alert, Button, Space } from "antd";
import Link from "next/link";
import styled from "styled-components";

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ErrorContent = styled.div`
  max-width: 400px;
  width: 100%;
`;

const IconContainer = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const StyledIcon = styled(ExclamationCircleOutlined)`
  font-size: 64px;
  color: #ff4d4f;
`;

const StyledAlert = styled(Alert)`
  margin-bottom: 24px;
`;

const ButtonContainer = styled.div`
  text-align: center;
`;

const StyledSpace = styled(Space)`
  width: 100%;
`;

type ErrorMessageProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

const ErrorMessage = ({
  title = "エラーが発生しました",
  message = "申し訳ございません。データの取得に失敗しました。",
  onRetry,
}: ErrorMessageProps) => {
  return (
    <ErrorContainer>
      <ErrorContent>
        <IconContainer>
          <StyledIcon />
        </IconContainer>

        <StyledAlert
          message={title}
          description={message}
          type="error"
          showIcon
        />

        <ButtonContainer>
          <StyledSpace direction="vertical" size="middle">
            {onRetry && (
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={onRetry}
                size="large"
                block
              >
                再試行
              </Button>
            )}
            <Link href="/">
              <Button
                icon={<HomeOutlined />}
                size="large"
                block
              >
                ホームに戻る
              </Button>
            </Link>
          </StyledSpace>
        </ButtonContainer>
      </ErrorContent>
    </ErrorContainer>
  );
};

export default ErrorMessage;
