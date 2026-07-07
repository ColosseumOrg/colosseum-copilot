---
name: colosseum-copilot-radar
version: 2.0.0
description: |
  Watch a Solana or crypto thesis, category, or space for new entrants and momentum shifts.
  Use when the user says "radar", "watch this space", "track this thesis", "monitor
  entrants", "space snapshot", or "/radar".
---

# Colosseum Copilot Radar

Use `/radar` for one-shot or recurring snapshots of a space. It can work with or without
`HYPOTHESIS.md` or a dossier, but all radar state lives under `.copilot/radar/`.

## Modes

Mode-neutral: use the same radar workflow for founder and researcher contexts; only append
to `HYPOTHESIS.md` or a dossier when the watched space is explicitly tied to that artifact.

## Required References

Read before acting:

- `../colosseum-copilot/references/request-conventions.md`
- `../colosseum-copilot/references/artifact-contract.md`
- `../colosseum-copilot/references/api-reference.md`

Use workflow short name `radar` in the User-Agent.

## Reads and Writes

Read:

- The user's thesis, space, category, or cluster key.
- Existing `HYPOTHESIS.md` if present.
- Existing `dossiers/<subject-slug>.md` if present and the radar is tied to a dossier
  subject.
- Existing `.copilot/radar/<space-slug>.md` if present.

Write:

- `.copilot/radar/<space-slug>.md`: current snapshot and diff from previous snapshot.
- `HYPOTHESIS.md` `Evidence Log` or `Validation Log` only if the radar is tied to the
  current hypothesis.
- Dossier `Evidence Log` or `Watch Log` only if the radar is tied to the current dossier.

## Workflow

1. Run auth preflight.
2. Normalize the watched space into a slug and 2-3 query formulations.
3. Fetch filters for hackathon chronology, valid tags, and clusters.

```bash
curl -sS "$COLOSSEUM_COPILOT_API_BASE/filters" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/radar"
```

4. Search projects with facets for the watched space.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/radar" \
  -d '{
    "query": "<watched space>",
    "limit": 20,
    "includeFacets": true,
    "facets": ["hackathons", "problemTags", "solutionTags", "techStack", "clusters", "lenses"],
    "facetTopK": 12,
    "filters": { "winnersOnly": false, "acceleratorOnly": false }
  }'
```

5. If a cluster key is provided or emerges, fetch the cluster details.

```bash
curl -sS "$COLOSSEUM_COPILOT_API_BASE/clusters/<cluster-key>" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/radar"
```

6. Analyze recent and historical cohorts. Use `GET /filters` chronology; do not infer
   order from hackathon names.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/analyze" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/radar" \
  -d '{
    "cohort": { "hackathons": ["<hackathon-slug-1>", "<hackathon-slug-2>"] },
    "dimensions": ["problemTags", "solutionTags", "techStack", "clusters"],
    "topK": 10,
    "samplePerBucket": 2
  }'
```

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/compare" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/radar" \
  -d '{
    "cohortA": { "hackathons": ["<newer-hackathon>"] },
    "cohortB": { "hackathons": ["<older-hackathon>"] },
    "dimensions": ["problemTags", "solutionTags", "techStack", "clusters"],
    "topK": 10
  }'
```

7. Search archives for notable new or relevant conceptual additions.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/archives" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/radar" \
  -d '{
    "query": "<watched primitive or category>",
    "limit": 6,
    "maxChunksPerDoc": 1
  }'
```

8. Write `.copilot/radar/<space-slug>.md`:

```markdown
# Radar: <space>

## Latest Snapshot - YYYY-MM-DD
- Skill: colosseum-copilot-radar v2.0.0
- Corpus facts: <project counts, hackathons, cluster keys, archive counts>

## New Or Notable Entrants
- <project> (`slug`) - <why notable>

## Momentum
- <tag or cluster shift with cohort citation>

## Archive Signals
- <archive title> (`documentId`) - <why it matters>

## Diff From Previous Snapshot
- <new, changed, unchanged, or thin corpus>

Next step: /<skill> - <reason>
```

## Failure Modes

- Missing PAT or 401: stop and point to `https://docs.colosseum.com/copilot`.
- No watched space provided and no artifact: ask for the space to monitor.
- Empty project results: broaden once; if still empty, say the corpus has little coverage here.
- No previous radar file: write a baseline snapshot rather than a diff.
- API unavailable: stop before writing a new snapshot.

## Example Prompts

- `/radar privacy stablecoin payments`
- `Watch the DePIN infrastructure space`
- `Track new entrants around the cluster in HYPOTHESIS.md`
