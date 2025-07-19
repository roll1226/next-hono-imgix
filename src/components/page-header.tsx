"use client";

import { Typography } from "antd";
import styled from "styled-components";

const { Title, Paragraph } = Typography;

const HeaderContainer = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

type PageHeaderProps = {
  title: string;
  subtitle: string;
};

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <HeaderContainer>
      <Title level={1}>{title}</Title>
      <Paragraph type="secondary">{subtitle}</Paragraph>
    </HeaderContainer>
  );
};

export default PageHeader;
