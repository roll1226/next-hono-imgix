"use client";

import { Spin, Typography } from "antd";
import styled from "styled-components";

const { Title, Text } = Typography;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingContent = styled.div`
  text-align: center;
`;

const StyledTitle = styled(Title)`
  margin-top: 16px;
  margin-bottom: 8px;
`;

const Loading = () => {
  return (
    <LoadingContainer>
      <LoadingContent>
        <Spin size="large" />
        <StyledTitle level={3}>読み込み中...</StyledTitle>
        <Text type="secondary">しばらくお待ちください</Text>
      </LoadingContent>
    </LoadingContainer>
  );
};

export default Loading;
