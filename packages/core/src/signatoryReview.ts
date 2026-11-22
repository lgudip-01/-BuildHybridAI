import type { CleanText } from './types';

export const SIGNATORY_REVIEW_FORMAT_VERSION = 'source-quoted-signatory-v1';
export const SIGNATORY_REVIEW_QUESTIONS = [
  'Are the printed identities, roles and any dates correct?',
  'What records confirm signing status and authority?',
] as const;

const IDENTITY = String.raw`\[(?:PARTY|PERSON|ORG|NAME)_[A-Z0-9]+\]`;
const TOKEN_LINE = new RegExp(`^${IDENTITY}$`);
const BY_LINE = new RegExp(`^By:\\s*${IDENTITY}(?:,\\s*(.+))?$`, 'i');
const FOR_LINE = new RegExp(`^For\\s+${IDENTITY}:\\s*${IDENTITY}(?:,\\s*(.+))?$`, 'i');
const NAMED_CAPACITY_LINE = new RegExp(`^(?:Name|By):\\s*${IDENTITY},\\s*(.+?)(?:,\\s*${IDENTITY})?$`, 'i');
const CAPACITY_ORG_LINE = new RegExp(`^(.+),\\s*${IDENTITY}$`);
const ROLE_LINE = new RegExp(`^(?:Landlord|Tenant|Borrower|Lender|Guarantor|Contractor|Client|Employee|Employer|Accepted|Name):\\s*${IDENTITY}$`, 'i');
const DETAIL_LINE = /^(?:Date|Signed on):\s*\[DATE_[A-Z0-9]+\]$|^(?:SSN|Employee ID|ID|\[NAME_[A-Z0-9]+\]):\s*\[(?:ACCOUNT|NAME)_[A-Z0-9]+\]$/i;
const HEADING = /^(?:CONTRACTOR|CLIENT|LANDLORD|TENANT|BORROWER|LENDER|GUARANTOR|EMPLOYEE|EMPLOYER|SINCERELY,?)$/i;
const CAPACITY = /^(?:Title|Capacity|Position|Role):\s*(.+)$/i;
// Positive capacity vocabulary keeps sentences/unknown titles on the normal path.
const ROLE_WORDS = new Set(('chief executive operating financial technology technical information security legal officer ceo cfo coo cto cio ciso clo director managing manager general counsel head of the and vice president vp senior junior assistant associate deputy interim acting regional global group co founder owner partner member board authorized representative agent trustee individual contractor employee borrower lender guarantor client employer landlord tenant product engineering operations finance sales marketing research development').split(' '));
const roleText = (value: string) => /^[A-Za-z][A-Za-z &/.-]{0,79}$/.test(value) &&
  value.split(/[\s&/.-]+/).filter(Boolean).every(word => ROLE_WORDS.has(word.toLowerCase()));

/** A bounded field grammar, not a sentence/sample matcher or signature verifier.
 * Unknown/operative text keeps the ordinary analyzer. Only approved masked text
 * is quoted; this helper never receives a vault or original replacement values.
 */
export function sourceQuotedSignatoryReview(source: CleanText): string | undefined {
  if (source.length > 1800 || (source.match(/\[[^\]\r\n]*\]/g) ?? []).some(token =>
      !/^\[(?:PARTY|PERSON|ORG|NAME|ACCOUNT|DATE)_[A-Z0-9]+\]$/.test(token))) return;
  const lines = source.trim().split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!lines.length || lines.length > 12) return;
  let identified = false;
  for (const line of lines) {
    const signatory = line.match(NAMED_CAPACITY_LINE) ?? line.match(BY_LINE) ?? line.match(FOR_LINE);
    if (signatory) {
      if (signatory[1] && !roleText(signatory[1])) return;
      identified = true;
    } else if (ROLE_LINE.test(line)) {
      identified = true;
    } else if (TOKEN_LINE.test(line) || HEADING.test(line) || DETAIL_LINE.test(line)) {
      continue;
    } else {
      const capacity = line.match(CAPACITY);
      const capacityAndEntity = line.match(CAPACITY_ORG_LINE);
      if (capacityAndEntity) {
        if (!roleText(capacityAndEntity[1]!)) return;
        identified = true;
      } else if (!capacity || !roleText(capacity[1]!)) return;
    }
  }
  if (!identified) return;
  return `Source-based signatory and identification review. The supplied block lists:\n${source}\n\n` +
    'Verify the printed identities, roles and signing status against the full document. ' +
    'This text alone is not evidence of a completed act or authority. The risk rating is a preliminary review priority.';
}
