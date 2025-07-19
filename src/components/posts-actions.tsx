"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import Link from "next/link";
import styled from "styled-components";

const { Title, Text } = Typography;

const ActionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TitleSection = styled.div`
  .ant-typography {
    margin-bottom: 0;
  }
`;

type PostsActionsProps = {
  title: string;
  subtitle: string;
};

const PostsActions = ({ title, subtitle }: PostsActionsProps) => {
  return (
    <ActionContainer>
      <TitleSection>
        <Title level={1} style={{ marginBottom: 0 }}>
          {title}
        </Title>
        <Text type="secondary">{subtitle}</Text>
      </TitleSection>
      <Link href="/posts/create">
        <Button type="primary" icon={<PlusOutlined />} size="large">
          新規投稿
        </Button>
      </Link>
    </ActionContainer>
  );
};

export default PostsActions;
