const NAMED_HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&nbsp;": " ",
  "&mdash;": "—",
  "&ndash;": "–",
  "&laquo;": "«",
  "&raquo;": "»",
  "&icirc;": "î",
  "&Icirc;": "Î",
  "&acirc;": "â",
  "&Acirc;": "Â",
  "&scedil;": "ș",
  "&Scedil;": "Ș",
  "&tcedil;": "ț",
  "&Tcedil;": "Ț",
  "&atilde;": "ã",
  "&Atilde;": "Ã",
  "&hellip;": "…",
  "&rsquo;": "'",
  "&lsquo;": "'",
  "&rdquo;": '"',
  "&ldquo;": '"',
};

const ENTITY_RE = /&(?:#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]+);/g;

function decodeNumericEntity(entity: string): string | null {
  const isHex = entity.startsWith("&#x") || entity.startsWith("&#X");
  const rawValue = entity.slice(isHex ? 3 : 2, -1);
  const codePoint = Number.parseInt(rawValue, isHex ? 16 : 10);

  if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
    return null;
  }

  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return null;
  }
}

function decodeEntity(entity: string): string {
  if (entity in NAMED_HTML_ENTITIES) {
    return NAMED_HTML_ENTITIES[entity];
  }

  if (entity.startsWith("&#")) {
    return decodeNumericEntity(entity) ?? entity;
  }

  return entity;
}

export function decodeHtmlEntities(text: string, maxPasses = 2): string {
  if (!text) return "";

  let decoded = text;

  for (let pass = 0; pass < maxPasses; pass++) {
    const next = decoded.replace(ENTITY_RE, decodeEntity);
    if (next === decoded) break;
    decoded = next;
  }

  return decoded;
}
