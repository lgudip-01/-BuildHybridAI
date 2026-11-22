# Compatibility review: PRs #32 and #33

November 22, 2026. Scope: isolated combination of published #31/#34 code with
engine PR #32 at 3e90529 and import PR #33 at 1a6b334. No main, teammate branch,
deployed app or environment file was modified. No live model calls/deployment.

## Verified baseline

Both branches merged cleanly into a temporary LOCAL review branch based on
bbac120. Before adding review regressions, 320 web tests and 107 engine tests
passed (427 total), including all twelve PDF/DOCX fixtures and the six text
fixtures. Core typecheck and web production typecheck/build passed. The expanded
placeholder kinds compile with the analyzer/chat code; strict token validation
and fail-closed chat guard tests still pass.

After adding the review cases, a complete rerun reports 320 web passes plus four
expected failures, and 107 engine passes plus two expected failures (433 cases
total). Typecheck still passes. Thus all six failures are the new demonstrated
findings, not unrelated baseline breakage.

Dependencies were installed from the exact lockfile using the public npm registry,
without account credentials, install scripts, audit calls or billing. Parsing is
buffer-based, and the build emits the PDF worker locally. These code/build checks
are not an exhaustive browser-network/security audit or actual Nano acceptance.

## Findings to address before integration

### P1 — #32: contact substrings can suppress the intended model-only-name review

[mask.ts:53](https://github.com/lgudip-01/-BuildHybridAI/blob/3e90529/packages/privacy-engine/src/mask.ts#L53)
compares each model value with normalized substrings of ALL rule matches,
including email and URL patterns. A word occurring inside a masked contact
string does not mean rules can recognize that name independently.

Controlled reproduction (actual mask/leak-check pipeline, mocked model):

```text
c1: Contact: maria@example.com
c2: maria will sign; anna will witness.
model reports only the person maria
```

Observed: maria is masked, anna remains unmasked, result.ok is true, and
needsReview is false. The same result occurs with
`https://example.com/u/maria`. Both regression cases fail the required true
review flag. This is not a claim about a particular real Nano response; it
demonstrates the new heuristic's behavior under a controlled omission. Callers
relying on the flag lose the intended warning about model-dependent name coverage.

Requested correction: distinguish actual name/variant coverage from incidental
words inside another pattern. Preserve the intended no-warning behavior when
the model reports a complete email/domain/address already covered by a rule.

### P1 — #33: generic clause splitting silently deletes substantive numbers

[clauses.ts:37](https://github.com/lgudip-01/-BuildHybridAI/blob/1a6b334/apps/web/src/clauses.ts#L37)
applies PAGE_NUMBER globally; its optional labels also match any bare one-to-four
digit line. This splitter handles pasted text as well as imported documents.

```text
Monthly rent:
2150
payable on the first day.
```

Observed output loses 2150 entirely. Separate tests also lose a standalone
effective year 2026 and account suffix 1234. All three tests fail. These are
source values, not privacy replacements; deleting them before masking leaves
the analyzer with a materially incomplete contract.

Requested correction: preserve ambiguous bare numeric lines. Remove page
furniture only when explicit markers or reliable page-layout context identify
it; do not classify every numeric line in arbitrary contract text as a footer.

### P2 — #33: a slow import overwrites newer manual edits

[App.tsx:80](https://github.com/lgudip-01/-BuildHybridAI/blob/1a6b334/apps/web/src/App.tsx#L80)
awaits readDocument and then calls session.edit without a captured generation/
revision check. The textarea remains editable while importing.

Reproduction: start an unresolved file import, enter NEWER MANUAL CONTRACT,
then resolve the file as OLDER IMPORTED CONTRACT. The actual component event
handlers and real ReviewSession replace the newer text with the older import.
One focused test fails. The harness mocks React hooks and file reading to
control the race; it does not claim a full browser-render test.

Requested correction: make import completion conditional on its original
document/import generation, or consistently lock conflicting controls for the
whole import. A rejected/stale import should have an explicit outcome rather
than silently overwrite newer edits or disappear when masking starts.

## Reproduction artifact

[PR_COMPATIBILITY_REPROS.patch](PR_COMPATIBILITY_REPROS.patch) contains the exact
three new test files: two engine cases, three numeric-preservation cases, and
one component import-lifecycle case. Patch structure was checked against the
isolated checkout. Apply ONLY to a disposable checkout combining #31/#34/#32/#33:

```sh
git apply apps/web/PR_COMPATIBILITY_REPROS.patch
cd packages/privacy-engine
npx vitest run src/pr32.review.test.ts
cd ../../apps/web
npx vitest run src/pr33.review.test.ts src/pr33.lifecycle.review.test.tsx
```

Expected BEFORE corrections: six failures. These are deliberately failing
review cases, kept as a patch so they do not run against the disabled-chat
branch, which does not contain the import modules yet. Do not count them as
passing tests or merge them without the corresponding fixes.

Local evidence is preserved on codex/compat-engine-import-20261122-1257 at
4a81662, worktree `/private/tmp/clauseguard-review-pr32-pr33-20261122-1257`.
No production implementation changes were made during this review. Integration
approval remains blocked pending corrections/retests; existing fixture passes
alone do not close these findings.
