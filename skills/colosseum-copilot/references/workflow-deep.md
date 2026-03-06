# Research Workflow — Deep Reference

This is the detailed reference for the 8-step research workflow. For a quick overview, see the main skill file.

## Research Workflow

Use this workflow when conducting deep research on crypto/blockchain topics. It ensures comprehensive coverage across all data sources and produces actionable opportunity analyses.

## When This Workflow Activates

This workflow runs ONLY when the user explicitly requests a deep analysis:
- "vet this idea", "deep dive", "full analysis", "validate this"
- "is [X] worth building?", "should I build [X]?"
- User accepts your offer: "Want me to do a full deep-dive on this?"

Do NOT run this workflow for simple questions, project lookups, archive searches,
or hackathon comparisons. Answer those conversationally with targeted API calls.

### Output Philosophy

**This is not just a landscape report. It's an actionable opportunity analysis.**

Your output should help a founder explore and refine an idea. That means:

1. **Be specific, not vague.** "Gap in payments" is useless. "SMEs wait 60-90 days for invoice payment, creating a $2.5T global liquidity gap" is actionable.

2. **Ground claims in evidence.** Every insight should trace to: hackathon project data, archive sources, or web search results. If you can't cite it, don't claim it.

3. **Address the hard questions.** Two-sided marketplace? Say so and explain the cold start problem. Regulatory risk? Name the jurisdictions. Don't hide friction.

4. **Map the landscape for research and inspiration.** Show founders what's already been built, who the key players are, and where the interesting angles lie. Competition is normal and healthy — most incumbents aren't unbeatable. Frame existing players as market validation and learning opportunities, not deterrents.

5. **Connect to foundational concepts.** The archives contain cypherpunk wisdom on escrow, bearer certificates, reputation systems, etc. Use them to validate or challenge ideas.

6. **Research before deep-diving.** Before claiming a gap exists, search for what existing players already offer. "Lots of hackathon projects building X" doesn't mean "X is unsolved" — it might mean the space has strong demand and existing traction worth studying. Use this research to help founders find their unique angle.

7. **No execution chatter in user-facing output.** Don't narrate your process ("Now let me search...",
   "I'll check the archives next..."). Perform verification internally; present findings directly.

8. **Surface relevant context.** "Tokamai (C2, funded) is building monitoring infrastructure
   with paying customers — study their approach for inspiration" is more useful than vague
   hand-waving. Founders benefit from knowing who else is in the space so they can learn
   from them and find their own differentiated angle.

### Important Disclaimers (Include in Every Report)

Include these disclaimers in every deep-dive report:

1. **Hackathon project context:** "Most hackathon projects don't turn into successful startups. The projects surfaced here are useful for inspiration and seeing what's been tried before."
2. **Project activity status:** "Projects surfaced in this report may no longer be active. Verify current status before drawing conclusions about the competitive landscape."

Place these as a brief note near the top of the "Similar Projects" section.

### Reusing Prior Results

If this deep dive follows a conversational exchange on the same topic, carry forward any results already obtained (project lists, archive citations, Grid data). In Step 2, skip calls that duplicate prior coverage — only run searches for dimensions not yet explored. In Step 5, mark checklist items as satisfied when prior evidence already covers them.

For archives specifically: if Step 2b already returned highly relevant documents (similarity > 0.40), skip the Step 7c search query and instead fetch the full text of the best Step 2b results using the `/archives/:documentId` endpoint with `maxChars=8000`. Only run a new Step 7c search if your Step 2b results were tangential to the deep-dive opportunity.

### Step 1: Parse the Research Topic

Extract from the user's input:
- **Core concept** (1-2 sentences summarizing what to research)
- **Target audience** (builders, researchers, investors, etc.)
- **Key dimensions** (technical depth, historical context, market analysis)
- **Domain context** (if mentioned — e.g., "DeFi", "privacy", "infrastructure")

If the topic is broad, identify the most relevant angles to explore.

### Step 2: Parallel Search [execute in parallel when possible]

> **Concurrency note:** The API allows 2 in-flight requests, enforced server-side. Submit all Step 2 calls in a single response — your runtime serializes overflow automatically. If you get `429`, the server is at capacity; wait for in-flight requests to complete before retrying.

> **Context budget:** After each sub-step, extract only the data you need going forward (top 3-5 results with names, slugs, scores; relevant tags; saturation counts). Do not carry raw API JSON into later steps — summarize inline and discard full payloads. If you need dropped details later, re-fetch rather than persisting large payloads.

Execute all Step 2 searches in a single response:

#### 2a. Search Projects (minimum 2 queries required)

Run **at least 2 `search/projects` calls** with distinct formulations:

**Query 1 — Semantic rewrite:** Rephrase the topic in natural language, focusing on what the user is trying to accomplish.
```bash
curl -s -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "<semantic rewrite of topic>",
    "limit": 10,
    "filters": {
      "winnersOnly": false,
      "acceleratorOnly": false
    }
  }'
```

**Query 2 — Problem-space rewrite:** Reframe around the underlying problem or user pain point rather than the solution category.
```bash
curl -s -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "<problem-space rewrite of topic>",
    "limit": 10,
    "filters": {
      "winnersOnly": false,
      "acceleratorOnly": false
    }
  }'
```

**Hackathon concentration check:** If the top results from both queries are dominated by a single hackathon (> 70% from one), reformulate with a different angle and search again to ensure cross-hackathon coverage.

**Dedup check:** If multiple results share the same GitHub URL or team name (e.g., `credencechain-1` and `credencechain-2`), treat them as one project with multiple submissions. Count competitors by distinct teams, not submission slugs.

**Tag-filtered follow-up:** Use the `problemTags` or `solutionTags` from your **top 3 search results** (not the global `facets` distribution) to pick follow-up filter tags. Note: `facets` returned by `includeFacets: true` reflect corpus-wide tag counts, not tags specific to your search results — they show landscape density but are misleading for targeted follow-ups. For filter-only follow-ups, omit `query` entirely (do not send `""`):
```bash
curl -s -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10,
    "filters": {
      "problemTags": ["<top-problem-tag-from-facets>"],
      "winnersOnly": false
    }
  }'
```

**Query 3 — Accelerator portfolio check (REQUIRED):**
After Queries 1-2 complete, run a third search targeting accelerator companies:

```bash
curl -s -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "<same semantic rewrite as Query 1>",
    "limit": 10,
    "filters": { "acceleratorOnly": true }
  }'
```

**Sequencing:** Run Query 3 AFTER Queries 1-2 complete (2 concurrent max).
- If accelerator results directly match → carry to Step 6e as related builders to highlight.
- If accelerator results are adjacent (same vertical, different approach/segment) → note them as "Adjacent accelerator companies" in the report and explain the differentiation. These inform the opportunity landscape without triggering the Direct Competitor Alert.
- If no accelerator results match → note "No accelerator portfolio overlap found."

#### 2b. Search Archives (Dual-Track Semantic Search)
Run **two** archive searches in parallel — one conceptual, one implementation-focused:

**A) Conceptual query** (timeless primitive):
```bash
curl -s -X POST "$COLOSSEUM_COPILOT_API_BASE/search/archives" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "<conceptual theme, 3-6 focused keywords>",
    "limit": 5,
    "maxChunksPerDoc": 1
  }'
```

**B) Implementation query** (modern ecosystem specifics):
```bash
curl -s -X POST "$COLOSSEUM_COPILOT_API_BASE/search/archives" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "<implementation-specific theme, 3-6 focused keywords>",
    "limit": 5,
    "maxChunksPerDoc": 1
  }'
```

**Archive guardrails:**
- Keep queries to **3-6 focused keywords** (not 2-word fragments, not full sentences).
- If top results are all pre-2010 and the prompt is about modern implementation, re-query with ecosystem-specific terms (`Solana`, `SPL`, `Anchor`, `Token-2022`, etc.).
- Prefer **3-4 high-quality archive citations** over padding to 5 with tangential references.

**Note:** Archive search auto-cascades through tiers (vector → chunk text → doc text) when a tier returns empty. If results are still empty after cascade, or are low-quality, try these query-refinement strategies (in order):
1. **Synonyms:** Replace domain-specific jargon with broader terms (e.g., `"futarchy"` → `"prediction markets governance"`, `"MEV"` → `"frontrunning extraction"`)
2. **Broader concept:** Step up one abstraction level (e.g., `"compressed NFTs"` → `"state compression"`, `"invoice factoring"` → `"trade finance"`)
3. **Source filter:** Try restricting to a high-signal source (e.g., `"sources": ["solana_repo_issues"]` for protocol-level topics, `"sources": ["cryptography_mailing_list"]` for privacy/crypto primitives)
4. **Different angle:** Reframe around the underlying primitive rather than the application (e.g., `"zk attestation"` instead of `"privacy compliance"`)

#### 2c. Fetch Top Project Details
For the **top 2 most relevant** projects from search results:
```bash
curl -s "$COLOSSEUM_COPILOT_API_BASE/projects/by-slug/<slug>" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT"
```

#### 2d. Hackathon Analysis (Topic-Aware Routing)
Route the research topic to the most relevant hackathon(s) before calling `/analyze`:

| Topic | Hackathon(s) |
|-------|-------------|
| Gaming/entertainment | `radar` |
| Infrastructure/tooling | `breakout` |
| Privacy/identity | `cypherpunk` |
| DeFi/trading | `cypherpunk`, `breakout` |
| Consumer/social | `renaissance` |
| AI/agents | `breakout` |
| DePIN/hardware | `breakout` |
| General/cross-cutting | all hackathons |

Run `/analyze` with all routed hackathons (multi-hackathon calls preferred for broader coverage):
```bash
curl -s -X POST "$COLOSSEUM_COPILOT_API_BASE/analyze" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "cohort": { "hackathons": ["<routed-hackathon-1>", "<routed-hackathon-2>"] },
    "dimensions": ["tracks", "problemTags", "techStack"],
    "topK": 8,
    "samplePerBucket": 1
  }'
```

Use the tag distributions to identify which areas are **crowded** (high count) vs. **underexplored** (low count or absent). This directly informs angle selection in Step 3.

#### 2e. Ecosystem Check (The Grid) [3-PHASE]

Query The Grid to identify **established products** in this space. Run all three phases — they serve different purposes.

**Phase 1: Category Search** (highest precision — start here)

Map your research topic to 1-3 `productType` slugs from the cheat sheet below, then query products filtered by those slugs with Solana ecosystem scoping. The triple-OR Solana filter covers deployments, support edges, and profile tags for maximum recall:

> **Shell escaping note:** The `--data-binary @- <<'QUERY'` heredoc syntax works in standard bash. If your runtime has issues with heredocs, use inline JSON instead: `--data-binary '{"query":"...","variables":{...}}'` (escape inner quotes). Alternatively, write the JSON to a temp file and use `--data-binary @/tmp/query.json`.

```bash
curl -s -X POST "https://beta.node.thegrid.id/graphql" \
  -H "content-type: application/json" \
  --data-binary @- <<'QUERY'
{"query":"query VerticalSearch($typeSlugs:[String!]!,$chain:String!,$tag:String!,$dead:[String!]!,$limit:Int!){products(limit:$limit,where:{_and:[{productType:{slug:{_in:$typeSlugs}}},{_or:[{productDeployments:{smartContractDeployment:{deployedOnProduct:{name:{_eq:$chain}}}}},{supportsProducts:{supportsProduct:{name:{_eq:$chain}}}},{root:{profileTags:{tag:{slug:{_eq:$tag}}}}}]},{_not:{productStatus:{slug:{_in:$dead}}}}]}){id name productType{slug name}productStatus{slug}root{slug urlMain gridRank{score}}}}","variables":{"typeSlugs":["<slug1>","<slug2>"],"chain":"Solana Mainnet","tag":"solana","dead":["discontinued","support_ended"],"limit":25}}
QUERY
```

**Topic → slug mapping guide:**

| Research Topic | Suggested `productType` Slugs |
|---|---|
| DeFi lending | `decentralised_borrowing_and_lending`, `yield_aggregator` |
| Payments | `merchant_payment_gateway`, `on_off_ramp`, `payments_infrastructure_and_orchestration` |
| DEX / trading | `decentralised_exchange`, `dex_aggregator`, `derivatives` |
| Infrastructure | `developer_tooling`, `onchain_data_api`, `block_explorer`, `rpc_provider` |
| Staking | `liquid_staking`, `staking_service` |
| Cross-chain | `bridge`, `cross_chain_infrastructure` |
| AI agents | `ai_agent`, `ai_agent_platform`, `ai_agent_framework` |
| Gaming | `game`, `blockchain_gaming_infrastructure` |
| Identity | `decentralised_identity` |
| Stablecoins | `stablecoin_issuance` |
| NFTs | `nft_marketplace`, `nft_issuance_platform` |
| DePin | `depin` |
| Prediction markets | `prediction_markets` |
| Oracles | `oracle` |
| Wallets | `wallet`, `embedded_wallet`, `hardware_wallet` |
| RWA / tokenized credit | `rwa_tokenisation_platform`, `decentralised_borrowing_and_lending` |
| Credit scoring / risk | `risk_assessment`, `decentralised_identity` |

**Top 30 product type slugs by count:** `developer_tooling` (599), `wallet` (331), `decentralised_exchange` (207), `centralised_exchange` (182), `financial_services_platform` (174), `merchant_payment_gateway` (159), `on_off_ramp` (145), `l1` (144), `payments_infrastructure_and_orchestration` (136), `game` (131), `decentralised_borrowing_and_lending` (114), `yield_aggregator` (113), `block_explorer` (113), `ai_agent` (104), `bridge` (101), `onchain_data_api` (100), `dex_aggregator` (81), `depin` (80), `ai_agent_platform` (77), `cross_chain_infrastructure` (73), `stablecoin_issuance` (71), `nft_marketplace` (68), `peer_to_peer_and_remittance` (67), `decentralised_identity` (55), `oracle` (46), `derivatives` (46), `embedded_wallet` (46), `rpc_provider` (44), `prediction_markets` (28), `ai_agent_framework` (27). Total: 115 slugs — query `productTypes` for the full list.

**Topic doesn't map to existing slugs?** If no confident 1-3 slugs emerge from the mapping table:
1. Skip Phase 1 (category search) and run Phase 2 (keyword search) first
2. Extract recurring `productType.slug` values from keyword hits and pick up to 3 inferred slugs
3. Re-run Phase 1 + Phase 3 with inferred slugs if any emerge
4. If no stable slugs emerge, proceed with keyword-only evidence and note: "No reliable productType slug mapping exists for this topic — ecosystem maturity signal."

**Phase 2: Keyword Recall** (broad net — catches products that don't fit standard categories)

Search across product name, description, root slug, and entity names:

```bash
curl -s -X POST "https://beta.node.thegrid.id/graphql" \
  -H "content-type: application/json" \
  --data-binary @- <<'QUERY'
{"query":"query BroadKeyword($q:String!,$dead:[String!]!,$limit:Int!){products(limit:$limit,where:{_and:[{_or:[{name:{_contains:$q}},{description:{_contains:$q}},{root:{slug:{_contains:$q}}},{root:{entities:{_or:[{name:{_contains:$q}},{tradeName:{_contains:$q}}]}}}]},{_not:{productStatus:{slug:{_in:$dead}}}}]}){id name description productType{slug name}productStatus{slug}root{slug urlMain}}}","variables":{"q":"<topic keyword>","dead":["discontinued","support_ended"],"limit":15}}
QUERY
```

**Phase 3: Saturation Check** (how crowded is this space?)

Run `productsAggregate` with the same category filter from Phase 1 to get total product count and distinct root count:

```bash
curl -s -X POST "https://beta.node.thegrid.id/graphql" \
  -H "content-type: application/json" \
  --data-binary @- <<'QUERY'
{"query":"query Saturation($typeSlugs:[String!]!,$tag:String!,$dead:[String!]!){productsAggregate(filter_input:{where:{_and:[{productType:{slug:{_in:$typeSlugs}}},{root:{profileTags:{tag:{slug:{_eq:$tag}}}}},{_not:{productStatus:{slug:{_in:$dead}}}}]}}){_count rootId{_count_distinct}}}","variables":{"typeSlugs":["<same slugs as Phase 1>"],"tag":"solana","dead":["discontinued","support_ended"]}}
QUERY
```

**After all phases:** Merge results from Phase 1 and Phase 2. Rank by `gridRank.score` (if available) and `productStatus`. Note the top 5-10 key players — these become your landscape baseline for Step 6. Record the saturation numbers from Phase 3 (total products, distinct roots) — you will need them when identifying differentiation opportunities in Step 6c and writing your final report.

### Step 3: Identify Research Angles

Based on projects, archives, and hackathon analysis, identify **2-3 distinct research angles** worth exploring further.

**If you ran `/analyze` in Step 2d**, use the results to inform angle selection:
- **High-count tags** → saturated areas (potential red ocean); angle should explain why there's still room
- **Low-count or absent tags** → potential whitespace; angle should validate whether the gap is real
- **Tag combinations** (e.g., high `defi` + low `privacy`) → intersection opportunities

Format as JSON:
```json
[
  {
    "angle": "Short name",
    "concept": "What makes this angle interesting - the key insight or gap",
    "query": "Web search query to explore current landscape"
  }
]
```

Each angle should:
- Surface a distinct perspective on the topic
- Connect to foundational concepts or emerging trends
- Be specific enough to validate via web search
- Reference hackathon data if available (e.g., "Only 4% of Breakout + Radar submissions addressed X")

### Step 4: Landscape Analysis [execute in parallel when possible]

For **EACH** angle, do a web search in a **single response** (parallel tool calls).

For each result, summarize:
- **Key players**: Companies, protocols, and projects in this space
- **Recent developments**: Funding, launches, announcements (2024-2025)
- **Research and standards**: Academic papers, specifications, governance proposals
- **Maturity level**: Emerging | Growing | Established | Saturated

Suggested query patterns:
- `"{concept}" crypto startup funding 2024`
- `"{concept}" production on Solana`
- `"{concept}" protocol standard specification`

### Step 5: Verification Checklist

Before synthesis, **internally verify** ALL of these are complete. This is a self-check — do not display checklist items or execution logs to the user:

- [ ] `search/projects` returned results (if empty, broaden query)
- [ ] `search/archives` returned results (if empty, try different conceptual framing)
- [ ] Web search called for **EACH** angle (not just one)
- [ ] At least one `projects/by-slug` call for detailed evidence

**Coverage depth checks (REQUIRED):**
- [ ] **2+ distinct project queries executed** — confirm you ran at least two `search/projects` calls with meaningfully different formulations (semantic rewrite + problem-space rewrite). Two queries with minor word swaps do not count.
- [ ] **One tag/filter follow-up query executed** — confirm you used facet data from an initial search to run a filtered follow-up query (see Step 2a tag-filtered follow-up).
- [ ] **Cross-hackathon coverage confirmed** — results should span multiple hackathons. If a single hackathon dominates (> 70%), either reformulate and search again, or explicitly document why single-hackathon coverage is intentional (e.g., the topic only appeared in one hackathon edition).
- [ ] **Accelerator portfolio checked** — Query 3 (acceleratorOnly) executed and outcome documented

**If any are missing, execute the missing calls NOW before proceeding.**

After completing initial synthesis (through "Opportunities & Gaps"), verify validation and deep dive:

**Market Research (REQUIRED):**
- [ ] Key players identified for top opportunity
- [ ] Web search completed for existing players' current features
- [ ] Landscape mapped and differentiation angle identified

**Deep Dive Research (only after market research completes):**
- [ ] Problem/TAM web search completed
- [ ] Revenue model web search completed
- [ ] Foundational archive search completed (with full document fetch if promising)
- [ ] Go-to-market case study search completed

**Do not skip market research. Understanding the landscape helps founders find their unique angle.**

### Step 6: Market Landscape Research [CRITICAL - DO NOT SKIP]

**Before deep-diving on any opportunity, research the existing landscape to understand what's been built and where differentiation opportunities exist.**

#### 6a. Identify Key Players
Who are the current players in this space? (e.g., Jupiter for DEX aggregation, Stripe for payments)

If you identified key players in Step 2e's Grid check, expand their root profiles now using the **Root Profile** query.

**Finding the root slug:** If a key player was identified via web search (not Grid), search for their Grid presence using Phase 2's keyword query with the company name. If no Grid entry exists, note "Not indexed on the Grid" and rely on web search evidence for the landscape analysis.

Expand root profiles using:

```bash
curl -s -X POST "https://beta.node.thegrid.id/graphql" \
  -H "content-type: application/json" \
  --data-binary @- <<'QUERY'
{"query":"query RootProfile($slug:String!){roots(limit:1,where:{slug:{_eq:$slug}}){id slug urlMain gridRank{score}profileInfos{tagLine descriptionShort descriptionLong}urls{url urlType{slug name}}socials{name socialType{slug name}urls{url}}products(limit:10,order_by:{name:Asc}){id name productType{slug name}productStatus{slug name}}profileTags(limit:10){tag{slug name}}}}","variables":{"slug":"<incumbent-root-slug>"}}
QUERY
```

Pull the full product list, tags, socials, and URLs. This gives you concrete data about what they actually offer — don't rely on assumptions.

#### 6b. Research Existing Players' Offerings
Use web search:
- Query: `<key player> <proposed area> features how it works 2025`

Also expand the player's product graph to map dependencies and reverse dependencies:

```bash
curl -s -X POST "https://beta.node.thegrid.id/graphql" \
  -H "content-type: application/json" \
  --data-binary @- <<'QUERY'
{"query":"query ProductSupportGraph($productId:String!){productsById(id:$productId){id name root{slug urlMain}supportsProducts(limit:25){supportsProduct{id name root{slug urlMain}}}supportsProductsBySupportsProductId(limit:25){product{id name root{slug urlMain}}}}}","variables":{"productId":"<incumbent-product-id>"}}
QUERY
```

`supportsProducts` = what they depend on. `supportsProductsBySupportsProductId` = what depends on them. Gaps in this graph may reveal integration opportunities.

**Ask explicitly:**
- Do existing players already offer this?
- When did they ship it? (Recent = there's clear market demand)
- How sophisticated is their solution? Where are the gaps or underserved segments?

#### 6c. Identify Differentiation Opportunities
Classify the opportunity landscape into one of three categories.

Use the saturation count from Step 2e Phase 3 to ground your classification. A category with 3 products and 3 distinct roots has a different competitive dynamic than one with 200 products across 150 roots.

1. **Open space** — No existing player has meaningfully addressed this problem. Proceed to Step 7.
2. **Differentiation opportunity** — Existing players have solutions, but there are specific angles a new entrant could pursue:
   - **Segment opportunity**: They don't serve a specific user segment well (e.g., "Jupiter doesn't serve institutional traders who need compliance features")
   - **UX opportunity**: The feature exists but is buried, confusing, or requires technical knowledge (e.g., "Solana staking exists but requires CLI knowledge")
   - **Geographic opportunity**: Not available or poorly adapted for specific markets (e.g., "no fiat onramps for Southeast Asian currencies")
   - **Pricing opportunity**: Existing players charge too much for a segment that needs a cheaper alternative
   - **Integration opportunity**: Works in isolation but doesn't compose well with the rest of the ecosystem
3. **Well-covered space** — Multiple established players serve this need effectively. Help the founder understand the landscape and suggest adjacent or complementary angles they could explore instead.

**Help founders find their angle.** Even in well-covered spaces, there may be underserved segments, novel approaches, or complementary products worth building. Frame this as market intelligence, not discouragement.

#### 6d. Document Your Research
In the final report, include a section: "Market Landscape" that shows:
- What existing players currently offer (useful for research and inspiration)
- Where differentiation opportunities exist (with evidence)
- Or why you explored a different angle
- **Grid evidence** (required): key player product IDs, root slugs, product types, and saturation counts from Step 2e Phase 3. If Grid data contradicts your web search findings, flag the discrepancy explicitly.

#### 6e. Related Builder Highlight
If any project from Step 2a — including the accelerator check — has high semantic
overlap with the user's idea (same problem, same target user, similar approach):

**Surface this prominently in your report's Market Landscape section.** Format:

> **Related Builder:** [Name] (`slug`, [Hackathon/Batch]) is working on [overlap].
> Status: [active/funded/shipped/pivoted]. Study their approach for inspiration.
> To differentiate, consider: [specific angle — segment, geography, UX, pricing, or integration].

Evidence requirements for highlighting:
- Matching problem space (not just category)
- Matching target user segment
- Similar technical approach or distribution strategy

Help the founder understand what's been tried and suggest concrete differentiation
angles (segment, geography, UX, pricing, or integration).

**Grounding rule:** When noting overlap with existing builders, be specific about
what they've built and where the differences lie. Vague claims like "there's room
for both" aren't helpful — instead, identify the specific underserved segment or
novel angle the founder could pursue.

### Step 7: Deep Opportunity Research [AFTER MARKET RESEARCH]

**Only proceed here after Step 6's market landscape research is complete.**

#### 7a. Problem & User Research
Use web search: `<opportunity> market size TAM problem friction pain point`

Look for: specific friction points, user personas, market sizing data, industry reports.

#### 7b. Revenue Model Research
Use web search: `<opportunity> business model revenue pricing startup funding`

Look for: how comparable companies charge, unit economics, funding rounds (implies revenue potential).

#### 7c. Foundational Grounding (Archives)
```bash
curl -s -X POST "$COLOSSEUM_COPILOT_API_BASE/search/archives" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "<underlying primitive, 3-6 focused keywords>",
    "limit": 3,
    "maxChunksPerDoc": 2
  }'
```

> **Deep-dive pass**: Use `maxChunksPerDoc: 2` here (vs. `1` in exploratory Step 2b) to get richer context from documents you already know are relevant.

For promising archive results, fetch full text:
```bash
curl -s "$COLOSSEUM_COPILOT_API_BASE/archives/<documentId>?offset=0&maxChars=8000" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT"
```

Look for: foundational concepts from cypherpunk/crypto literature that validate or inform the opportunity.

#### 7d. Go-to-Market Case Studies
Use web search: `<similar company or space> cold start bootstrap marketplace strategy`

Look for: how comparable two-sided markets bootstrapped, anchor customer strategies, vertical focus approaches.

### Step 8: Synthesize Report

**Output-budget guardrails (REQUIRED):**
- Complete all 7 deep-dive subsections before any supplementary content.
- Keep pre-deep-dive sections concise so the deep dive can finish.
- If approaching output limits, prioritize in this order:
  1. `Risk Assessment`
  2. `Founder-Market Fit`
  3. `Why Crypto/Solana?`
  4. `Further Reading` (appendix, optional)
- Do not add source dumps or supplementary appendices before deep-dive completion.

**Compact mode (when approaching output limits):**
- "Why Crypto/Solana?" can be reduced to 1-2 bullets when the crypto angle is obvious.
- "Founder-Market Fit" can be omitted when the ideal founder profile is self-evident.
- Merge "Key Insights" + "Opportunities & Gaps" into a single "Insights & Gaps" section.
- Cap "Current Landscape" to the top 2 angles (drop the weakest).
- Keep all other Deep Dive subsections required.

Generate the final report with these **EXACT** sections in this order:

---

## Similar Projects (5-8 bullets)

> **Note:** These are hackathon submissions — demos and prototypes, not production products. Many may no longer be active. They're included as inspiration and to show what's been tried before, not as a competitive landscape.

Format: **[Project Name]** (`slug`) - one-line description
- Include the slug for reference
- Note prize placement if applicable
- Highlight notable implementations or approaches

## Archive Insights (3-5 bullets)

Format: **[Source]** - concept and relevance
- Reference cypherpunk/crypto archive sources
- Connect to foundational ideas and their evolution

## Current Landscape

One subsection per research angle:

### [Angle Name]
- **Key players**: Companies, protocols, projects
- **Recent developments**: Funding, launches (2024-2025)
- **Research & standards**: Papers, specifications
- **Maturity**: Emerging | Growing | Established | Saturated

## Key Insights

- **Patterns**: Recurring themes across projects and research
- **Gaps**: Underexplored areas with evidence
- **Trends**: Direction the space is moving

## Opportunities & Gaps

- **Underexplored areas**: Where few projects have been built
- **Emerging niches**: Early-stage but promising
- **Established spaces**: Well-covered areas where differentiation requires a strong angle

---

## Deep Dive: Top Opportunity

Select the **single highest-potential opportunity** from the gaps identified above. Analyze it across these dimensions:

### Market Landscape (REQUIRED)

- **Who are the key players?** Name existing players and their approaches
- **What do they currently offer?** Specific features that address this problem space
- **Landscape classification:** One of:
  - **Open space:** No existing player has meaningfully addressed this. [Evidence]
  - **Differentiation opportunity — Segment:** They don't serve [specific user segment] well because [reason]
  - **Differentiation opportunity — UX:** Feature exists but [specific UX problem]
  - **Differentiation opportunity — Geographic:** Not available/adapted for [specific market]
  - **Differentiation opportunity — Pricing:** Too expensive for [specific segment]
  - **Differentiation opportunity — Integration:** Doesn't compose with [specific ecosystem need]
  - **Well-covered space:** Multiple established players serve this need. Consider adjacent angles: [suggestions]
- **Evidence:** Link to or cite the source that informed this analysis

**Use this landscape research to help the founder find their unique angle and learn from what's been built before.**

### The Problem

- **What is the concrete friction?** Not "gap in market" but the specific pain point (e.g., "businesses wait 60-90 days for invoice payment, can't make payroll")
- **Who experiences this pain?** Specific user persona with context (e.g., "textile manufacturer in Vietnam shipping to H&M")
- **How do they solve it today?** Current workarounds and why they're inadequate
- **What's the quantified impact?** Dollar amounts, time costs, market size with sources

### Revenue Model

- **How does this make money?** Specific fee structure (e.g., "0.5% transaction fee on invoice purchases")
- **Unit economics**: Revenue per transaction/user, margins
- **TAM calculation**: Show the math (e.g., "$17T trade finance market x 0.1% capture x 2% fee = $34M")
- **Comparable business models**: Who else makes money this way? (traditional or crypto)

### Go-to-Market Friction

- **Is this a two-sided marketplace?** If yes, identify both sides clearly
- **Cold start problem**: Which side do you need first? Why would they show up without the other?
- **Bootstrap strategies**:
  - Can you be one side yourself initially? (e.g., be the first buyer/seller)
  - Is there an anchor customer strategy? (one large customer whose network follows)
  - Can you start in a niche vertical?
- **Network effects**: Once bootstrapped, does it get easier or stay hard?

### Founder-Market Fit

- **Ideal founder background**: What specific experience solves the cold start? (e.g., "ex-trade finance banker with anchor buyer relationships")
- **What they bring**: Relationships, expertise, or capital that shortcuts the hard parts
- **Red flags**: Who should NOT build this? (e.g., "pure crypto native with no lending experience")
- **Team composition**: If not solo, what complementary roles are needed?

### Why Crypto/Solana?

- **What does blockchain specifically enable?** Not "decentralization" but concrete capabilities (e.g., "global stablecoin liquidity pools, fractional NFT ownership, instant settlement")
- **Could this be built without crypto?** If yes, what's the crypto advantage?
- **Why Solana specifically?** Speed, cost, ecosystem, or other factors

### Risk Assessment

- **Technical risk**: Is the core technology proven?
- **Regulatory risk**: What jurisdictions matter? What's the compliance path?
- **Market risk**: Is this a "vitamin" (nice to have) or "painkiller" (must have)?
- **Execution risk**: What's the hardest part to get right?

---

## Appendix (Optional): Further Reading

3-5 specific follow-ups: projects to study, communities to join, papers to read, queries to run.

---

Key synthesis rules:
- Use **bullet points**, not tables
- Keep descriptions concise (1-2 sentences max)
- Include project slugs for reference
- Evidence-based observations, not speculation
- Prioritize depth and accuracy over breadth
- Treat `Further Reading` as optional; omit it if needed to complete deep-dive sections
- **Inline citations only.** Cite sources inline in bullets (project slugs, archive titles,
  URLs). Do NOT add a separate "Sources" or "References" section at the end.
  The Appendix (Further Reading) is the only place for additional references.

---
