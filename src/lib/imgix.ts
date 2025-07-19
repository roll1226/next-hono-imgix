export const generateImgixOgpUrl = (title: string): string => {
  const imgixDomain = process.env.IMGIX_URL || "your-imgix-domain.imgix.net";
  const baseImage = "yep/ogp.jpg";

  const params = new URLSearchParams({
    txt: title,
    "txt-size": "100",
    "txt-color": "333333",
    "txt-align": "center,middle",
    "txt-font": "Arial Bold",
    "txt-pad": "40",
    w: "1200",
    h: "630",
    fit: "crop",
    auto: "format",
  });

  return `https://${imgixDomain}/${baseImage}?${params.toString()}`;
};
