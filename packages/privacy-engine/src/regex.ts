import type { EntityKind } from '@clause-guard/core/types';

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
const ORDINAL_WORD =
  '(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|twenty[\\s-](?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth)|thirtieth|thirty[\\s-]first)';
// Web domains common in contracts. A bare "name.tld" is only masked with one of these, so "e.g." and file names stay.
const TLD = '(?:com|net|org|io|co|dev|ai|app|gov|edu|us|uk|ca|au|de|nl|fr|eu|info|biz|me)';
// The dot of an email written to dodge scrapers: "jsmith (at) acme [dot] com".
const SPELLED_DOT = '(?:\\s*[\\[(]\\s*dot\\s*[\\])]\\s*|\\.)';

const PATTERNS: Pattern[] = [
  { kind: 'EMAIL', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g },
  {
    kind: 'EMAIL',
    re: new RegExp(`[A-Za-z0-9._%+-]+\\s*[\\[(]\\s*at\\s*[\\])]\\s*[A-Za-z0-9-]+(?:${SPELLED_DOT}[A-Za-z0-9-]+)*${SPELLED_DOT}[A-Za-z]{2,}\\b`, 'gi'),
  },
  { kind: 'URL', re: /\b(?:https?:\/\/|www\.)[^\s<>"'()[\]]*[^\s<>"'()[\].,;:!?]/gi },
  {
    kind: 'URL',
    re: new RegExp(`(?<![\\w@./:-])(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+${TLD}(?![\\w-]|\\.\\w)(?:/[^\\s<>"'()]*[^\\s<>"'().,;:!?])?`, 'gi'),
  },
  { kind: 'HANDLE', re: /(?<![\w@.])@[A-Za-z0-9_](?:[A-Za-z0-9_.]*[A-Za-z0-9_])?/g },
  // Not after "Section" or "Clause", so a section number like 10.2.3.1 stays.
  {
    kind: 'IP',
    re: /(?<!(?:Sections?|Clause|Article|§)\s*)(?<![\d.])(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}(?!\d|\.\d)/g,
  },

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
  // "third of May, 2026", "twenty-first day of June, 2027", "May the 3rd, 2026"
  { kind: 'DATE', re: new RegExp(`\\b${ORDINAL_WORD}\\s+(?:day\\s+)?of\\s+${MONTH},?\\s+\\d{4}\\b`, 'gi') },
  { kind: 'DATE', re: new RegExp(`\\b${MONTH}\\s+the\\s+(?:\\d{1,2}${ORDINAL}|${ORDINAL_WORD}),?\\s+\\d{4}\\b`, 'gi') },
  // A card's expiry date: "exp 09/29", "Expiration date: 11/2027".
  {
    kind: 'DATE',
    re: /\b(?:exp(?:iry|iration|ires)?|valid\s+(?:thru|through|until))\.?(?:\s+date)?\s*:?\s*(\d{1,2}\s?\/\s?(?:\d{4}|\d{2}))(?![\d/])/dgi,
    group: 1,
  },

  { kind: 'PHONE', re: /(?<![\w+])(?:\+\d{1,3}[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)/g },

  { kind: 'ACCOUNT', re: /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){2,7}(?:\s?[A-Z0-9]{1,3})?\b/g },
  // 8 to 19 digits: bank and card numbers, SSNs, routing numbers.
  { kind: 'ACCOUNT', re: /(?<![\w.,])\d(?:[ -]?\d){7,18}(?![\w,]|\.\d)/g },
  // A labelled number of any length, e.g. "Account No. 4417".
  {
    kind: 'ACCOUNT',
    re: /\b(?:account|acct|routing|ABA|IBAN|SWIFT|BIC|SSN|EIN|TIN|ID|passport|card|CVV2?|CVC2?|CID|security\s+code)(?:\s+(?:no\.?|number|num\.?|#))?\s*[:#]?\s*([A-Z0-9-]*\d[A-Z0-9-]*(?:\s[A-Z0-9-]*\d[A-Z0-9-]*)*)/dgi,
    group: 1,
  },

  // UK and Canadian postcodes, at the end of a street address or on their own: "SW1A 2AA", "K1A 0B1".
  { kind: 'ADDRESS', re: /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/g },
  { kind: 'ADDRESS', re: /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/g },
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
  // Roles and document types the on-device model tends to report as names.
  'borrower', 'lender', 'guarantor', 'holder', 'debtor', 'creditor', 'loan', 'note', 'promissory', 'principal', 'prepayment', 'default',
  'lease', 'rental', 'residential', 'commercial', 'premises', 'rent', 'security', 'deposit', 'offer', 'employment', 'letter',
  'software', 'as', 'subscription', 'sales', 'purchase', 'order',
  // Labels of ID numbers: "Passport No.", "Social Security Number".
  'no', 'number', 'id', 'identification', 'passport', 'social', 'license', 'licence', 'driver', 'tax', 'card', 'account',
  // Pronouns. Capitalized at the start of a sentence ("Your start date is…"), the model can report them as a name.
  'i', 'me', 'my', 'mine', 'we', 'us', 'our', 'ours', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers',
  'they', 'them', 'their', 'theirs', 'it', 'its', 'yourself', 'yourselves',
]);

const ORG_SUFFIXES = ['Inc', 'LLC', 'L.L.C', 'Ltd', 'Limited', 'Corp', 'Corporation', 'Co', 'Company', 'LLP', 'LP', 'PLC', 'GmbH', 'AG', 'BV', 'B.V', 'N.V', 'S.A', 'SAS', 'Pty'];
const ORG_SUFFIX = ORG_SUFFIXES.flatMap((s) => [s, s.toUpperCase()])
  .map((s) => s.replace(/\./g, '\\.'))
  .join('|');
// Names are matched in any alphabet, so "\b" (ASCII only) can't mark where one starts or ends.
const START = '(?<![\\p{L}\\p{N}_])';
const END = '(?![\\p{L}\\p{N}_])';
// A capitalized word or an initial. No trailing period, so a name can't run across a sentence end.
const NAME_WORD = "(?:\\p{Lu}\\.|\\p{Lu}[\\p{L}&'’-]*)";
const STREET_TYPE = 'Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl|Parkway|Pkwy|Highway|Hwy';
// US ZIP, UK and Canadian postcodes.
const POSTCODE = '(?:\\d{5}(?:-\\d{4})?|[A-Z]{1,2}\\d[A-Z\\d]?\\s?\\d[A-Z]{2}|[A-Z]\\d[A-Z]\\s?\\d[A-Z]\\d)';
// A town's name, never a postcode: "London" in "London SW1A 2AA".
const PLACE_WORD = `\\p{Lu}[\\p{L}'’-]*${END}`;

const ORG = new RegExp(`${START}(?:${NAME_WORD}[^\\S\\r\\n]+){0,5}${NAME_WORD},?[^\\S\\r\\n]+(?:${ORG_SUFFIX})${END}\\.?`, 'gu');
// "42 Elm Street, Suite 300, Springfield, NJ 07001", "10 Downing Street, London SW1A 2AA"
const STREET_ADDRESS = new RegExp(
  `\\b\\d{1,6}\\s+(?:${NAME_WORD}\\s+){1,4}(?:${STREET_TYPE})\\b\\.?` +
    `(?:,?\\s+(?:(?:Suite|Ste|Unit|Floor|Fl|Apt|Apartment|Room|Rm)\\.?\\s+|#\\s*)\\w+)?` +
    `(?:,\\s+${PLACE_WORD}(?:\\s+${PLACE_WORD})?)?(?:,?\\s+[A-Z]{2}${END})?(?:,?\\s+${POSTCODE}${END})?`,
  'gu',
);
// Names never span a line break, or "By: Dana Reyes\nName: …" would swallow "Name".
const SP = '[^\\S\\r\\n]+';
// Dana, O'Connell, McKay, Smith-Jones, Ångström
const PERSON_WORD = "\\p{Lu}\\p{Ll}*(?:['’-]?\\p{Lu}?\\p{Ll}+)+";
// Lowercase surname particles: Eline de Vries, Jan van der Berg.
const PARTICLE = `(?:(?:de|del|der|den|van|von|da|di|du|la|le)${SP}){0,2}`;
const NEXT_PERSON_WORD = `${SP}${PARTICLE}${PERSON_WORD}`;
const TITLED_PERSON = new RegExp(`${START}(?:Mr|Mrs|Ms|Mx|Dr|Prof)\\.?${SP}${PERSON_WORD}(?:${NEXT_PERSON_WORD}){0,2}`, 'gu');
const SIGNATURE_NAME = new RegExp(
  `${START}(?:By|Name|Signed|Signature)[^\\S\\r\\n]*:[^\\S\\r\\n]*(${PERSON_WORD}(?:${SP}\\p{Lu}\\.)?(?:${NEXT_PERSON_WORD}){1,2})`,
  'dgu',
);
const PERSON_NAME = new RegExp(`^${PERSON_WORD}(?:${SP}\\p{Lu}\\.)?(?:${NEXT_PERSON_WORD}){1,2}$`, 'u');
const CAPITALIZED_PHRASE = new RegExp(`${START}${NAME_WORD}(?:${SP}(?:(?:of|and|&)${SP}|${PARTICLE})${NAME_WORD}){1,4}`, 'gu');
// Signature blocks often type names in capitals on a line of their own: "JOHN SMITH".
const SIGNATURE_BLOCK = /\b(?:By|Name|Signed|Signature|Witness)\s*:|\bIN WITNESS WHEREOF\b|\/s\/|_{3,}/;
const CAPITALS_LINE = new RegExp(`^[^\\S\\r\\n]*(\\p{Lu}{2,}(?:['’-]\\p{Lu}+)*(?:${SP}\\p{Lu}{2,}(?:['’-]\\p{Lu}+)*){1,3})[^\\S\\r\\n]*$`, 'dgmu');
// A reference to part of the contract, such as "Exhibit A" or "Schedule 2". It names no one, the cloud needs it,
// and the "A." in "Exhibit A. Adebayo will report…" ends a sentence; it is not a middle initial.
const REFERENCE_WORDS = 'Exhibit|Schedule|Appendix|Annex|Attachment|Addendum|Rider|Section|Article|Clause|Part|Item|Form|Table|Paragraph';
const REFERENCE = new RegExp(`\\b(?:${REFERENCE_WORDS})s?${SP}(?:[A-Z]{1,3}|\\d+(?:\\.\\d+)*)\\b\\.?`, 'g');
// Capitalized phrases that are job titles or jurisdictions. They identify no one, and the cloud model needs them.
const JOB_TITLE = new RegExp(
  '^(?:Head|VP|Director|Chief) of\\s|\\b(?:Officer|Counsel|Engineer|Director|Manager|President|Secretary|Treasurer|Analyst|Designer|Developer|Architect|Scientist|Accountant|Attorney)s?$',
);
const JURISDICTION =
  /^(?:(?:State|Commonwealth|Province|Republic|District) of\s.+|United States(?: of America)?|United Kingdom|European Union|United Arab Emirates|New Zealand|South Africa|Hong Kong|New (?:York|Jersey|Mexico|Hampshire)|(?:North|South) (?:Carolina|Dakota)|West Virginia|Rhode Island)$/;
// The short form a contract defines for a name: Northwind Analytics, Inc. ("Northwind").
const DEFINED_TERM = /\(\s*(?:the\s+)?["“]([^"”\n]{2,60})["”]\s*\)/g;

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
  return words.length === 0 || words.every((w) => LEGAL_WORDS.has(w) || (w.endsWith('s') && LEGAL_WORDS.has(w.slice(0, -1))));
}

/** "Oregon" or "the United States": places that set the law of a contract and identify no one. */
export function isJurisdiction(value: string): boolean {
  return JURISDICTION.test(value.trim());
}

const PLACE_BEFORE = /\b(?:laws?|courts?|state|commonwealth|province|republic|district|county) of(?: the)?\s+$/i;
const INCORPORATED_BEFORE = /\ban?\s+$/i;
const INCORPORATED_AFTER = /^\s+(?:corporation|company|limited liability company|limited partnership|partnership|LLC)\b/i;

/** Whether every mention of `value` is a place of law, as in "the laws of the Netherlands" or "a Delaware corporation". */
export function isOnlyPlaceOfLaw(text: string, value: string): boolean {
  const escaped = value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const mentions = [...text.matchAll(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'giu'))];
  return (
    mentions.length > 0 &&
    mentions.every((m) => {
      const before = text.slice(0, m.index);
      const after = text.slice(m.index + m[0].length);
      return PLACE_BEFORE.test(before) || (INCORPORATED_BEFORE.test(before) && INCORPORATED_AFTER.test(after));
    })
  );
}

const HEADING_BEFORE =/(?:^|\n)[^\S\n]*\d+(?:\.\d+)*\.?[^\S\n]+$/;
const HEADING_AFTER = /^[^\S\n]*[.:]/;

/** Whether `value` is the title of a numbered section, as "Service Levels" is in "3. Service Levels. Provider will…". */
export function isSectionHeading(text: string, value: string): boolean {
  const escaped = value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`(?:^|\\n)[^\\S\\n]*\\d+(?:\\.\\d+)*\\.?[^\\S\\n]+${escaped}[^\\S\\n]*[.:]`, 'i').test(text);
}

/**
 * A name the model reports without any contract reference stuck to it: "Exhibit A. Adebayo" becomes "Adebayo",
 * and so does "A. Adebayo" where every "A." it starts with is the label of an "Exhibit A" in `text`.
 * A real middle initial, as in "Jane Q. Doe", is left alone.
 */
export function stripReference(text: string, value: string): string {
  const leading = new RegExp(`^(?:${REFERENCE_WORDS})s?${SP}(?:[A-Z]{1,3}|\\d+(?:\\.\\d+)*)\\b\\.?${SP}`).exec(value);
  if (leading) return value.slice(leading[0].length);
  const initial = new RegExp(`^[A-Z]\\.${SP}`).exec(value);
  if (!initial) return value;
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const mentions = [...text.matchAll(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}`, 'gu'))];
  const afterReference = (index: number) => new RegExp(`\\b(?:${REFERENCE_WORDS})s?${SP}$`).test(text.slice(0, index));
  return mentions.length > 0 && mentions.every((m) => afterReference(m.index)) ? value.slice(initial[0].length) : value;
}

function isHeadingSpan(text: string, span: Span): boolean {
  return HEADING_BEFORE.test(text.slice(0, span.start)) && HEADING_AFTER.test(text.slice(span.end));
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
 * capitalized phrase that isn't contract vocabulary, and names in capitals on their own line of a signature block.
 */
export function findNames(text: string, broad: boolean): Span[] {
  const spans = [
    ...collect(text, 'ORG', ORG),
    ...collect(text, 'PERSON', TITLED_PERSON),
    ...collect(text, 'PERSON', SIGNATURE_NAME, 1),
    ...collect(text, 'ADDRESS', STREET_ADDRESS),
  ];
  if (broad && SIGNATURE_BLOCK.test(text)) {
    // A company in capitals is already an ORG, and a heading such as "GOVERNING LAW" is vocabulary.
    spans.push(...collect(text, 'PERSON', CAPITALS_LINE, 1).filter((s) => stripOrgSuffix(s.value) === s.value));
  }
  if (broad) {
    // References are blanked out first, with the same length, so a phrase can't run through one and positions still match.
    const withoutReferences = text.replace(REFERENCE, (ref) => '\n'.repeat(ref.length));
    spans.push(
      ...collect(withoutReferences, 'NAME', CAPITALIZED_PHRASE)
        .map((s) => ({ ...s, value: text.slice(s.start, s.end) }))
        .filter((s) => s.value !== s.value.toUpperCase() && !isHeadingSpan(text, s)),
    );
  }
  return spans
    .map((s) => trimLeadingArticle(text, s))
    .filter((s) => !isGeneric(stripOrgSuffix(s.value)))
    .filter((s) => s.kind !== 'NAME' || !(JOB_TITLE.test(s.value) || JURISDICTION.test(s.value)));
}

/** Whether a capitalized phrase is shaped like a person's name, such as "Jane Q. Smith" or "Eline de Vries". */
export function looksLikePersonName(value: string): boolean {
  return PERSON_NAME.test(value.trim());
}

/** Quoted defined terms, such as "Northwind" in `("Northwind")`. Most are roles ("Client"); mask.ts keeps only short forms of a found name. */
export function findDefinedTerms(text: string): string[] {
  return [...text.matchAll(DEFINED_TERM)].map((m) => m[1]!.trim());
}

// Words a capitalized match can pick up in front of a name: "This Lease", or "For" in a signature block's
// "For Halcyon Cloud Systems GmbH:". Never part of the name itself.
const LEADING_WORDS = /^(?:(?:The|This|For|By|From|Between|Dear)|(?:THE|THIS|FOR|BY|FROM|BETWEEN|DEAR))\s+/;

function trimLeadingArticle(text: string, span: Span): Span {
  const lead = LEADING_WORDS.exec(span.value);
  if (!lead) return span;
  const start = span.start + lead[0].length;
  return { ...span, start, value: text.slice(start, span.end) };
}
