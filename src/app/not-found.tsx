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

const NotFound = () => {
  return (
    <NotFoundContainer>
      <Result
        status="404"
        title="404"
        subTitle="申し訳ございません。お探しのページは存在しないか、移動された可能性があります。"
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

export default NotFound;
