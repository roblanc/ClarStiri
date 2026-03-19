type PosterTitleVariant = "default" | "tabloid";

export function getPosterTitleSizing(title: string, variant: PosterTitleVariant = "default") {
  const normalizedTitle = title.trim().replace(/\s+/g, " ");
  const length = normalizedTitle.length;
  const wordCount = normalizedTitle ? normalizedTitle.split(" ").length : 0;
  const score = length + Math.max(0, wordCount - 10) * 6;

  if (score > 145) {
    return variant === "tabloid"
      ? "text-[1.3rem] leading-[1.03] line-clamp-5 sm:text-[clamp(1.04rem,1.08vw,1.16rem)]"
      : "text-[1.3rem] leading-[1.03] line-clamp-5 sm:text-[clamp(1.04rem,1.08vw,1.16rem)]";
  }

  if (score > 115) {
    return variant === "tabloid"
      ? "text-[1.42rem] leading-[1.04] line-clamp-5 sm:text-[clamp(1.1rem,1.2vw,1.3rem)]"
      : "text-[1.42rem] leading-[1.04] line-clamp-5 sm:text-[clamp(1.1rem,1.2vw,1.3rem)]";
  }

  if (score > 85) {
    return variant === "tabloid"
      ? "text-[1.56rem] leading-[1.05] line-clamp-4 sm:text-[clamp(1.18rem,1.36vw,1.5rem)]"
      : "text-[1.56rem] leading-[1.05] line-clamp-4 sm:text-[clamp(1.18rem,1.36vw,1.5rem)]";
  }

  return variant === "tabloid"
    ? "text-[1.8rem] leading-[1.06] line-clamp-4 sm:text-[clamp(1.26rem,1.58vw,1.86rem)]"
    : "text-[1.8rem] leading-[1.06] line-clamp-4 sm:text-[clamp(1.26rem,1.52vw,1.78rem)]";
}
