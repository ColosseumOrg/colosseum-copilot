# Artifact Contract

All Colosseum Copilot workflows are stateful through files in the user's repository. The
backend remains read-only for workflow state.

## Artifact Modes

Colosseum Copilot has two persistent artifact families:

- Founder artifacts for the user's own startup hypothesis.
- Researcher dossiers for existing projects, companies, categories, markets, or spaces.

Keep them separate. Researcher runs never write `HYPOTHESIS.md`. Founder runs never
write `dossiers/` unless the user explicitly asks to scout, compare, map, or build a
dossier.

## Primary Founder Artifact

`HYPOTHESIS.md` lives at the user's repository root. It is the human-facing artifact every
founder workflow reads and sharpens.

Use these sections exactly and keep them in this order:

```markdown
# HYPOTHESIS

## Hypothesis

## Thesis Placement

## Competitive Field

## Evidence Log

## Risk Register

## Wedge

## Design Constraints

## Tooling

## Validation Log

## Open Questions
```

Section intent:

- `Hypothesis`: the startup idea, target user, core job-to-be-done, and current scope.
- `Thesis Placement`: descriptive landscape placement using clusters, tags, hackathon
  cohorts, and archive themes. Do not frame this as an investment thesis.
- `Competitive Field`: related builder projects, active incumbents, adjacent approaches,
  and respectful notes when public signals suggest a project went quiet.
- `Evidence Log`: dated run stamps, corpus facts relied on, project slugs, archive
  document IDs, cluster keys, and request summaries.
- `Risk Register`: market, technical, regulatory, distribution, ecosystem, and evidence
  risks with status labels.
- `Wedge`: positioning statement, why-now, defensibility, and falsifiable assumptions.
- `Design Constraints`: protocol, security, product, data, UX, and operational constraints
  grounded in projects and archive documents.
- `Tooling`: recommended tools, SDKs, APIs, infrastructure, why they fit, and concrete
  first integration moves.
- `Validation Log`: dated diffs against Wedge assumptions. Append only; never rewrite
  history.
- `Open Questions`: unresolved questions with the next evidence query or workflow.

## Researcher Dossiers

Researcher mode writes one dossier per subject at:

```text
dossiers/<subject-slug>.md
```

The dossier is visible at the repository root because it is the researcher's product.
Use a stable lowercase slug derived from the project, company, category, market, or
space name. Do not reuse a founder `HYPOTHESIS.md` for a researcher run.

Use these sections exactly and keep them in this order:

```markdown
# Dossier: <Subject>

## Subject

## Their Thesis

## Competitive Position

## Precedents & Incumbents

## Status Signals

## Risks & Open Questions

## Evidence Log

## Watch Log
```

Section intent:

- `Subject`: the project, company, category, market, or space being studied; include
  canonical names, slugs, links, hackathon/cohort context, and what is in scope.
- `Their Thesis`: the subject's apparent strategy, target user, job-to-be-done,
  mechanism, and why-now logic. Frame this as their thesis, not the user's.
- `Competitive Position`: nearby projects, incumbents, market map, cluster/tag context,
  and how the subject appears positioned.
- `Precedents & Incumbents`: direct attempts, adjacent attempts, infrastructure
  precedents, and respectful inactivity or unknown-status notes when evidence supports
  them.
- `Status Signals`: current public status, repo/product/social signals when checked,
  hackathon or accelerator status, and what remains unverified.
- `Risks & Open Questions`: market, technical, regulatory, distribution, ecosystem,
  evidence, moat, and diligence risks with status labels.
- `Evidence Log`: dated run stamps, corpus facts relied on, project slugs, archive
  document IDs, cluster keys, public URLs, and request summaries.
- `Watch Log`: dated monitoring diffs. Append only; never rewrite history.

## Run Stamp

Every workflow run must stamp the artifact it writes. For `HYPOTHESIS.md` and
`dossiers/<subject-slug>.md`, append the stamp under the section the workflow updates,
and always add a compact entry to `## Evidence Log`.

Run stamp format:

```markdown
### YYYY-MM-DD - colosseum-copilot-<workflow> v2.0.0

- Corpus facts: <project counts, hackathons covered, archive result counts, cluster keys>
- Requests: <endpoint + compact request body summaries>
- Citations: <project slugs, archive document IDs, cluster keys>
```

Use the current local date. If the runtime knows a timestamp, write full ISO timestamps in
`.copilot/` metadata and date-only stamps in `HYPOTHESIS.md` or dossier files.

## Other State

Put all non-primary state under `.copilot/` in the user's repository:

```text
.copilot/
  runs/
    YYYY-MM-DDTHHMMSSZ-<workflow>.md
  radar/
    <space-slug>.md
  validation/
    YYYY-MM-DD-<space-slug>.md
```

Use `.copilot/runs/` for request summaries that are too noisy for `HYPOTHESIS.md`.
Use `.copilot/radar/` for recurring space snapshots.
Use `.copilot/validation/` for detailed validation diffs. `HYPOTHESIS.md` should receive
the concise dated summary; dossier monitoring should receive the concise dated summary in
`## Watch Log`.

## Workspace Root

The artifact home is the repo root of the current working directory
(`git rev-parse --show-toplevel`). If the working directory is NOT inside a git
repository (for example, a home directory), do not guess and never write into an
unrelated repository — ask the user where their project workspace is (or offer to
create one) before the first write.

## Next Step

Every workflow answer and every updated artifact must end with:

```markdown
Next step: /<skill> - <one-sentence reason>
```

In the chat answer (not the artifact), the recommendation must say what the user will
GET from the next workflow and why it matters given the artifact's current state —
outcome first, assuming they have never heard of that workflow — followed by an offer
to run it now ("Want me to run it?") so they never have to retype it.

Recommended next steps:

Founder:

- Missing artifact or thin research base: `/vet`
- Claims need pressure testing: `/grill`
- Prior attempts are unclear: `/precedents`
- Differentiation is unclear: `/wedge`
- Design constraints are absent: `/blueprint`
- Tooling is absent: `/find-tools`
- Wedge assumptions need a fresh diff: `/validate`
- The user wants ongoing monitoring: `/radar`

Researcher:

- Missing dossier or thin subject research: `/vet <subject>` to build or deepen the
  dossier.
- Dossier claims need pressure testing: `/grill`.
- Dossier monitoring is stale or empty: `/validate`.
- The user wants broader space monitoring: `/radar`.
- Do not recommend `/wedge`, `/blueprint`, or `/find-tools` in researcher mode unless the
  user explicitly asks for whitespace analysis, build planning, or tool recommendations.

## Editing Rules

- Preserve user-written notes unless they are clearly obsolete and the workflow is
  replacing that exact section with cited evidence.
- Never delete `Validation Log` entries.
- Never delete `Watch Log` entries.
- In `/validate`, append history only; do not rewrite previous assumptions, old results,
  or old dossier monitoring entries.
- If evidence is thin, write that plainly and list the query tried.
- If the API is unavailable, stop before writing new conclusions.
- Never cross-contaminate artifacts: researcher runs write `dossiers/<subject-slug>.md`,
  founder runs write `HYPOTHESIS.md`, and shared `.copilot/` run notes must name the
  artifact they updated.
