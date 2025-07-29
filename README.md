# yep demo post

Next.js + Hono + imgixを使用した投稿デモサイトです。

## 🚀 機能

- **投稿管理**: 投稿の作成・一覧表示・詳細表示
- **OGP画像生成**: imgixを使用した動的OGP画像生成（投稿タイトル + 投稿日）
- **レスポンシブデザイン**: Ant Design 5を使用したモダンなUI
- **ダークモード対応**: ライト/ダークモードの切り替え機能
- **フォームバリデーション**: React Hook Form + Zodによる堅牢なバリデーション
- **データベース**: PostgreSQL + Drizzle ORMによるタイプセーフなデータ操作
- **同時実行対応**: コネクションプールとリトライ機能による安定したマルチユーザー対応

## 🛠 技術スタック

### フロントエンド
- **Next.js 15** - App Router使用
- **React 19** - 最新のReact機能を活用
- **TypeScript** - 型安全な開発
- **Ant Design 5** - UIコンポーネントライブラリ
- **styled-components** - CSS-in-JS スタイリング
- **React Hook Form** - フォーム管理
- **Zod** - スキーマバリデーション
- **date-fns** - 日付操作ライブラリ

### バックエンド
- **Hono** - 軽量Webフレームワーク
- **Drizzle ORM** - TypeScript-first ORM
- **PostgreSQL** - リレーショナルデータベース

### インフラ・ツール
- **Vercel** - デプロイメントプラットフォーム
- **imgix** - 画像最適化・動的生成サービス
- **Docker** - コンテナ化（開発環境）

## 📦 セットアップ

### 前提条件
- Node.js 20以上
- PostgreSQL（または Docker）
- imgixアカウント（OGP画像生成用）

### 1. リポジトリのクローン
```bash
git clone https://github.com/roll1226/next-hono-imgix.git
cd next-hono-imgix
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.sample`を参考に`.env`ファイルを作成：

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres

# Imgix
IMGIX_URL=your-imgix-domain.imgix.net

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. データベースのセットアップ
```bash
# マイグレーション実行
npm run db:push

# 初期データの投入（オプション）
npm run db:seed
```

### 5. 開発サーバーの起動
```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## 🐳 Docker での開発

```bash
# Docker環境の起動
docker compose up -d

# ログの確認
docker compose logs -f

# 環境の停止
docker compose down
```

## 📝 使用方法

### 投稿の作成
1. 「新規投稿」ボタンをクリック
2. タイトル（32文字以内）と説明（1000文字以内・任意）を入力
3. 「投稿を作成」ボタンで投稿完了

### OGP画像の確認
各投稿の詳細ページでOGP画像が自動生成されます：
- **タイトル**: 中央に動的フォントサイズで表示
- **投稿日**: 左下に日本語形式（yyyy/MM/dd）で表示

## 🔧 開発用コマンド

```bash
# 開発サーバー起動（Turbopack使用）
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# リント
npm run lint

# データベース関連
npm run db:generate  # スキーマからマイグレーション生成
npm run db:push      # マイグレーション適用
npm run db:studio    # Drizzle Studio起動
npm run db:seed      # 初期データ投入
```

## 📁 プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Hono)
│   ├── posts/             # 投稿関連ページ
│   └── layout.tsx         # ルートレイアウト
├── components/            # Reactコンポーネント
├── db/                    # データベース設定
│   ├── schema.ts          # Drizzleスキーマ定義
│   └── index.ts           # DB接続・トランザクション
├── lib/                   # ユーティリティ
│   ├── imgix.ts           # OGP画像生成
│   ├── cache.ts           # メモリキャッシュ
│   └── schemas.ts         # Zodスキーマ
└── styles/               # スタイル関連
```

## 🎨 主要機能の詳細

### OGP画像生成
- imgixのblend機能を使用してタイトルと投稿日を合成
- 文字数に応じた動的フォントサイズ調整
- メモリキャッシュによる高速化

### フォームバリデーション
- リアルタイムバリデーション
- サーバーサイドとクライアントサイドの二重チェック
- エラーハンドリングとユーザーフィードバック

### データベース最適化
- コネクションプール（最大20接続）
- デッドロック検出とリトライ機能
- トランザクション管理

## 🚀 デプロイ

### Vercelへのデプロイ
1. Vercelアカウントにリポジトリを接続
2. 環境変数を設定：
   - `DATABASE_URL`
   - `IMGIX_URL`
   - `NEXT_PUBLIC_APP_URL`
3. 自動デプロイが開始されます

### 環境変数設定例（Vercel）
- DATABASE_URL: `postgresql://user:pass@host:port/db`
- IMGIX_URL: `your-domain.imgix.net`
- NEXT_PUBLIC_APP_URL: `https://your-app.vercel.app`

## 🤝 コントリビューション

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙏 謝辞

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [Hono](https://hono.dev/) - 軽量Webフレームワーク
- [Ant Design](https://ant.design/) - UIコンポーネント
- [imgix](https://imgix.com/) - 画像最適化サービス
- [Drizzle](https://orm.drizzle.team/) - TypeScript ORM
