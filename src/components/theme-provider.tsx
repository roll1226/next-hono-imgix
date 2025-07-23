"use client";

import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { ConfigProvider, Space, Switch, theme } from "antd";
import { ReactNode, useCallback, useEffect, useState } from "react";
import styled from "styled-components";

const ThemeContainer = styled.div<{ $isDarkMode: boolean }>`
  min-height: 100vh;
  background-color: ${(props) => (props.$isDarkMode ? "#141414" : "#f5f5f5")};
  transition: background-color 0.3s ease;
`;

const ThemeToggleContainer = styled.div<{ $isDarkMode: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background-color: ${(props) => (props.$isDarkMode ? "#1f1f1f" : "#ffffff")};
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid ${(props) => (props.$isDarkMode ? "#434343" : "#d9d9d9")};
`;

const StyledSunIcon = styled(SunOutlined)<{ $isDarkMode: boolean }>`
  color: ${(props) => (props.$isDarkMode ? "#666" : "#1890ff")};
`;

const StyledMoonIcon = styled(MoonOutlined)<{ $isDarkMode: boolean }>`
  color: ${(props) => (props.$isDarkMode ? "#1890ff" : "#666")};
`;

type ThemeProviderProps = {
  children: ReactNode;
};

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ローカルストレージからテーマ設定を読み込み
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      // システムの設定を確認
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // テーマ変更をローカルストレージに保存
  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  }, [isDarkMode]);

  const { defaultAlgorithm, darkAlgorithm } = theme;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 6,
        },
      }}
    >
      <ThemeContainer $isDarkMode={isDarkMode}>
        {/* テーマ切り替えボタン */}
        <ThemeToggleContainer $isDarkMode={isDarkMode}>
          <Space>
            <StyledSunIcon $isDarkMode={isDarkMode} />
            <Switch checked={isDarkMode} onChange={toggleTheme} size="small" />
            <StyledMoonIcon $isDarkMode={isDarkMode} />
          </Space>
        </ThemeToggleContainer>

        {children}
      </ThemeContainer>
    </ConfigProvider>
  );
};

export default ThemeProvider;
