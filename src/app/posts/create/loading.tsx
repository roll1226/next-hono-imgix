"use client";

import { Spin } from "antd";
import styled from "styled-components";

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
`;

const CreatePostLoading = () => {
  return (
    <LoadingContainer>
      <Spin size="large" />
      <p>投稿作成ページを読み込み中...</p>
    </LoadingContainer>
  );
};

export default CreatePostLoading;
