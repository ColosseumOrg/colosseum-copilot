---
name: colosseum-copilot-precedents
version: 2.0.0
description: |
  Find prior art and precedent projects for a Solana or crypto startup idea, existing
  project, or market dossier. Use when the user says "precedents", "prior art", "has this
  been tried", "what failed before", "show me inactive attempts", or "/precedents".
---

# Colosseum Copilot Precedents

Use `/precedents` to understand what similar builders tried before and what can be learned
from them. Treat prior work respectfully. Say "went quiet", "no recent public signal
found", or "no longer active" only when evidence supports that phrasing.

## Modes

Mode-neutral: use the same precedent workflow for founder and researcher contexts; founder
runs write `HYPOTHESIS.md`, researcher runs write `dossiers/<subject-slug>.md`.

## Required References

Read before acting:

- `../colosseum-copilot/references/request-conventions.md`
- `../colosseum-copilot/references/artifact-contract.md`
- `../colosseum-copilot/references/api-reference.md`
- `../colosseum-copilot/references/workflow-deep.md` for the Grid ecosystem check (section 2e)

Use workflow short name `precedents` in the User-Agent.

## Reads and Writes

Read:

- Founder mode: `HYPOTHESIS.md`, especially `Hypothesis`, `Competitive Field`,
  `Risk Register`, and `Open Questions`.
- Researcher mode: `dossiers/<subject-slug>.md`, especially `Subject`, `Their Thesis`,
  `Competitive Position`, `Precedents & Incumbents`, and `Risks & Open Questions`.
- If no artifact exists, the user's idea or subject from the prompt.

Write:

- Founder mode: `Competitive Field` and `Risk Register`.
- Researcher mode: `Precedents & Incumbents` and `Risks & Open Questions`.
- Precedent clusters, similar projects, adjacent attempts, repeat failure modes, and
  respectful inactivity notes.
- `Evidence Log`: dated run stamp and citations.
- Optional `.copilot/runs/YYYY-MM-DDTHHMMSSZ-precedents.md`.

## Workflow

1. Run auth preflight.
2. Extract the core mechanism, target user, and alternatives from the artifact or prompt.
3. Run a broad similar-project search with diversity on, then a focused search with
   `diversify: false` to avoid missing near-duplicates.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/precedents" \
  -d '{
    "query": "<startup idea or mechanism>",
    "limit": 12,
    "filters": { "winnersOnly": false, "acceleratorOnly": false }
  }'
```

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/precedents" \
  -d '{
    "query": "<direct mechanism, category, or user workflow>",
    "limit": 20,
    "diversify": false,
    "includeFacets": true,
    "facets": ["problemTags", "solutionTags", "techStack", "clusters"],
    "facetTopK": 8,
    "filters": { "winnersOnly": false, "acceleratorOnly": false }
  }'
```

4. Run winners and accelerator-only searches to distinguish serious nearby attempts from
   one-off prototypes.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/precedents" \
  -d '{
    "query": "<same idea>",
    "limit": 10,
    "filters": { "winnersOnly": true }
  }'
```

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/precedents" \
  -d '{
    "query": "<same idea>",
    "limit": 10,
    "filters": { "acceleratorOnly": true }
  }'
```

5. Fetch details for projects that look directly relevant or historically instructive.

```bash
curl -sS "$COLOSSEUM_COPILOT_API_BASE/projects/by-slug/<project-slug>" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/precedents"
```

6. Search archives for older patterns, repeated failure modes, protocol constraints, and
   market-structure history.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/archives" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/precedents" \
  -d '{
    "query": "<3-6 keyword primitive plus failure mode>",
    "limit": 6,
    "maxChunksPerDoc": 1
  }'
```

7. Ecosystem check (The Grid): run the three-phase Grid check in
   `../colosseum-copilot/references/workflow-deep.md` (section 2e) to find ESTABLISHED
   incumbents in this space — products that never went through a hackathon and so are
   invisible to the corpus. Grid results feed `Infrastructure precedents` and
   `Adjacent attempts`; cite by product name and `urlMain`. If the Grid endpoint is unreachable, record the missing incumbent layer as an explicit gap in the artifact and continue — do not stall and do not silently skip the check.

8. If a project links to public pages and the runtime has web search or browsing, use only
   public signals to verify current status. Do not claim inactivity from corpus absence
   alone.

## Classification

Group precedents into:

- `Direct attempts`: same user and similar mechanism.
- `Adjacent attempts`: same user or mechanism, but different wedge.
- `Infrastructure precedents`: tools, protocols, or primitives the idea depends on.
- `Went quiet or no longer active`: only with cited public status evidence.
- `Unknown status`: enough similarity to study, but current status is unclear.

## Failure Modes

- Missing PAT or 401: stop and point to `https://docs.colosseum.com/copilot`.
- No artifact and no idea or subject: stop and recommend `/vet`.
- No direct precedents: say so plainly and list adjacent attempts instead.
- No status evidence: use `Unknown status`, not "inactive".
- API unavailable: stop before writing precedent conclusions.

## Example Prompts

- `/precedents`
- `Has this been tried before: decentralized chargebacks for stablecoin commerce?`
- `Find prior art and gone-quiet attempts around privacy-preserving DeFi analytics`
- `Find precedents for this dossier subject`
