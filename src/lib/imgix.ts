export function generateImgixOgpUrl(
  title: string,
  description?: string
): string {
  const imgixDomain = process.env.IMGIX_DOMAIN || "your-imgix-domain.imgix.net";
  const baseImage = "ogp-base.png"; // 固定のベース画像

  const params = new URLSearchParams({
    txt: title,
    "txt-size": "48",
    "txt-color": "ffffff",
    "txt-align": "center,middle",
    "txt-font": "Arial Bold",
    "txt-pad": "40",
    w: "1200",
    h: "630",
    fit: "crop",
    auto: "format",
  });

  if (description) {
    params.append("txt64", btoa(description));
    params.append("txt-size64", "32");
    params.append("txt-color64", "cccccc");
    params.append("txt-align64", "center,bottom");
    params.append("txt-pad64", "40");
  }

  return `https://${imgixDomain}/${baseImage}?${params.toString()}`;
}
