function normalizeStoryText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toStorySlug(title: string, maxWords = 12): string {
  const normalized = normalizeStoryText(title);
  if (!normalized) return "";

  return normalized
    .split(" ")
    .filter(Boolean)
    .slice(0, maxWords)
    .join("-");
}

export function buildStoryHref(id: string, title: string): string {
  const slug = toStorySlug(title);
  if (!slug) return `/stire/${id}`;
  return `/stire/${id}?s=${encodeURIComponent(slug)}`;
}

export function normalizeStorySlug(value: string): string {
  return normalizeStoryText(value.replace(/-/g, " ")).replace(/\s+/g, "-");
}

/**
 * Legacy-link fallback: find a story whose title slug matches the `?s=` slug exactly, or failing
 * that shares its first six words.
 */
export function findStoryBySlug<T extends { title: string }>(pool: T[], slug: string): T | undefined {
  if (!slug) return undefined;
  const exact = pool.find((story) => toStorySlug(story.title) === slug);
  if (exact) return exact;

  const slugPrefix = slug.split("-").slice(0, 6).join("-");
  return slugPrefix ? pool.find((story) => toStorySlug(story.title).startsWith(slugPrefix)) : undefined;
}
