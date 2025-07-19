"use client";

import { Card, Skeleton } from "antd";
import styled from "styled-components";

const LoadingContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const PostLoading = () => {
  return (
    <LoadingContainer>
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    </LoadingContainer>
  );
};

export default PostLoading;
