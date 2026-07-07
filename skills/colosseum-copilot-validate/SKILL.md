---
name: colosseum-copilot-validate
version: 2.0.0
description: |
  Re-check HYPOTHESIS.md or a dossier against fresh Copilot corpus queries and append
  validation or monitoring diffs. Use when the user says "validate", "re-check my thesis",
  "daily check", "diff this", "track the assumptions", "monitor this deal", "refresh this
  dossier", or "/validate".
---

# Colosseum Copilot Validate

Use `/validate` as the daily-driver loop. It reads falsifiable assumptions in `## Wedge`,
runs fresh queries, and appends dated entries to `## Validation Log`. It never rewrites
history.

## Modes

- Founder mode: re-check falsifiable assumptions in `HYPOTHESIS.md` and append dated
  diffs to `## Validation Log`.
- Researcher mode: monitor `dossiers/<subject-slug>.md` like a deal or market watchlist.
  Diff the subject, competitors, status signals, risks, and open questions against fresh
  corpus evidence, then append dated entries to `## Watch Log`. Do not write
  `HYPOTHESIS.md`.

## Required References

Read before acting:

- `../colosseum-copilot/references/request-conventions.md`
- `../colosseum-copilot/references/artifact-contract.md`
- `../colosseum-copilot/references/api-reference.md`

Use workflow short name `validate` in the User-Agent.

## Reads and Writes

Read:

- Founder mode: `HYPOTHESIS.md`, especially `Wedge`, `Risk Register`, `Tooling`,
  `Validation Log`, and `Open Questions`.
- Researcher mode: `dossiers/<subject-slug>.md`, especially `Subject`, `Competitive
  Position`, `Status Signals`, `Risks & Open Questions`, `Evidence Log`, and `Watch Log`.
- Prior `.copilot/validation/` entries when present.

Write:

- Founder mode: append to `Validation Log`; never edit old entries.
- Researcher mode: append to `Watch Log`; never edit old entries.
- Append dated risk updates to `Risk Register` or `Risks & Open Questions` if evidence
  changed.
- Append a compact run stamp to `Evidence Log`.
- Write detailed diffs to `.copilot/validation/YYYY-MM-DD-<space-slug>.md`.

## Workflow

1. Run auth preflight.
2. Founder mode: extract falsifiable assumptions from `## Wedge`. If none exist, stop and
   recommend `/wedge`. Researcher mode: extract monitored subjects, competitors, status
   signals, risks, and open questions from the dossier. If the dossier is too thin to
   monitor, stop and recommend `/vet <subject>` to deepen it.
3. Fetch filters for canonical hackathon chronology.

```bash
curl -sS "$COLOSSEUM_COPILOT_API_BASE/filters" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/validate"
```

4. For each assumption, monitored subject, competitor, risk, or open question, run a
   fresh project search. Compare result slugs, hackathon dates, tags, and facets against
   the last validation/watch entry or the original Evidence Log.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/validate" \
  -d '{
    "query": "<falsifiable assumption rewritten as a search>",
    "limit": 15,
    "includeFacets": true,
    "facets": ["problemTags", "solutionTags", "techStack", "clusters", "hackathons", "lenses"],
    "facetTopK": 10,
    "filters": { "winnersOnly": false, "acceleratorOnly": false }
  }'
```

5. Run an archive search for assumptions or dossier questions about primitives, risk,
   regulation, security, status, market structure, or why-now.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/archives" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/validate" \
  -d '{
    "query": "<3-6 keyword assumption or risk>",
    "limit": 5,
    "maxChunksPerDoc": 1
  }'
```

6. Use `/analyze` and `/compare` to check category momentum across hackathons. The API
   does not filter by date directly; use `hackathon.startDate` from `/filters` and result
   objects to compute the diff locally.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/analyze" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/validate" \
  -d '{
    "cohort": { "hackathons": ["<recent-hackathon-1>", "<recent-hackathon-2>"] },
    "dimensions": ["problemTags", "solutionTags", "techStack", "clusters", "thesisLenses"],
    "topK": 8,
    "samplePerBucket": 2
  }'
```

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/compare" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/validate" \
  -d '{
    "cohortA": { "hackathons": ["<newer-hackathon>"] },
    "cohortB": { "hackathons": ["<older-hackathon>"] },
    "dimensions": ["problemTags", "solutionTags", "techStack", "clusters", "thesisLenses"],
    "topK": 8
  }'
```

7. In founder mode, append a dated `Validation Log` entry:

```markdown
### YYYY-MM-DD - colosseum-copilot-validate v2.0.0

- Assumption checked: <text>
- Diff: <new entrants, disappeared signals, tag/cluster momentum, or no material change>
- Evidence: <project slugs, archive document IDs, analysis cohorts>
- Status: <strengthened | weakened | unchanged | open>
- Next test: <query or workflow>
```

In researcher mode, append a dated `Watch Log` entry:

```markdown
### YYYY-MM-DD - colosseum-copilot-validate v2.0.0

- Subject monitored: <subject or space>
- Diff: <new entrants, changed status signal, competitor shift, archive signal, or no material change>
- Evidence: <project slugs, archive document IDs, analysis cohorts, public URLs>
- Status: <strengthened | weakened | unchanged | open>
- Next check: <query or workflow>
```

8. Update `Risk Register` or `Risks & Open Questions` only by adding dated notes. Do not
   delete old risks, old validation results, or old watch entries.

## Failure Modes

- Missing PAT or 401: stop and point to `https://docs.colosseum.com/copilot`.
- Missing `HYPOTHESIS.md` in founder mode: stop and recommend `/vet`.
- Missing dossier in researcher mode: stop and recommend `/vet <subject>`.
- No falsifiable assumptions in founder mode: stop and recommend `/wedge`.
- Thin dossier monitoring targets in researcher mode: stop and recommend `/vet <subject>`.
- Fresh searches are empty: broaden once, then note the thin coverage and list the attempted
  queries.
- API unavailable: stop; do not append a validation conclusion.
- Evidence contradicts prior belief: preserve the old entry and append the new diff.

## Example Prompts

- `/validate`
- `Re-check my thesis against fresh project data`
- `Run the daily validation loop for the Wedge assumptions`
- `Refresh this dossier and append a watch-log entry`
- `Monitor this deal against new entrants and status signals`
