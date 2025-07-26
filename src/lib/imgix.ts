import { format } from "date-fns";

// メモ化用のキャッシュ
const imgixUrlCache = new Map<string, string>();

// テキスト長に応じてフォントサイズを動的調整
const getOptimalFontSize = (text: string): string => {
  const length = text.length;
  if (length <= 10) return "56";
  if (length <= 15) return "52";
  if (length <= 20) return "48";
  if (length <= 25) return "44";
  return "40";
};

// テキスト長に応じてパディングも調整
const getOptimalPadding = (text: string): string => {
  const length = text.length;
  if (length <= 15) return "60";
  if (length <= 25) return "80";
  return "100";
};

export const generateImgixOgpUrl = (
  title: string,
  createdAt?: Date | string
): string => {
  const cacheKey = createdAt ? `${title}:${createdAt}` : title;

  // キャッシュにあれば返す
  if (imgixUrlCache.has(cacheKey)) {
    return imgixUrlCache.get(cacheKey)!;
  }

  const imgixDomain = process.env.IMGIX_URL || "your-imgix-domain.imgix.net";
  const baseImage = "yep/ogp.jpg";

  const fontSize = getOptimalFontSize(title);
  const padding = getOptimalPadding(title);

  // 投稿日のフォーマット
  let formattedDate = "";
  if (createdAt) {
    const date =
      typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    formattedDate = format(date, "yyyy/MM/dd");
  }

  const params = new URLSearchParams({
    txt: title, // タイトルテキスト
    "txt-size": fontSize, // 動的にフォントサイズを設定
    "txt-color": "333333", // テキストカラー
    "txt-align": "center,middle", // 中央揃え
    "txt-pad": padding, // パディングを動的に設定
    "txt-font": "Hiragino Sans W6", // 日本語に適したフォント
    "txt-fit": "max", // テキストを領域内に自動収束
    "txt-width": "1000", // テキスト幅を少し狭めて確実に収める
    "txt-line-height": "1.5", // 日本語に適した行間
    "txt-shad": "2", // 少し影を付けて可読性向上
    w: "1200", // OGP画像の幅
    h: "630", // OGP画像の高さ
    fit: "crop", // 画像をクロップしてフィット
    auto: "format", // 自動フォーマット
    q: "90", // 画質を高めに設定
  });

  // 投稿日がある場合はblendで左下に追加
  if (formattedDate) {
    // 日付テキストを生成
    const transparentPixel = "https://assets.imgix.net/~text";
    const dateImageUrl =
      `${transparentPixel}` +
      `?txt=${encodeURIComponent(formattedDate)}` + // 日付テキスト
      `&txt-size=24` + // フォントサイズ
      `&txt-color=666666` + // 日付のテキストカラー
      `&txt-font=Hiragino Sans W6` + // フォント
      `&txt-align=left,bottom` + // 左下に配置
      `&txt-pad=40` + // パディング
      `&w=1200` + // OGP画像の幅
      `&h=630`; // OGP画像の高さ

    params.set("blend", encodeURIComponent(dateImageUrl));
    params.set("blend-mode", "normal");
  }

  const url = `https://${imgixDomain}/${baseImage}?${params.toString()}`;

  // キャッシュに保存（最大100個まで）
  if (imgixUrlCache.size >= 100) {
    const firstKey = imgixUrlCache.keys().next().value;
    if (firstKey) {
      imgixUrlCache.delete(firstKey);
    }
  }
  imgixUrlCache.set(cacheKey, url);

  return url;
};
