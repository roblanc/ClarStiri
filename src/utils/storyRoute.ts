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
