---
name: colosseum-copilot-vet
version: 2.0.0
description: |
  Vet a Solana or crypto startup idea, research an existing project or space, and create
  or refresh HYPOTHESIS.md or a dossier. Use when the user says "vet this idea", "deep
  dive", "research this hypothesis", "research this project", "build a dossier on",
  "is this worth building", "should I build this", or "/vet".
---

# Colosseum Copilot Vet

Use `/vet` for the rough-cut research pass. It turns an idea into the first useful
`HYPOTHESIS.md` artifact with thesis placement, competitive field, evidence log, risk
register, and open questions.

## Modes

- Founder mode: vet the user's startup idea and write `HYPOTHESIS.md`.
- Researcher mode: scout an existing project, company, category, market, or space and
  write or refresh `dossiers/<subject-slug>.md`. Frame the output as a dossier on the
  subject: what they appear to believe, how they are positioned, their status signals,
  risks, open questions, and evidence. Do not write `HYPOTHESIS.md` in researcher mode.

## Required References

Read before acting:

- `../colosseum-copilot/references/request-conventions.md`
- `../colosseum-copilot/references/artifact-contract.md`
- `../colosseum-copilot/references/api-reference.md`
- `../colosseum-copilot/references/workflow-deep.md` for deeper query tactics when needed

Use workflow short name `vet` in the User-Agent.

## Reads and Writes

Read:

- User's idea, project, company, category, market, or space from the prompt.
- Existing `HYPOTHESIS.md` in founder mode. Preserve `Validation Log` and user notes.
- Matching `dossiers/<subject-slug>.md` in researcher mode. Preserve `Watch Log` and user
  notes.

Write:

- Founder mode: `HYPOTHESIS.md` sections: `Hypothesis`, `Thesis Placement`,
  `Competitive Field`, `Evidence Log`, `Risk Register`, and `Open Questions`.
- Researcher mode: `dossiers/<subject-slug>.md` sections: `Subject`, `Their Thesis`,
  `Competitive Position`, `Precedents & Incumbents`, `Status Signals`,
  `Risks & Open Questions`, and `Evidence Log`.
- Optional `.copilot/runs/YYYY-MM-DDTHHMMSSZ-vet.md` with compact request summaries.

Every claim must cite project slugs, archive document IDs, cluster keys, or public URLs
inline. End the answer and artifact with `Next step:`.

## Workflow

1. Run the auth preflight from `request-conventions.md`. Stop on missing PAT, 401, or
   unreachable API.
2. Parse the prompt into target user, job-to-be-done, proposed mechanism, likely domain,
   and, in researcher mode, the dossier subject and subject type.
3. Fetch filters for valid hackathon dates, tags, and cluster keys.

```bash
curl -sS "$COLOSSEUM_COPILOT_API_BASE/filters" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/vet"
```

4. Run at least two distinct project searches on `/api/v1/search/projects`: one semantic
   rewrite and one problem-space rewrite. Include facets on the first pass.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/vet" \
  -d '{
    "query": "<semantic rewrite of the startup idea>",
    "limit": 12,
    "includeFacets": true,
    "facets": ["problemTags", "solutionTags", "techStack", "clusters", "lenses"],
    "facetTopK": 8,
    "filters": { "winnersOnly": false, "acceleratorOnly": false }
  }'
```

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/vet" \
  -d '{
    "query": "<underlying user pain or workflow problem>",
    "limit": 12,
    "filters": { "winnersOnly": false, "acceleratorOnly": false }
  }'
```

5. Run explicit winners and accelerator checks before saying a space is crowded or open.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/vet" \
  -d '{
    "query": "<semantic rewrite of the startup idea>",
    "limit": 10,
    "filters": { "winnersOnly": true }
  }'
```

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/vet" \
  -d '{
    "query": "<semantic rewrite of the startup idea>",
    "limit": 10,
    "filters": { "acceleratorOnly": true }
  }'
```

6. Fetch details for the top 2-3 relevant projects when the search snippets are not enough.

```bash
curl -sS "$COLOSSEUM_COPILOT_API_BASE/projects/by-slug/<project-slug>" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/vet"
```

7. Search archives twice: one conceptual query and one implementation query.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/archives" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/vet" \
  -d '{
    "query": "<3-6 keyword conceptual primitive>",
    "limit": 5,
    "maxChunksPerDoc": 1
  }'
```

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/archives" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/vet" \
  -d '{
    "query": "<3-6 keyword Solana or implementation-specific primitive>",
    "limit": 5,
    "maxChunksPerDoc": 1
  }'
```

8. Use `/analyze` for density and `/compare` for winner-vs-all contrast.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/analyze" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/vet" \
  -d '{
    "cohort": { "hackathons": ["<hackathon-slug-1>", "<hackathon-slug-2>"] },
    "dimensions": ["thesisLenses", "problemTags", "solutionTags", "techStack", "clusters"],
    "topK": 8,
    "samplePerBucket": 2
  }'
```

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/compare" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/vet" \
  -d '{
    "cohortA": { "hackathons": ["<hackathon-slug>"], "winnersOnly": true },
    "cohortB": { "hackathons": ["<hackathon-slug>"], "winnersOnly": false },
    "dimensions": ["problemTags", "solutionTags", "techStack", "clusters", "thesisLenses"],
    "topK": 8
  }'
```

9. If a relevant cluster key appears, fetch it. Prefer `thesis-<slug>` keys when filters
   expose them; otherwise use the `v<N>-c<N>` cluster key from results.

```bash
curl -sS "$COLOSSEUM_COPILOT_API_BASE/clusters/thesis-<slug>" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/vet"
```

10. Ecosystem check (The Grid): before making any crowdedness or "who else exists"
    claim, run the three-phase Grid check in
    `../colosseum-copilot/references/workflow-deep.md` (section 2e) — category search by
    `productType` slugs with Solana scoping, then the follow-up phases. This surfaces
    ESTABLISHED products the hackathon corpus cannot see. Cite Grid products by name and
    `urlMain` in `Competitive Field` alongside corpus slugs. If the Grid endpoint is unreachable, record the missing incumbent layer as an explicit gap in the artifact and continue — do not stall and do not silently skip the check.

11. **Premise challenge.** Before writing, test the user's framing itself against what
    you found. If the evidence contradicts a premise (the "underserved" segment is
    served, the "new" mechanism has five precedents, the "dead" category has live
    revenue), say so directly with the citations — challenging the frame is more
    valuable than researching inside a wrong one.
12. **Alternatives (mandatory in founder mode).** Generate at least one alternative
    framing of the idea — a different user, wedge, or mechanism the same evidence
    supports — and say in one line why the user's framing or the alternative is
    stronger. Vetting only the stated frame is confirmation, not research. Example:
    - BAD: "Your idea has several competitors but the space is still promising."
    - GOOD: "As framed (consumer privacy wallet), you're behind six funded teams —
      [A](link) and [B](link) most directly. The same evidence supports a stronger
      frame: the compliance-disclosure layer those six will all need; nobody in the
      corpus builds it. I'd vet that frame before committing."
13. Write the selected artifact with the exact sections in `artifact-contract.md`. Keep
    the first pass concise enough that later sub-skills can sharpen it.

## Synthesis Rules

- State confidence as evidence-based, not absolute.
- If searches stay sparse after broadening, say so plainly instead of padding the evidence.
- Include a dated run stamp in `Evidence Log` with corpus facts: hackathons covered,
  project result counts, archive result counts, cluster keys, and key request summaries.
- Add risks as questions when evidence is not enough to classify them.
- Recommend `/grill` as the natural next step unless the user explicitly asked for tools
  or build planning. In researcher mode, frame `/grill` as pressure-testing the dossier's
  investment thesis, status, moat, and risk claims.

## Failure Modes

- Missing PAT or 401: stop and point to `https://docs.colosseum.com/copilot`.
- Empty project results: broaden the query once, then say plainly that coverage is thin if still
  empty.
- Empty archive results: try synonyms or a broader primitive; do not invent archive
  support.
- API unreachable or repeated 5xx: stop and do not write new conclusions.
- Existing `HYPOTHESIS.md`: preserve `Validation Log`; do not erase prior dated evidence.
- Existing dossier: preserve `Watch Log`; do not erase prior dated evidence.

## Example Prompts

- `/vet privacy-preserving payroll for global contractors on Solana`
- `Vet this idea: a wallet-native chargeback layer for stablecoin payments`
- `Is it worth building an agent that monitors DAO treasury risk?`
- `Research this project: Senthos`
- `Build a dossier on Jito restaking competitors`
