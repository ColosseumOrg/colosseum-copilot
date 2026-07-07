---
name: colosseum-copilot-blueprint
version: 2.0.0
description: |
  Create a high-level build blueprint and design constraints for a Solana or crypto startup
  hypothesis. Use when the user says "blueprint this", "architecture", "design constraints",
  "how should I build it", "system design", or "/blueprint".
---

# Colosseum Copilot Blueprint

Use `/blueprint` to turn a researched wedge into a buildable high-level plan. The skill
does not produce legal, financial, or investment advice. Tokenomics belongs only as a
design-constraints subsection about incentives, abuse risks, utility, and unanswered
compliance questions.

## Modes

Founder-leaning: offer `/blueprint` automatically only in founder mode after a researched
wedge exists. In researcher mode, run it only when the user explicitly asks for build
planning or buildability analysis; do not recommend it as the next step for a dossier, and
do not create or update `HYPOTHESIS.md` from a researcher request.

## Required References

Read before acting:

- `../colosseum-copilot/references/request-conventions.md`
- `../colosseum-copilot/references/artifact-contract.md`
- `../colosseum-copilot/references/api-reference.md`

Use workflow short name `blueprint` in the User-Agent.

## Reads and Writes

Read:

- Founder mode: `HYPOTHESIS.md`, especially `Wedge`, `Competitive Field`,
  `Risk Register`, and `Open Questions`.
- Researcher mode, only when explicitly requested: the matching dossier or the user's
  buildability question.

Write:

- Founder mode: `Design Constraints`: product, protocol, security, data, UX, operations,
  and tokenomics constraints.
- Founder mode: `Risk Register`: implementation risks discovered during blueprinting.
- Researcher mode: answer conversationally unless the user explicitly asks to annotate the
  dossier; if annotating, append buildability notes to `Risks & Open Questions` and
  `Evidence Log`, never to `HYPOTHESIS.md`.
- `Evidence Log`: dated run stamp and citations.
- Optional `.copilot/runs/YYYY-MM-DDTHHMMSSZ-blueprint.md`.

## Workflow

1. Run auth preflight.
2. Extract the target workflow, onchain surfaces, offchain services, user roles, and
   assumptions from `HYPOTHESIS.md`.
3. Search similar projects and include tech-stack facets.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/blueprint" \
  -d '{
    "query": "<wedge plus core mechanism>",
    "limit": 12,
    "includeFacets": true,
    "facets": ["techStack", "primitives", "solutionTags", "problemTags"],
    "facetTopK": 10,
    "filters": { "winnersOnly": false, "acceleratorOnly": false }
  }'
```

4. Fetch details for 2-3 nearby projects whose stack or architecture is informative.

```bash
curl -sS "$COLOSSEUM_COPILOT_API_BASE/projects/by-slug/<project-slug>" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/blueprint"
```

5. Search archives for protocol docs, implementation constraints, security failures, and
   relevant primitives.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/archives" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/blueprint" \
  -d '{
    "query": "<protocol or primitive> security implementation constraints",
    "limit": 6,
    "maxChunksPerDoc": 2
  }'
```

6. If the blueprint depends on a landscape cluster, fetch its representative projects.

```bash
curl -sS "$COLOSSEUM_COPILOT_API_BASE/clusters/<cluster-key>" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/blueprint"
```

7. Write `## Design Constraints` with these subsections:

- `User Workflow`: the minimum end-to-end path and the role of each actor.
- `Onchain Surface`: programs, accounts, assets, permissions, settlement, custody, or
  proofs that must exist.
- `Offchain Surface`: indexing, risk engines, notifications, dashboards, key management,
  and data retention.
- `Security Constraints`: failure modes, authority boundaries, abuse vectors, and audit
  questions.
- `Data And Privacy Constraints`: what must be public, private, retained, or verifiable.
- `Tokenomics Constraints`: only if relevant; state that this is not financial or legal
  advice. Cover utility, incentive loops, abuse risks, governance, and unanswered
  compliance questions.
- `MVP Cutline`: what to build first and what to defer.

## Output Rules

- Do not prescribe token price, allocations, securities treatment, or fundraising terms.
- Cite stack precedents and protocol/security constraints per the Citation Standard in
  `references/request-conventions.md`: linked project names and archive titles in prose,
  slugs and document IDs in the artifact Evidence Log.
- Prefer constraints over implementation fantasy. If an architecture element is not
  supported by evidence, mark it as an open design question.
- Normal next step is `/find-tools`.

## Failure Modes

- Missing PAT or 401: stop and point to `https://docs.colosseum.com/copilot`.
- Missing `Wedge`: recommend `/wedge` before blueprinting.
- Thin protocol evidence: write the constraint as an open question and cite attempted
  searches.
- Empty result sets: broaden once; if still empty, say the corpus has little coverage here.
- API unavailable: stop before writing design conclusions.
- User asks for financial/legal advice: decline that part and provide technical design
  constraints only.

## Example Prompts

- `/blueprint`
- `Blueprint the architecture for the wedge in HYPOTHESIS.md`
- `What design constraints should I account for before building this private DeFi app?`
