export function normalizeShowTitle(title: string | undefined | null): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics / accents (e.g., ō -> o)
    .replace(/\b(the|a|an)\b/gi, '') // Remove articles ('the', 'a', 'an')
    .replace(/[^a-z0-9]/g, '') // Remove punctuation, spaces, quotes, hyphens, colons
    .trim();
}

export function isSameShowTitle(title1: string | undefined | null, title2: string | undefined | null): boolean {
  if (!title1 || !title2) return false;
  return normalizeShowTitle(title1) === normalizeShowTitle(title2);
}

const KNOWN_CANONICAL_TITLES: Record<string, string> = {
  'whitelotus': 'The White Lotus',
  'shogun': 'Shōgun',
  'thexfiles': 'The X-Files',
  'xfiles': 'The X-Files',
};

export function getCanonicalShowTitle(
  title: string | undefined | null,
  existingList?: (string | { title?: string } | null | undefined)[]
): string {
  if (!title) return '';
  const trimmed = title.trim();
  const normalized = normalizeShowTitle(trimmed);

  // 1. Check known canonical title map
  if (KNOWN_CANONICAL_TITLES[normalized]) {
    return KNOWN_CANONICAL_TITLES[normalized];
  }

  // 2. Check if a matching title already exists in the provided list
  if (existingList && existingList.length > 0) {
    for (const item of existingList) {
      if (!item) continue;
      const existingTitle = typeof item === 'string' ? item : item.title;
      if (existingTitle && isSameShowTitle(trimmed, existingTitle)) {
        return existingTitle.trim();
      }
    }
  }

  return trimmed;
}

