---
name: colosseum-copilot-grill
version: 2.0.0
description: |
  Grill a Solana or crypto startup hypothesis or dossier with evidence-backed adversarial
  questions. Use when the user says "grill my idea", "stress test this", "poke holes",
  "challenge my hypothesis", "pressure test", "stress-test this investment thesis", or
  "/grill".
---

# Colosseum Copilot Grill

Use `/grill` to pressure-test the current artifact. The output is not a generic critique;
it classifies each important claim as supported, refuted, or open using corpus evidence.

## Modes

- Founder mode: pressure-test the user's `HYPOTHESIS.md`, especially claims about user
  pain, competition, wedge, why-now, and Solana advantage.
- Researcher mode: pressure-test `dossiers/<subject-slug>.md`, especially the subject's
  investment thesis, moat, status signals, competitive position, and diligence risks.
  Frame findings around the subject and the market; do not write `HYPOTHESIS.md`.

## Required References

Read before acting:

- `../colosseum-copilot/references/request-conventions.md`
- `../colosseum-copilot/references/artifact-contract.md`
- `../colosseum-copilot/references/api-reference.md`

Use workflow short name `grill` in the User-Agent.

## Reads and Writes

Read:

- `HYPOTHESIS.md` at the user's repo root in founder mode, or the matching
  `dossiers/<subject-slug>.md` in researcher mode.
- The user's specific concern, if provided.

Write:

- Founder mode: `Risk Register` and `Open Questions` claim status, severity, evidence,
  and next test.
- Researcher mode: `Risks & Open Questions`, `Competitive Position`, or `Status Signals`
  when claim status changes.
- `Evidence Log`: dated run stamp and citations.
- Optional `.copilot/runs/YYYY-MM-DDTHHMMSSZ-grill.md`.

If `HYPOTHESIS.md` is missing in founder mode and the user gave a full idea, create a
minimal `HYPOTHESIS.md` shell and grill only the explicit claims. If no dossier exists in
researcher mode, stop and recommend `/vet <subject>` to build the dossier first. If
neither artifact nor enough prompt context is available, stop and recommend `/vet`.

## Workflow

1. Run auth preflight. Stop on missing PAT, 401, or unreachable API.
2. Extract 5-8 load-bearing claims from the active artifact. Founder examples from
   `Hypothesis`, `Competitive Field`, `Wedge`, and `Open Questions`: "users have urgent
   pain", "few teams target this segment", "Solana materially improves the workflow",
   "incumbents do not cover this wedge". Researcher examples from `Their Thesis`,
   `Competitive Position`, `Status Signals`, and `Risks & Open Questions`: "this subject
   owns a differentiated position", "status signals are current", "incumbents do not
   cover this market", "the moat is defensible".
3. For each claim, form one disconfirming project query and one conceptual archive query.

Project challenge query:

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/grill" \
  -d '{
    "query": "<claim phrased as a problem or incumbent alternative>",
    "limit": 10,
    "includeFacets": true,
    "facets": ["problemTags", "solutionTags", "techStack", "clusters", "lenses"],
    "facetTopK": 6,
    "filters": { "winnersOnly": false, "acceleratorOnly": false }
  }'
```

Archive challenge query:

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/archives" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/grill" \
  -d '{
    "query": "<3-6 keyword primitive or failure mode>",
    "limit": 5,
    "maxChunksPerDoc": 1
  }'
```

4. For any competitive claim, run a focused winners or accelerator check before calling it
   weak or crowded.

```bash
curl -sS -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/grill" \
  -d '{
    "query": "<direct competitor or same user workflow>",
    "limit": 10,
    "filters": { "acceleratorOnly": true }
  }'
```

5. Fetch project or archive details only for evidence that will change the claim status.

```bash
curl -sS "$COLOSSEUM_COPILOT_API_BASE/projects/by-slug/<project-slug>" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/grill"
```

```bash
curl -sS "$COLOSSEUM_COPILOT_API_BASE/archives/<documentId>?offset=0&maxChars=8000" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/grill"
```

6. Classify each claim:

- `Supported`: multiple relevant citations point the same way.
- `Refuted`: direct corpus evidence contradicts the claim.
- `Open`: evidence is thin, mixed, stale, or outside the corpus.

7. Update the artifact. Do not bury criticism; make the hard questions concrete and
   answerable.

## Interrogation Posture

When the user is present, grill interactively: ask ONE question at a time, attach your
recommended answer, and when the reply is polished-vague, push once more with a sharper
version — the real answer usually arrives on the second pass. Take a position on every
claim and state what evidence would change it. How to push:

- User: "Everyone I've shown this to loves it."
  - BAD: "That's encouraging — who have you talked to?"
  - GOOD: "Loving an idea is free. Has anyone asked when it ships, or gotten angry when
    the prototype broke? The corpus shows [X](link) had the same signal and stalled at
    launch — interest is not demand. What's your strongest DEMAND evidence?"
- Artifact says: "few teams target this segment."
  - BAD: "This claim seems plausible given the search results."
  - GOOD: "Refuted as written: five teams since Breakout target exactly this segment —
    [A](link) and [B](link) are still shipping. The defensible version of your claim is
    narrower: none of the five handle <specific slice>. Rewriting it that way — agreed?"
- Researcher dossier says: "the moat is defensible."
  - BAD: "The moat appears reasonably strong."
  - GOOD: "Open, leaning refuted: their claimed moat is integrations, but the corpus
    shows three teams replicated the same integrations within one cohort. What would
    settle it: evidence their partnerships are exclusive. Nothing public says so."

## Output Shape

The user-facing answer is conversational — lead with the hardest findings the way you
would brief a colleague, not a fixed report skeleton. Make sure it covers:

- The 3-5 hardest findings, each with claim status and citations.
- Every important claim classified `Supported`, `Refuted`, or `Open` (a compact ledger
  list is fine when there are many).
- Which artifact sections you updated, in one line.
- `Next step:` in founder mode usually `/precedents` if prior attempts are unclear,
  otherwise `/wedge`. In researcher mode, usually `/vet <subject>` to deepen thin dossier
  sections, `/validate` for deal monitoring, or `/radar` for broader space monitoring.

## Failure Modes

- Missing PAT or 401: stop and point to `https://docs.colosseum.com/copilot`.
- Missing founder artifact and no idea, or missing researcher dossier and no subject:
  stop and recommend `/vet`.
- Evidence is sparse: mark the claim `Open`; do not infer failure or validation from
  absence.
- Conflicting evidence: preserve both sides and write the next query needed.
- API unavailable: stop before updating claim statuses.

## Example Prompts

- `/grill`
- `Grill my hypothesis and tell me what breaks first`
- `Stress test the wedge in HYPOTHESIS.md against what builders have already tried`
- `Stress-test the investment thesis in dossiers/senthos.md`
