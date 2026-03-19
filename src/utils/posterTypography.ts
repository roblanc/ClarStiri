type PosterTitleVariant = "default" | "tabloid";

export function getPosterTitleSizing(title: string, variant: PosterTitleVariant = "default") {
  const normalizedTitle = title.trim().replace(/\s+/g, " ");
  const length = normalizedTitle.length;
  const wordCount = normalizedTitle ? normalizedTitle.split(" ").length : 0;
  const score = length + Math.max(0, wordCount - 10) * 6;

  if (score > 145) {
    return variant === "tabloid"
      ? "text-[clamp(0.82rem,0.95vw,1.02rem)] leading-[0.9] line-clamp-5"
      : "text-[clamp(0.82rem,0.95vw,1.02rem)] leading-[0.9] line-clamp-5";
  }

  if (score > 115) {
    return variant === "tabloid"
      ? "text-[clamp(0.9rem,1.08vw,1.22rem)] leading-[0.92] line-clamp-5"
      : "text-[clamp(0.9rem,1.08vw,1.22rem)] leading-[0.92] line-clamp-5";
  }

  if (score > 85) {
    return variant === "tabloid"
      ? "text-[clamp(0.98rem,1.22vw,1.42rem)] leading-[0.93] line-clamp-4"
      : "text-[clamp(0.98rem,1.22vw,1.42rem)] leading-[0.93] line-clamp-4";
  }

  return variant === "tabloid"
    ? "text-[clamp(1.08rem,1.5vw,1.75rem)] leading-[0.94] line-clamp-4"
    : "text-[clamp(1.08rem,1.45vw,1.68rem)] leading-[0.94] line-clamp-4";
}
