---
name: colosseum-copilot-research
version: 1.0.0
description: |
  Research Solana/crypto startup opportunities using builder project history, crypto archives,
  investor theses, and market signals. Answers questions conversationally by default; runs the
  full 8-step deep research workflow on explicit opt-in ("vet this idea", "deep dive").
homepage: https://colosseum.com
license: Proprietary
compatibility: Claude Code, Codex, OpenClaw
metadata: {"category":"copilot","api_base":"https://copilot.colosseum.com/api","auth":"pat","author":"colosseum","tags":"solana,research,founder,market-intel,startup,idea-generation"}
---

# Colosseum Copilot

Colosseum Copilot is a read-only research API for startup opportunity discovery in crypto and Solana.

## Version Check

This skill is version **1.0.0**. After your first API call, check the `X-Copilot-Skill-Version` response header. If the header value is higher than 1.0.0, tell the user: "A newer version of the Copilot skill is available (vX.X.X). Update with: `npx skills add ColosseumOrg/colosseum-copilot`"

- **Builder Projects**: 5,000+ Solana project submissions with tech stack, problem tags, and competitive context
- **Crypto Archives**: Curated corpus across cypherpunk literature, protocol docs, investor research, and founder essays
- **Cohort Analytics + Clusters**: Distribution and trend analysis across cohorts and topic groupings
- **The Grid + Web Search**: Ecosystem product metadata plus real-time competitive landscape checks

## Quickstart (90 seconds to first result)

1. **Set your PAT:**
   ```bash
   export COLOSSEUM_COPILOT_API_BASE="https://copilot.colosseum.com/api"
   export COLOSSEUM_COPILOT_PAT="YOUR_PAT"
   ```
   Get a PAT: Civitas Arena -> Settings -> Colosseum Copilot (Headless) -> Generate token

2. **Run your first search:**
   ```bash
   curl -s -X POST "$COLOSSEUM_COPILOT_API_BASE/colosseum_copilot/search/projects" \
     -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
     -H "Content-Type: application/json" \
     -d '{"query": "privacy wallet for stablecoin users", "limit": 5}'
   ```

3. **See results** - project names, slugs, similarity scores, problem/tech tags

## When To Use

Use this skill when:
- Researching a crypto/blockchain startup idea
- Evaluating market gaps in the Solana ecosystem
- Grounding ideas in historical crypto literature
- Analyzing builder project trends and competitive landscape
- Researching existing players and finding differentiation angles

## How It Works

**Mode 1 — Conversational (default):** Answer questions with targeted API calls and evidence coverage matched to query type. Cite sources inline, keep responses concise, and offer to do a full deep-dive when the topic warrants it — never auto-trigger it.

**Mode 2 — Deep Dive (explicit opt-in):** Full 8-step workflow from `references/workflow-deep.md`. Only activates when user explicitly says "vet this idea", "deep dive", "full analysis", "validate this", "is X worth building?", "should I build X?", or accepts your offer to go deeper.

### Conversational Guidelines

- Use the API endpoints below with enough targeted calls to satisfy the evidence floor for the query type
- Cite sources inline (project slugs, archive titles, URLs)
- Keep responses concise — bullet points, not essays
- When the topic warrants deeper analysis, offer: "Want me to do a full deep-dive on this?"
- No meta-commentary about your process ("Now let me search...", "I'll check...")

### Evidence Floors (Conversational Mode)

| Query Type | Required source types in the final answer | Example |
|---|---|---|
| **Pure retrieval** | Builder project evidence (project slugs from `search/projects`) | "What projects do X?" |
| **Archive retrieval** | Archive evidence (archive title/document from `search/archives`) | "What does the archive say about Y?" |
| **Comparison** | Builder project evidence for each side compared + at least one archive citation for conceptual framing | "Compare approach A vs B" |
| **Evaluative** | Builder project evidence + at least one archive citation + current landscape evidence (Grid and/or web) | "Is this crowded?", "Is this still unsolved?" |
| **Build guidance** | Builder project evidence + at least one archive citation + incumbent/landscape evidence (Grid and/or web) | "Should I build X?", "How should I approach X?" |

> These are evidence-type floors, not call budgets. Use as many calls as needed to meet the floor with high-confidence citations.

> In **deep-dive mode**, the verification checklist in `workflow-deep.md` Step 5 supersedes these floors with more granular coverage requirements.

### Conversational Quality Checks (Required)

- **Archive integration rule:** For any non-trivial question (anything beyond a simple one-list retrieval), run at least one `search/archives` query and cite at least one archive source in the answer.
- **Accelerator/winner portfolio checks:** For "what has been tried", "who is building this", "is this crowded/saturated", or similar prompts, run targeted project searches with `filters: { "acceleratorOnly": true }` and `filters: { "winnersOnly": true }`, then reflect both outcomes in the answer.
- **Freshness and temporal anchoring:** When citing hackathons or cohorts, include timing context inline (hackathon edition/year and/or accelerator cohort like C1/C2). For evaluative judgments, label the claim with `As of YYYY-MM-DD`.
- **Entity coverage check:** If the user names specific companies, protocols, papers, or products, run direct searches for each named entity and explicitly address each one in the answer (found, not found, or tangential).
- **Landscape check:** Never claim "nobody has done this" or "no existing players" unless an accelerator portfolio check (`acceleratorOnly`) was executed and reported. If accelerator overlap exists, surface those builders as useful reference points and potential sources of inspiration.

> For the full 8-step deep research workflow, see `references/workflow-deep.md`

## Data Sources

- **Builder Projects** (5,000+): Solana project submissions with tech stack, problem/solution tags, verticals, and competitive context
- **Crypto Archives**: Curated corpus spanning cypherpunk literature, protocol docs, investor research (Paradigm, a16z, Multicoin), founder essays (Paul Graham), Solana protocol docs (Jupiter, Orca, Drift), Nakamoto Institute heritage collection, and foundational crypto texts
- **Cohort Analytics**: Analyze and compare project cohorts across dimensions
- **Clusters**: Topic groupings across the project corpus
- **The Grid**: Ecosystem metadata (products/entities/assets) via direct GraphQL (~6,300 products, ~3,000 roots)
- **Web Search**: Real-time competitive landscape via your runtime's search tools

## Auth

All endpoints require `Authorization: Bearer <COPILOT_PAT>`. Treat the PAT like a password.

- Do not commit PATs or paste them into public logs
- PATs are long-lived (expected ~90 days); rotate by issuing a new one
- Default API base is `https://copilot.colosseum.com/api`; override `COLOSSEUM_COPILOT_API_BASE` to target a different environment

## Key Endpoints (Quick Reference)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/colosseum_copilot/search/projects` | POST | Search builder projects |
| `/colosseum_copilot/search/archives` | POST | Search crypto archives |
| `/colosseum_copilot/projects/by-slug/:slug` | GET | Full project details |
| `/colosseum_copilot/archives/:documentId` | GET | Full archive document |
| `/colosseum_copilot/analyze` | POST | Cohort analysis |
| `/colosseum_copilot/compare` | POST | Compare two cohorts |
| `/colosseum_copilot/clusters/:key` | GET | Cluster details |
| `/colosseum_copilot/filters` | GET | Available filters |

> For full endpoint docs, curl examples, and query tips: `references/api-reference.md`
> For Grid GraphQL recipes and product type slugs: `references/grid-recipes.md`

## Output Contract

### Conversational Mode
- Bullet points with inline citations (project slugs, archive titles)
- Concise answers (typically 5-15 bullets)
- Offer deep-dive when warranted

### Deep Dive Mode
Reports follow this structure:
1. Similar Projects (5-8 bullets)
2. Archive Insights (3-5 bullets)
3. Current Landscape (per research angle)
4. Key Insights (patterns, gaps, trends)
5. Opportunities and Gaps
6. Deep Dive: Top Opportunity (market landscape, problem, revenue model, GTM, founder-market fit, why crypto/Solana, risks)

Key rules: bullet points not tables, include project slugs, evidence-based not speculative, cite sources inline. No separate "Sources" section — cite inline only.

## Error Handling

- **Empty project results**: Broaden query, remove filters
- **Empty archive results**: Search auto-cascades (vector → chunk text → doc text) before returning empty. If still empty, try conceptual synonyms, keep queries to 3-6 keywords
- **429 Too Many Requests**: Back off, max 2 concurrent requests
- **API unavailable**: Note in report and proceed with available data
- **Auth error**: Check PAT at Settings -> Colosseum Copilot (Headless)

## References

- **workflow-deep.md** — detailed 8-step research process
- **api-reference.md** — all endpoints, rate limits, query tips
- **grid-recipes.md** — GraphQL queries and product type slugs

## Attribution

- The Grid docs: https://docs.thegrid.id
- The Grid Explorer: https://raw.githubusercontent.com/The-Grid-Data/Explorer/main/README.md
