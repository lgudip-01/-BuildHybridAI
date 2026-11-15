import type { EntityKind } from '../types';

export type Span = { start: number; end: number; value: string; kind: EntityKind };

type Pattern = { kind: EntityKind; re: RegExp; group?: number };

const MONTH =
  '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\.?';
const ORDINAL = '(?:st|nd|rd|th)?';
const NUM = '(?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d+)?';
const SCALE = '(?:\\s?(?:thousand|million|billion|[KMB])\\b)?';
const CURRENCY_CODE = '(?:USD|EUR|GBP|CAD|AUD|INR|JPY)';
const CURRENCY_WORD = '(?:dollars?|euros?|pounds?)';
const NUMBER_WORD =
  '(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)';

const PATTERNS: Pattern[] = [
  { kind: 'EMAIL', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g },

  { kind: 'AMOUNT', re: new RegExp(`(?:US|CA|AU|C|A)?[$€£¥₹]\\s?${NUM}${SCALE}`, 'gi') },
  { kind: 'AMOUNT', re: new RegExp(`\\b${CURRENCY_CODE}\\s?${NUM}${SCALE}`, 'gi') },
  { kind: 'AMOUNT', re: new RegExp(`(?<![\\w.])${NUM}${SCALE}\\s?(?:${CURRENCY_CODE}|${CURRENCY_WORD})\\b`, 'gi') },
  {
    kind: 'AMOUNT',
    re: new RegExp(`\\b${NUMBER_WORD}(?:[\\s-]+(?:and[\\s-]+)?${NUMBER_WORD})*\\s+(?:US\\s+)?${CURRENCY_WORD}\\b`, 'gi'),
  },

  { kind: 'DATE', re: /\b\d{4}-\d{1,2}-\d{1,2}\b/g },
  { kind: 'DATE', re: /(?<![\d./-])\d{1,2}([/-])\d{1,2}\1(?:\d{4}|\d{2})(?![\d/-])/g },
  // Dotted dates need a 4-digit year so section numbers like 1.2.10 aren't caught.
  { kind: 'DATE', re: /(?<![\d.])\d{1,2}\.\d{1,2}\.\d{4}(?![\d.]\d)/g },
  { kind: 'DATE', re: new RegExp(`\\b${MONTH}\\s+\\d{1,2}${ORDINAL},?\\s+\\d{4}\\b`, 'gi') },
  { kind: 'DATE', re: new RegExp(`\\b\\d{1,2}${ORDINAL}\\s+(?:day\\s+of\\s+)?${MONTH},?\\s+\\d{4}\\b`, 'gi') },
  { kind: 'DATE', re: new RegExp(`\\b${MONTH}\\s+\\d{4}\\b`, 'gi') },

  { kind: 'PHONE', re: /(?<![\w+])(?:\+\d{1,3}[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)/g },

  { kind: 'ACCOUNT', re: /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){2,7}(?:\s?[A-Z0-9]{1,3})?\b/g },
  // 8 to 19 digits: bank and card numbers, SSNs, routing numbers.
  { kind: 'ACCOUNT', re: /(?<![\w.,])\d(?:[ -]?\d){7,18}(?![\w,]|\.\d)/g },
  // A labelled number of any length, e.g. "Account No. 4417".
  {
    kind: 'ACCOUNT',
    re: /\b(?:account|acct|routing|ABA|IBAN|SWIFT|BIC|SSN|EIN|TIN|tax\s+ID|card)(?:\s+(?:no\.?|number|num\.?|#))?\s*[:#]?\s*([A-Z0-9-]*\d[A-Z0-9-]*(?:\s[A-Z0-9-]*\d[A-Z0-9-]*)*)/dgi,
    group: 1,
  },
];

// Capitalized words that are contract vocabulary, not names.
const LEGAL_WORDS = new Set([
  'the', 'this', 'that', 'these', 'each', 'any', 'all', 'such', 'a', 'an', 'of', 'and', 'or', 'in', 'to', 'for', 'by', 'with', 'on', 'under',
  'agreement', 'contract', 'party', 'parties', 'company', 'client', 'customer', 'contractor', 'consultant', 'vendor', 'supplier',
  'provider', 'licensor', 'licensee', 'employer', 'employee', 'buyer', 'seller', 'landlord', 'tenant', 'lessor', 'lessee',
  'disclosing', 'receiving', 'recipient', 'discloser', 'confidential', 'information', 'effective', 'date', 'term', 'termination',
  'services', 'service', 'work', 'product', 'products', 'deliverables', 'statement', 'scope', 'fees', 'payment', 'payments',
  'intellectual', 'property', 'limitation', 'liability', 'indemnification', 'indemnity', 'warranty', 'warranties', 'governing',
  'law', 'jurisdiction', 'notice', 'notices', 'entire', 'miscellaneous', 'definitions', 'general', 'section', 'article', 'exhibit',
  'schedule', 'appendix', 'non', 'disclosure', 'mutual', 'master', 'witness', 'whereof', 'now', 'therefore', 'recitals',
  'confidentiality', 'obligations', 'assignment', 'severability', 'waiver', 'amendment', 'counterparts', 'force', 'majeure',
  'independent', 'relationship', 'compensation', 'expenses', 'taxes', 'insurance', 'records', 'audit', 'remedies', 'survival',
]);

const ORG_SUFFIXES = ['Inc', 'LLC', 'L.L.C', 'Ltd', 'Limited', 'Corp', 'Corporation', 'Co', 'Company', 'LLP', 'LP', 'PLC', 'GmbH', 'AG', 'BV', 'S.A'];
const ORG_SUFFIX = ORG_SUFFIXES.flatMap((s) => [s, s.toUpperCase()])
  .map((s) => s.replace(/\./g, '\\.'))
  .join('|');
// A capitalized word or an initial. No trailing period, so a name can't run across a sentence end.
const NAME_WORD = "(?:[A-Z]\\.|[A-Z][\\w&'’-]*)";
const STREET_TYPE = 'Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl|Parkway|Pkwy|Highway|Hwy';

const ORG = new RegExp(`\\b(?:${NAME_WORD}[^\\S\\r\\n]+){0,5}${NAME_WORD},?[^\\S\\r\\n]+(?:${ORG_SUFFIX})\\b\\.?`, 'g');
// "42 Elm Street, Suite 300, Springfield, NJ 07001"
const STREET_ADDRESS = new RegExp(
  `\\b\\d{1,6}\\s+(?:${NAME_WORD}\\s+){1,4}(?:${STREET_TYPE})\\b\\.?` +
    `(?:,?\\s+(?:Suite|Ste|Unit|Floor|Fl)\\.?\\s+\\w+)?` +
    `(?:,\\s+${NAME_WORD}(?:\\s+${NAME_WORD})?)?(?:,?\\s+[A-Z]{2})?(?:\\s+\\d{5}(?:-\\d{4})?)?`,
  'g',
);
// Names never span a line break, or "By: Dana Reyes\nName: …" would swallow "Name".
const SP = '[^\\S\\r\\n]+';
const PERSON_WORD = "[A-Z][a-z'’-]+";
const TITLED_PERSON = new RegExp(`\\b(?:Mr|Mrs|Ms|Mx|Dr|Prof)\\.?${SP}${PERSON_WORD}(?:${SP}${PERSON_WORD}){0,2}`, 'g');
const SIGNATURE_NAME = new RegExp(
  `\\b(?:By|Name|Signed|Signature)[^\\S\\r\\n]*:[^\\S\\r\\n]*(${PERSON_WORD}(?:${SP}[A-Z]\\.)?(?:${SP}${PERSON_WORD}){1,2})`,
  'dg',
);
const CAPITALIZED_PHRASE = new RegExp(`\\b${NAME_WORD}(?:${SP}(?:(?:of|and|&)${SP})?${NAME_WORD}){1,4}`, 'g');

const TRAILING_ORG_SUFFIX = new RegExp(`[,\\s]+(?:${ORG_SUFFIX})\\.?$`);

/** "Acme Holdings, Inc." → "Acme Holdings" */
export function stripOrgSuffix(value: string): string {
  let core = value.trim();
  for (let next = core.replace(TRAILING_ORG_SUFFIX, ''); next !== core; next = core.replace(TRAILING_ORG_SUFFIX, '')) {
    core = next;
  }
  return core;
}

export function isGeneric(value: string): boolean {
  const words = value.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return words.length === 0 || words.every((w) => LEGAL_WORDS.has(w));
}

function collect(text: string, kind: EntityKind, re: RegExp, group?: number): Span[] {
  const spans: Span[] = [];
  for (const m of text.matchAll(re)) {
    const range: [number, number] | undefined =
      group === undefined ? [m.index, m.index + m[0].length] : m.indices?.[group];
    if (!range) continue;
    const [start, end] = range;
    spans.push({ start, end, value: text.slice(start, end), kind });
  }
  return spans;
}

/** Structured details: amounts, dates, emails, phone and account numbers. */
export function findPatterns(text: string): Span[] {
  return PATTERNS.flatMap((p) => collect(text, p.kind, p.re, p.group));
}

/**
 * Names that patterns can find without a model. Company names with a legal suffix,
 * titled people, signature lines and street addresses are always reliable. `broad` adds every
 * capitalized phrase that isn't contract vocabulary, for when there is no on-device model.
 */
export function findNames(text: string, broad: boolean): Span[] {
  const spans = [
    ...collect(text, 'ORG', ORG),
    ...collect(text, 'PERSON', TITLED_PERSON),
    ...collect(text, 'PERSON', SIGNATURE_NAME, 1),
    ...collect(text, 'ADDRESS', STREET_ADDRESS),
  ];
  if (broad) {
    spans.push(
      ...collect(text, 'NAME', CAPITALIZED_PHRASE).filter((s) => s.value !== s.value.toUpperCase()),
    );
  }
  return spans
    .map((s) => trimLeadingArticle(text, s))
    .filter((s) => !isGeneric(stripOrgSuffix(s.value)));
}

function trimLeadingArticle(text: string, span: Span): Span {
  const lead = /^(?:The|This|THE|THIS)\s+/.exec(span.value);
  if (!lead) return span;
  const start = span.start + lead[0].length;
  return { ...span, start, value: text.slice(start, span.end) };
}
