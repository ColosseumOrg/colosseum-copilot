---
name: colosseum-copilot-find-tools
version: 2.0.0
description: |
  Recommend Solana tools, SDKs, APIs, wallets, RPC providers, and build resources for a
  startup hypothesis. Use when the user says "find tools", "which SDK", "best stack",
  "what should I build with", "developer resources", or "/find-tools".
---

# Colosseum Copilot Find Tools

Use `/find-tools` to recommend a small, evidence-backed build stack. It combines the
public resource index when reachable, static category guidance, nearby project tech-stack
signals, and archive documents.

## Modes

Founder-leaning: offer `/find-tools` automatically only in founder mode when the user is
ready to build or the `Tooling` section is missing. In researcher mode, run it only when
the user explicitly asks what a subject uses, what stack would build a similar product, or
which tools fit a category; do not recommend it as the next step for a dossier, and do not
create or update `HYPOTHESIS.md` from a researcher request.

## Required References

Read before acting:

- `../colosseum-copilot/references/request-conventions.md`
- `../colosseum-copilot/references/artifact-contract.md`
- `../colosseum-copilot/references/api-reference.md`
- `../colosseum-copilot/references/tooling-reference.md`

Use workflow short name `find-tools` in the User-Agent.

## Reads and Writes

Read:

- Founder mode: `HYPOTHESIS.md`, especially `Wedge`, `Design Constraints`, and
  `Open Questions`.
- Researcher mode, only when explicitly requested: the matching dossier or the user's
  stack question.
- User's explicit stack question, if provided.

Write:

- Founder mode: `Tooling`: 2-4 recommendations with fit, first integration move,
  docs/source link, and evidence citations.
- Researcher mode: answer conversationally unless the user explicitly asks to annotate the
  dossier; if annotating, append tool-use notes to `Risks & Open Questions` and
  `Evidence Log`, never to `HYPOTHESIS.md`.
- `Evidence Log`: dated run stamp and citations.
- Optional `.copilot/runs/YYYY-MM-DDTHHMMSSZ-find-tools.md`.

If no artifact exists, answer from the prompt and recommend `/vet` for a founder idea or
`/vet <subject>` for a researcher dossier when deeper evidence would help.

## Workflow

1. Run Copilot auth preflight.
2. Probe the optional live resource index. If `COLOSSEUM_DEV_RESOURCES_URL` is set, try
   it first. Then try the public resource JSON. Do not fail the whole workflow if these
   are unavailable.

```bash
curl -sS "${COLOSSEUM_DEV_RESOURCES_URL:-https://ColosseumOrg.github.io/hackathon-resources/current.json}" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/find-tools"
```

If that URL was an override and fails, try:

```bash
curl -sS "https://ColosseumOrg.github.io/hackathon-resources/current.json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/find-tools"
```

3. Mine similar projects for stack signals.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/find-tools" \
  -d '{
    "query": "<idea, wedge, or stack question>",
    "limit": 12,
    "includeFacets": true,
    "facets": ["techStack", "primitives", "solutionTags"],
    "facetTopK": 12,
    "filters": { "winnersOnly": false, "acceleratorOnly": false }
  }'
```

4. Fetch details for the top projects only when their stack or repo links affect the
   recommendation.

```bash
curl -sS "$COLOSSEUM_COPILOT_API_BASE/projects/by-slug/<project-slug>" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/find-tools"
```

5. Search archives for docs or implementation notes for candidate tools and primitives.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/archives" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/find-tools" \
  -d '{
    "query": "<tool or primitive> Solana docs integration",
    "limit": 5,
    "maxChunksPerDoc": 1
  }'
```

6. Select 2-4 tools. Prefer exact fit over popularity. For each recommendation:

- What it does.
- Why it fits this idea.
- First integration move.
- Evidence: live resource entry/link when available, project slug tech-stack precedent,
  and/or archive document ID.
- Skill install command only when the live resource data provides one exactly.

7. Write `## Tooling` and append a run stamp to `Evidence Log`.

## Recommendation Standards

- Do not list every possible SDK.
- Do not invent sponsor offers or docs links.
- If live resources are unreachable, state that and rely on static category guidance plus
  Copilot project/archive evidence.
- If the corpus has weak coverage for the user's need, say the current resource corpus
  does not have a strong dedicated match and give the closest resource plus the missing
  capability.
- Normal next step is `/validate` after tooling exists, or `/blueprint` if design
  constraints are missing.

## Failure Modes

- Missing PAT: stop for Copilot evidence, but you may still explain that auth is needed
  and point to `https://docs.colosseum.com/copilot`.
- Live resource index unavailable: continue with static guidance and say so.
- No matching tools: recommend the closest foundation resources and open question; do not
  force a sponsor/tool fit.
- API unavailable: stop before making evidence-backed corpus claims.

## Example Prompts

- `/find-tools for a private stablecoin payroll app`
- `Which SDKs should I use for the blueprint in HYPOTHESIS.md?`
- `Find tools for a mobile NFT game asset marketplace`
