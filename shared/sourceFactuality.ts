/**
 * Evidence-based factuality ratings.
 *
 * Every label is computed by `rateFactuality` from public, linkable records listed below.
 * Nothing is inferred: a source with no verifiable evidence is "insufficient", and a source
 * missing from a published list is NOT treated as having zero sanctions.
 *
 * Each evidence item states which entity it covers (the TV channel or the website), because
 * CNA sanctions apply to broadcasters while MBFC rates websites.
 *
 * When adding evidence: fetch the page yourself, copy the figures exactly, and record the URL
 * and the date you checked it. Bump FACTUALITY_RULE_VERSION if the rule itself changes.
 */

export type FactualityRating = 'high' | 'mixed' | 'low' | 'insufficient';

export const FACTUALITY_RULE_VERSION = 'v1';
export const FACTUALITY_RULE_UPDATED = '2026-09-29';

type MbfcFactual = 'very-high' | 'high' | 'mostly-factual' | 'mixed' | 'low' | 'very-low';

interface EvidenceBase {
  /** Which entity the record covers, e.g. "postul TV Realitatea Plus" or "site-ul realitatea.net". */
  entity: string;
  url: string;
  /** Publisher of the linked page. */
  publisher: string;
  /** Date the page was checked (YYYY-MM-DD). */
  checkedAt: string;
}

export type FactualityEvidence =
  | (EvidenceBase & {
      kind: 'cna-sanctions';
      year: number;
      fines: number;
      finesLei?: number;
      warnings?: number;
    })
  | (EvidenceBase & {
      kind: 'mbfc';
      factualReporting: MbfcFactual;
      /** MBFC's own "last updated" date for the rating. */
      ratedAt: string;
    })
  | (EvidenceBase & { kind: 'jti'; certified: true; since?: string })
  | (EvidenceBase & {
      kind: 'cna-history';
      period: string;
      fines: number;
      warnings: number;
    });

const CNA_2025_URL = 'https://www.paginademedia.ro/cna/raport-activitate-cna-2025-top-amenzi-22395349';
const ACTIVEWATCH_URL =
  'https://www.g4media.ro/raport-breaking-news-democracy-realitatea-tv-romania-tv-si-antena-3-sunt-cele-mai-des-sanctionate-televiziuni-in-ultimii-10-ani-volumul-amenzilor-inregistrate-anual-este-de-200-300-de-mi.html';
const JTI_URL =
  'https://www.monitorulbt.ro/local/2025/03/04/30-de-ani-de-jurnalism-curat-monitorul-de-botosani-prima-publicatie-locala-din-romania-cu-certificare-jti/';
const CHECKED = '2026-09-29';

const cna2025 = (entity: string, fines: number, finesLei: number | undefined, warnings: number): FactualityEvidence => ({
  kind: 'cna-sanctions',
  year: 2025,
  fines,
  finesLei,
  warnings,
  entity,
  url: CNA_2025_URL,
  publisher: 'Paginademedia.ro (raportul anual CNA 2025)',
  checkedAt: CHECKED,
});

const activeWatch = (entity: string, fines: number, warnings: number): FactualityEvidence => ({
  kind: 'cna-history',
  period: '2011–2022',
  fines,
  warnings,
  entity,
  url: ACTIVEWATCH_URL,
  publisher: 'ActiveWatch, raportul „Breaking News Democracy” (via G4Media)',
  checkedAt: CHECKED,
});

const mbfc = (entity: string, url: string, factualReporting: MbfcFactual, ratedAt: string): FactualityEvidence => ({
  kind: 'mbfc',
  factualReporting,
  ratedAt,
  entity,
  url,
  publisher: 'Media Bias/Fact Check',
  checkedAt: CHECKED,
});

export const FACTUALITY_EVIDENCE: Record<string, FactualityEvidence[]> = {
  realitatea: [
    cna2025('postul TV Realitatea Plus', 29, 1_150_000, 31),
    mbfc('site-ul realitatea.net', 'https://mediabiasfactcheck.com/realitatea-net-bias-and-credibility/', 'mixed', '2025-02-13'),
    activeWatch('postul TV Realitatea TV', 127, 104),
  ],
  romaniatv: [
    cna2025('postul TV România TV', 20, 300_000, 19),
    mbfc('România TV', 'https://mediabiasfactcheck.com/romania-tv-bias-and-credibility/', 'mixed', '2025-02-04'),
    activeWatch('postul TV România TV', 113, 118),
  ],
  antena3: [
    cna2025('postul TV Antena 3 CNN', 2, 25_000, 9),
    activeWatch('postul TV Antena 3', 85, 90),
  ],
  b1tv: [
    cna2025('postul TV B1 TV', 0, undefined, 5),
    activeWatch('postul TV B1 TV', 61, 66),
  ],
  digi24: [
    mbfc('Digi24', 'https://mediabiasfactcheck.com/digi24-bias/', 'high', '2025-01-20'),
    activeWatch('postul TV Digi24', 6, 21),
  ],
  hotnews: [
    mbfc('site-ul HotNews.ro', 'https://mediabiasfactcheck.com/hotnews-romania-bias/', 'high', '2024-02-16'),
  ],
  agerpres: [
    mbfc('agenția Agerpres', 'https://mediabiasfactcheck.com/agerpres/', 'high', '2026-07-24'),
  ],
  pressone: [
    {
      kind: 'jti',
      certified: true,
      entity: 'PressOne',
      url: JTI_URL,
      publisher: 'Monitorul de Botoșani (listă publicații certificate JTI în România, martie 2025)',
      checkedAt: CHECKED,
    },
  ],
};

/** CNA fines in the most recent year on record at or above this count → "low". */
const CNA_FINES_LOW = 10;

export interface FactualityResult {
  rating: FactualityRating;
  /** Plain-language reason, citing the evidence that decided the label. */
  reason: string;
  evidence: FactualityEvidence[];
}

/**
 * Rule v1 (see /metodologie):
 * 1. ≥10 CNA fines in the latest year on record, or an MBFC factual rating of Low/Very Low → low
 * 2. 1–9 CNA fines in the latest year, or MBFC Mixed → mixed
 * 3. MBFC High/Very High/Mostly Factual, or JTI certification, with no CNA fines in the latest year → high
 * 4. otherwise → insufficient
 * Historical CNA data (ActiveWatch 2011–2022) is shown as context and never changes the label.
 */
export function rateFactuality(evidence: FactualityEvidence[]): Omit<FactualityResult, 'evidence'> {
  const cna = evidence
    .filter((e): e is Extract<FactualityEvidence, { kind: 'cna-sanctions' }> => e.kind === 'cna-sanctions')
    .sort((a, b) => b.year - a.year)[0];
  const mbfcItem = evidence.find((e): e is Extract<FactualityEvidence, { kind: 'mbfc' }> => e.kind === 'mbfc');
  const jti = evidence.some(e => e.kind === 'jti');

  if (cna && cna.fines >= CNA_FINES_LOW) {
    return { rating: 'low', reason: `${cna.fines} amenzi CNA în ${cna.year} pentru ${cna.entity} (prag: ${CNA_FINES_LOW}).` };
  }
  if (mbfcItem && (mbfcItem.factualReporting === 'low' || mbfcItem.factualReporting === 'very-low')) {
    return { rating: 'low', reason: `Media Bias/Fact Check evaluează ${mbfcItem.entity} cu factualitate scăzută.` };
  }
  if (cna && cna.fines > 0) {
    return { rating: 'mixed', reason: `${cna.fines} amenzi CNA în ${cna.year} pentru ${cna.entity}.` };
  }
  if (mbfcItem?.factualReporting === 'mixed') {
    return { rating: 'mixed', reason: `Media Bias/Fact Check evaluează ${mbfcItem.entity} cu factualitate mixtă.` };
  }
  if (mbfcItem && ['very-high', 'high', 'mostly-factual'].includes(mbfcItem.factualReporting)) {
    return { rating: 'high', reason: `Media Bias/Fact Check evaluează ${mbfcItem.entity} cu factualitate ridicată.` };
  }
  if (jti) {
    return { rating: 'high', reason: 'Publicație certificată Journalism Trust Initiative (JTI).' };
  }
  return {
    rating: 'insufficient',
    reason: evidence.length
      ? 'Datele publice disponibile nu sunt suficiente pentru o etichetă.'
      : 'Nu există încă date publice verificabile pentru această sursă.',
  };
}

export function getFactuality(sourceId: string): FactualityResult {
  const evidence = FACTUALITY_EVIDENCE[sourceId] ?? [];
  return { ...rateFactuality(evidence), evidence };
}

export const FACTUALITY_LABELS: Record<FactualityRating, string> = {
  high: 'Factualitate ridicată',
  mixed: 'Factualitate mixtă',
  low: 'Factualitate scăzută',
  insufficient: 'Date insuficiente',
};

export const FACTUALITY_SHORT_LABELS: Record<FactualityRating, string> = {
  high: 'Ridicată',
  mixed: 'Mixtă',
  low: 'Scăzută',
  insufficient: 'Date insuficiente',
};

/** Tailwind classes for the rating pill. */
export const factualityPillClass: Record<FactualityRating, string> = {
  high: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  mixed: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-rose-100 text-rose-700 border-rose-200',
  insufficient: 'bg-slate-100 text-slate-600 border-slate-200',
};

const MBFC_LABELS: Record<MbfcFactual, string> = {
  'very-high': 'Very High',
  high: 'High',
  'mostly-factual': 'Mostly Factual',
  mixed: 'Mixed',
  low: 'Low',
  'very-low': 'Very Low',
};

/** One-line, strictly factual description of an evidence item, for display. */
export function describeEvidence(e: FactualityEvidence): string {
  const lei = (n: number) => n.toLocaleString('ro-RO');
  switch (e.kind) {
    case 'cna-sanctions': {
      const fines = e.fines === 0 ? 'nicio amendă' : `${e.fines} ${e.fines === 1 ? 'amendă' : 'amenzi'}${e.finesLei ? ` (${lei(e.finesLei)} lei)` : ''}`;
      const warnings = e.warnings ? `, ${e.warnings} somații` : '';
      return `CNA ${e.year}, ${e.entity}: ${fines}${warnings}. Include toate tipurile de încălcări ale Codului audiovizualului.`;
    }
    case 'cna-history':
      return `CNA ${e.period}, ${e.entity}: ${e.fines} amenzi și ${e.warnings} somații (context istoric, nu intră în etichetă).`;
    case 'mbfc':
      return `Media Bias/Fact Check, ${e.entity}: Factual Reporting „${MBFC_LABELS[e.factualReporting]}” (actualizat ${e.ratedAt}).`;
    case 'jti':
      return `${e.entity}: certificare Journalism Trust Initiative (standardul CEN pentru transparență și profesionalism jurnalistic).`;
  }
}
