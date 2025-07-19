"use client";

import { HomeOutlined } from "@ant-design/icons";
import { Button, Result } from "antd";
import Link from "next/link";
import styled from "styled-components";

const NotFoundContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PostNotFound = () => {
  return (
    <NotFoundContainer>
      <Result
        status="404"
        title="投稿が見つかりません"
        subTitle="申し訳ございません。お探しの投稿は存在しないか、削除された可能性があります。"
        extra={
          <Link href="/">
            <Button type="primary" icon={<HomeOutlined />} size="large">
              ホームに戻る
            </Button>
          </Link>
        }
      />
    </NotFoundContainer>
  );
};

export default PostNotFound;
