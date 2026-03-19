type PosterTitleVariant = "default" | "tabloid";

export function getPosterTitleSizing(title: string, variant: PosterTitleVariant = "default") {
  const normalizedTitle = title.trim().replace(/\s+/g, " ");
  const length = normalizedTitle.length;
  const wordCount = normalizedTitle ? normalizedTitle.split(" ").length : 0;
  const score = length + Math.max(0, wordCount - 10) * 6;

  if (score > 145) {
    return variant === "tabloid"
      ? "text-[1.12rem] leading-[0.92] line-clamp-5 sm:text-[clamp(0.95rem,1.02vw,1.08rem)]"
      : "text-[1.12rem] leading-[0.92] line-clamp-5 sm:text-[clamp(0.95rem,1.02vw,1.08rem)]";
  }

  if (score > 115) {
    return variant === "tabloid"
      ? "text-[1.2rem] leading-[0.93] line-clamp-5 sm:text-[clamp(1.02rem,1.12vw,1.22rem)]"
      : "text-[1.2rem] leading-[0.93] line-clamp-5 sm:text-[clamp(1.02rem,1.12vw,1.22rem)]";
  }

  if (score > 85) {
    return variant === "tabloid"
      ? "text-[1.32rem] leading-[0.94] line-clamp-4 sm:text-[clamp(1.08rem,1.28vw,1.42rem)]"
      : "text-[1.32rem] leading-[0.94] line-clamp-4 sm:text-[clamp(1.08rem,1.28vw,1.42rem)]";
  }

  return variant === "tabloid"
    ? "text-[1.48rem] leading-[0.95] line-clamp-4 sm:text-[clamp(1.14rem,1.5vw,1.75rem)]"
    : "text-[1.48rem] leading-[0.95] line-clamp-4 sm:text-[clamp(1.14rem,1.45vw,1.68rem)]";
}
