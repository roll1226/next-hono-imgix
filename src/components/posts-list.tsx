"use client";

import { Post, Posts } from "@/app/server-action";
import { CalendarOutlined, EyeOutlined } from "@ant-design/icons";
import { Card, List, Typography } from "antd";
import { format } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import styled from "styled-components";
const { Paragraph, Text } = Typography;

// Styled Components
const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 2rem 0;
`;

const DescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const DateContainer = styled.div`
  display: flex;
  align-items: center;
  opacity: 0.7;
  font-size: 12px;

  .anticon {
    margin-right: 4px;
  }
`;

const StyledParagraph = styled(Paragraph)`
  margin: 0 0 8px 0 !important;
`;

type PostsListProps = {
  posts: Posts;
};

const PostsList = ({ posts }: PostsListProps) => {
  // 投稿データの変換をメモ化
  const formattedPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];

    return posts.map((post: Post) => ({
      ...post,
      formattedDate: format(
        typeof post.createdAt === "string"
          ? new Date(post.createdAt)
          : post.createdAt,
        "yyyy/MM/dd"
      ),
    }));
  }, [posts]);

  if (!posts || posts.length === 0) {
    return (
      <EmptyStateContainer>
        <Typography.Text type="secondary">投稿がありません</Typography.Text>
      </EmptyStateContainer>
    );
  }

  return (
    <List
      grid={{
        gutter: 16,
        xs: 1,
        sm: 1,
        md: 2,
        lg: 2,
        xl: 3,
        xxl: 3,
      }}
      dataSource={formattedPosts}
      renderItem={(post) => (
        <List.Item>
          <Link href={`/posts/${post.id}`}>
            <Card hoverable actions={[<EyeOutlined key="view" />]}>
              <Card.Meta
                title={post.title}
                description={
                  <DescriptionContainer>
                    {post.description ? (
                      <StyledParagraph ellipsis={{ rows: 2 }}>
                        {post.description}
                      </StyledParagraph>
                    ) : (
                      <Text type="secondary" italic style={{ fontSize: 14 }}>
                        説明はありません
                      </Text>
                    )}
                    <DateContainer>
                      <CalendarOutlined />
                      {post.formattedDate}
                    </DateContainer>
                  </DescriptionContainer>
                }
              />
            </Card>
          </Link>
        </List.Item>
      )}
    />
  );
};

export default PostsList;
