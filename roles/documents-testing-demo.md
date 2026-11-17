# Documents, testing, and demo

**Owner:** Varun Akella

## What you build

The front of the pipeline (turning a file into clauses), the test contracts that prove masking works, and the submission itself.

1. **Text extraction:** PDF and DOCX into clean text, plus cleanup for text captured from a web page.
2. **Clause splitting:** break the text into `Clause[]` using headings and numbering.
3. **Sample set:** 5 to 10 public sample contracts, each with a list of every sensitive value that must be masked.
4. **Test runs:** run the full pipeline on the samples, report masking misses to the privacy engine, and track the results.
5. **Submission:** the 3-minute demo video, the Devpost write-up, and a final repo check.

## Tech stack

| Part | Tool |
| --- | --- |
| PDF | pdf.js |
| DOCX | mammoth.js |
| Splitting | TypeScript and regex (in `packages/core/src/documents/`) |
| Tests | Vitest |
| Samples | Free public standard agreements (for example, Common Paper and Bonterms), with made-up names and amounts filled in |
| Video | Any screen recorder, uploaded to YouTube as public |

## Architecture

```
PDF ──► pdf.js ────┐
DOCX ─► mammoth ───┼─► normalize (fix line breaks, page numbers, headers) ─► split ─► Clause[]
page text ─────────┘                                                         │
                                                                             ▼
                                                                    privacy engine

samples/
  nda-01.pdf
  nda-01.expected.json   ← every name, amount, and date that must be masked
```

**Splitting rules, in order:** numbered sections (`1.`, `1.1`, `Section 4`, `Article II`), then all-caps or bold headings, then paragraphs as a last resort.

## What teammates get from you

- `extract(file) → string` and `split(text) → Clause[]`
- The sample contracts and expected masks, which become the privacy engine's tests
- A short "masking misses" list after each test run

## Milestones

- **Nov 16:** PDF and DOCX extraction working, 3 samples collected
- **Nov 20:** clause splitter done, 5 to 10 samples with expected masks
- **Nov 25:** first full test run on all three platforms
- **Nov 28:** demo script and recording
- **Nov 29:** submit

## Demo video checklist (hackathon rules)

- [ ] 3 minutes or less, public on YouTube, in English
- [ ] Shows the app running on **web, Android, and iOS** (multi-platform gets strong consideration for the Grand Prize)
- [ ] Shows the on-device versus cloud behavior and the privacy ledger
- [ ] Shows a blocked send, which proves the leak check works
- [ ] Shows offline mode

## Submission checklist

- [ ] Public repo with the license visible in GitHub's About section
- [ ] README explains how Firebase AI Logic is used, the features, and the value
- [ ] Firebase AI Logic is imported and called in the code
- [ ] App Check is on (debug tokens are accepted)
- [ ] Hosted web app link, plus the extension and mobile builds if possible
- [ ] Platforms selected on Devpost

## Traps

- Scanned PDFs have no text layer. Detect that and tell the user, rather than failing silently.
- Never use a real signed contract with real people's details as a sample.
- Leave time to re-record. Plan to finish the video on Nov 28, not Nov 29.
