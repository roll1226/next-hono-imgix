export const generateImgixOgpUrl = (title: string): string => {
  const imgixDomain = process.env.IMGIX_URL || "your-imgix-domain.imgix.net";
  const baseImage = "yep/ogp.jpg";

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

  const fontSize = getOptimalFontSize(title);
  const padding = getOptimalPadding(title);

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

  return `https://${imgixDomain}/${baseImage}?${params.toString()}`;
};
