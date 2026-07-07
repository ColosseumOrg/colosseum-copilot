---
name: colosseum-copilot-wedge
version: 2.0.0
description: |
  Synthesize the differentiated wedge for a Solana or crypto startup hypothesis, or run
  whitespace analysis for an existing project or market dossier. Use when the user says
  "find the wedge", "what is my angle", "position this", "differentiate this", "why now",
  "where is the whitespace", "market whitespace", or "/wedge".
---

# Colosseum Copilot Wedge

Use `/wedge` after `/vet`, `/grill`, or `/precedents` to turn evidence into a falsifiable
positioning angle. The output is the `## Wedge` section that `/validate` will track.

## Modes

- Founder mode: synthesize the user's differentiated wedge in `HYPOTHESIS.md`: positioning,
  why-now, defensibility, and falsifiable assumptions.
- Researcher mode: only run when explicitly asked for whitespace, market openings, or moat
  analysis. Write whitespace analysis into `dossiers/<subject-slug>.md`: where the market
  is open, who the subject would have to beat, and how strong the subject's moat appears.
  Do not write a founder-style `## Wedge` or `HYPOTHESIS.md`.

## Required References

Read before acting:

- `../colosseum-copilot/references/request-conventions.md`
- `../colosseum-copilot/references/artifact-contract.md`
- `../colosseum-copilot/references/api-reference.md`
- `../colosseum-copilot/references/workflow-deep.md` for the Grid ecosystem check (section 2e)

Use workflow short name `wedge` in the User-Agent.

## Reads and Writes

Read:

- Founder mode: `HYPOTHESIS.md`, especially `Thesis Placement`, `Competitive Field`,
  `Risk Register`, and `Open Questions`.
- Researcher mode: `dossiers/<subject-slug>.md`, especially `Their Thesis`,
  `Competitive Position`, `Precedents & Incumbents`, `Status Signals`, and
  `Risks & Open Questions`.

Write:

- Founder mode: `Wedge`: positioning, why-now, defensibility, and falsifiable assumptions.
- Researcher mode: `Competitive Position` and `Risks & Open Questions`: whitespace map,
  incumbents to beat, moat assessment, and falsifiable diligence questions.
- Founder mode: `Risk Register`: wedge-specific risks and evidence gaps.
- `Evidence Log`: dated run stamp and citations.
- Optional `.copilot/runs/YYYY-MM-DDTHHMMSSZ-wedge.md`.

If no founder artifact exists, stop and recommend `/vet` unless the user provided enough
detail to create a minimal `HYPOTHESIS.md` shell. If no researcher dossier exists, stop
and recommend `/vet <subject>` to build the dossier first.

## Workflow

1. Run auth preflight.
2. Identify the candidate wedge or whitespace from the artifact: target segment,
   job-to-be-done, incumbent weakness, distribution channel, technical unlock, timing
   shift, market opening, or moat question.
3. Measure cluster and tag density with a focused project search.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/wedge" \
  -d '{
    "query": "<candidate wedge and target user>",
    "limit": 15,
    "includeFacets": true,
    "facets": ["problemTags", "solutionTags", "techStack", "clusters", "lenses"],
    "facetTopK": 10,
    "filters": { "winnersOnly": false, "acceleratorOnly": false }
  }'
```

4. Fetch the most relevant cluster. Use a `thesis-<slug>` key when filters expose one for
   the space; otherwise use the strongest `v<N>-c<N>` key.

```bash
curl -sS "$COLOSSEUM_COPILOT_API_BASE/clusters/thesis-<slug>" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/wedge"
```

5. Compare winners vs. all projects for the relevant cohort to find where high-signal
   teams clustered and where the proposed segment is underexplored.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/compare" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/wedge" \
  -d '{
    "cohortA": { "hackathons": ["<relevant-hackathon>"], "winnersOnly": true },
    "cohortB": { "hackathons": ["<relevant-hackathon>"], "winnersOnly": false },
    "dimensions": ["problemTags", "solutionTags", "techStack", "clusters", "thesisLenses"],
    "topK": 8
  }'
```

6. Search archives for why-now evidence: protocol changes, market-structure shifts,
   new primitives, security lessons, or adoption patterns.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/archives" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/wedge" \
  -d '{
    "query": "<3-6 keyword why-now primitive>",
    "limit": 5,
    "maxChunksPerDoc": 2
  }'
```

7. Check direct incumbent overlap with accelerator and winners searches AND the Grid
   ecosystem check (`../colosseum-copilot/references/workflow-deep.md`, section 2e)
   before claiming a segment is open — an uncrowded hackathon corpus does not mean an
   uncrowded market. Use Grid product counts as the saturation signal and cite the
   established players a wedge must route around. If the Grid endpoint is unreachable, record the missing incumbent layer as an explicit gap in the artifact and continue — do not stall and do not silently skip the check.

8. In founder mode, write `## Wedge` in this structure:

```markdown
### Positioning
- For <target user>, <product> is <category> that solves <urgent job> by <mechanism>.
- Unlike <incumbent or common approach>, it wins by <specific wedge>.

### Why Now
- <Evidence-backed timing shift with citation>

### Defensibility
- <Distribution, data, liquidity, integration, compliance, or workflow advantage with citation>

### Falsifiable Assumptions
- [ ] <assumption that /validate can query again>
- [ ] <assumption that can be refuted by new entrants, archive evidence, or tag shifts>
```

In researcher mode, write the same evidence into dossier framing:

```markdown
### Whitespace Analysis
- Open sub-spaces: <where the market appears under-served, with citations>
- Incumbents to beat: <projects, protocols, or products, with citations>
- Subject moat: <defensibility evidence and gaps>
- Diligence questions: <falsifiable questions for /validate or /radar>
```

## Failure Modes

- Missing PAT or 401: stop and point to `https://docs.colosseum.com/copilot`.
- Missing competitive field or dossier competitive position: recommend `/vet` or
  `/precedents` first.
- Wedge rests on absence of evidence: mark the assumption as falsifiable instead of
  asserting it.
- No cluster match: use tags and project searches, then note that cluster evidence is thin.
- Empty result sets: broaden once; if still empty, say the corpus has little coverage here.
- API unavailable: stop before updating `Wedge`.

## Example Prompts

- `/wedge`
- `Find the wedge for this hypothesis`
- `Position this stablecoin payroll product against existing wallet and payments projects`
- `Where is the whitespace around this dossier subject?`
