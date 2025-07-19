"use client";

import { Post } from "@/app/server-action";
import { CalendarOutlined } from "@ant-design/icons";
import { Card, Divider, Typography } from "antd";
import { format } from "date-fns";
import styled from "styled-components";

const { Title, Paragraph, Text } = Typography;

// Styled Components
const PostContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const StyledCard = styled(Card)`
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const PostTitle = styled(Title)`
  && {
    margin-bottom: 16px;
  }
`;

const DescriptionText = styled(Paragraph)`
  && {
    font-size: 16px;
    margin-bottom: 24px;
    line-height: 1.6;
  }
`;

const DateContainer = styled.div`
  display: flex;
  align-items: center;
  opacity: 0.7;
  font-size: 14px;

  .anticon {
    margin-right: 8px;
  }
`;

type PostDetailProps = {
  post: Post;
};

const PostDetail = ({ post }: PostDetailProps) => {
  return (
    <PostContainer>
      <StyledCard>
        <PostTitle level={1}>{post.title}</PostTitle>
        {post.description && post.description.trim() ? (
          <DescriptionText>{post.description}</DescriptionText>
        ) : (
          <Text
            type="secondary"
            style={{
              fontSize: "16px",
              marginBottom: "24px",
              fontStyle: "italic",
            }}
          >
            説明はありません
          </Text>
        )}
        <Divider />
        <DateContainer>
          <CalendarOutlined />
          <span>
            作成日:{" "}
            {format(
              typeof post.createdAt === "string"
                ? new Date(post.createdAt)
                : post.createdAt,
              "yyyy/MM/dd"
            )}
          </span>
        </DateContainer>
      </StyledCard>
    </PostContainer>
  );
};

export default PostDetail;
