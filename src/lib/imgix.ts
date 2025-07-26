import { format } from "date-fns";

const CACHE_MAX_SIZE = 100;
const OGP_WIDTH = 1200;
const OGP_HEIGHT = 630;
const DEFAULT_IMGIX_DOMAIN = "your-imgix-domain.imgix.net";
const BASE_IMAGE_PATH = "yep/ogp.jpg";
const TRANSPARENT_TEXT_URL = "https://assets.imgix.net/~text";

const FONT_SIZE_CONFIG = {
  EXTRA_LARGE: "56", // 10文字以下
  LARGE: "52", // 15文字以下
  MEDIUM: "48", // 20文字以下
  SMALL: "44", // 25文字以下
  EXTRA_SMALL: "40", // 26文字以上
} as const;

const PADDING_CONFIG = {
  SMALL: "60", // 15文字以下
  MEDIUM: "80", // 25文字以下
  LARGE: "100", // 26文字以上
} as const;

const TITLE_STYLE = {
  COLOR: "333333",
  FONT: "Hiragino Sans W6",
  ALIGN: "center,middle",
  FIT: "max",
  WIDTH: "1000",
  LINE_HEIGHT: "1.5",
  SHADOW: "2",
} as const;

const DATE_STYLE = {
  SIZE: "24",
  COLOR: "666666",
  FONT: "Hiragino Sans W6",
  ALIGN: "left,bottom",
  PADDING: "40",
} as const;

const IMAGE_QUALITY = {
  HIGH: "90",
  CROP_FIT: "crop",
  AUTO_FORMAT: "format",
} as const;

// メモ化用のキャッシュ
const imgixUrlCache = new Map<string, string>();

// テキスト長に応じてフォントサイズを動的調整
const getOptimalFontSize = (text: string): string => {
  const length = text.length;
  if (length <= 10) return FONT_SIZE_CONFIG.EXTRA_LARGE;
  if (length <= 15) return FONT_SIZE_CONFIG.LARGE;
  if (length <= 20) return FONT_SIZE_CONFIG.MEDIUM;
  if (length <= 25) return FONT_SIZE_CONFIG.SMALL;
  return FONT_SIZE_CONFIG.EXTRA_SMALL;
};

// テキスト長に応じてパディングも調整
const getOptimalPadding = (text: string): string => {
  const length = text.length;
  if (length <= 15) return PADDING_CONFIG.SMALL;
  if (length <= 25) return PADDING_CONFIG.MEDIUM;
  return PADDING_CONFIG.LARGE;
};

export const generateImgixOgpUrl = (title: string, createdAt: Date): string => {
  const cacheKey = `${title}:${createdAt}`;

  if (imgixUrlCache.has(cacheKey)) {
    return imgixUrlCache.get(cacheKey)!;
  }

  const imgixDomain = process.env.IMGIX_URL || DEFAULT_IMGIX_DOMAIN;
  const baseImage = BASE_IMAGE_PATH;

  const fontSize = getOptimalFontSize(title);
  const padding = getOptimalPadding(title);

  // 投稿日のフォーマット
  const formattedDate = format(createdAt, "yyyy/MM/dd");

  const params = new URLSearchParams({
    txt: title, // タイトルテキスト
    "txt-size": fontSize, // 動的にフォントサイズを設定
    "txt-color": TITLE_STYLE.COLOR, // テキストカラー
    "txt-align": TITLE_STYLE.ALIGN, // 中央揃え
    "txt-pad": padding, // パディングを動的に設定
    "txt-font": TITLE_STYLE.FONT, // 日本語に適したフォント
    "txt-fit": TITLE_STYLE.FIT, // テキストを領域内に自動収束
    "txt-width": TITLE_STYLE.WIDTH, // テキスト幅を少し狭めて確実に収める
    "txt-line-height": TITLE_STYLE.LINE_HEIGHT, // 日本語に適した行間
    "txt-shad": TITLE_STYLE.SHADOW, // 少し影を付けて可読性向上
    w: OGP_WIDTH.toString(), // OGP画像の幅
    h: OGP_HEIGHT.toString(), // OGP画像の高さ
    fit: IMAGE_QUALITY.CROP_FIT, // 画像をクロップしてフィット
    auto: IMAGE_QUALITY.AUTO_FORMAT, // 自動フォーマット
    q: IMAGE_QUALITY.HIGH, // 画質を高めに設定
  });

  // 投稿日をblendで左下に追加
  const dateImageUrl =
    `${TRANSPARENT_TEXT_URL}` +
    `?txt=${encodeURIComponent(formattedDate)}` + // 日付テキスト
    `&txt-size=${DATE_STYLE.SIZE}` + // フォントサイズ
    `&txt-color=${DATE_STYLE.COLOR}` + // 日付のテキストカラー
    `&txt-font=${encodeURIComponent(DATE_STYLE.FONT)}` + // フォント
    `&txt-align=${DATE_STYLE.ALIGN}` + // 左下に配置
    `&txt-pad=${DATE_STYLE.PADDING}` + // パディング
    `&w=${OGP_WIDTH}` + // OGP画像の幅
    `&h=${OGP_HEIGHT}`; // OGP画像の高さ

  params.set("blend", encodeURIComponent(dateImageUrl));
  params.set("blend-mode", "normal");

  const url = `https://${imgixDomain}/${baseImage}?${params.toString()}`;

  if (imgixUrlCache.size >= CACHE_MAX_SIZE) {
    const firstKey = imgixUrlCache.keys().next().value;
    if (firstKey) {
      imgixUrlCache.delete(firstKey);
    }
  }
  imgixUrlCache.set(cacheKey, url);

  return url;
};
