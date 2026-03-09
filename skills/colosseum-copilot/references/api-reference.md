# API Reference

## API Reference

### Rate Limits

All limits are per-user (keyed by PAT identity). Exceeding a limit returns `429` with `"code": "RATE_LIMITED"` and `"retryable": true`.

| Category | Limit | Applies to |
|----------|-------|------------|
| Search | 30 req/min | `/search/projects`, `/search/archives` |
| Analysis | 10 req/min | `/analyze`, `/compare` |
| Concurrency | 2 in-flight | All data endpoints (`429` with `Retry-After: 1`) |
| PAT issuance | 10 req/min | `POST /api/copilot/auth/token` (per IP) |

**Tip:** The 2-concurrent limit is enforced server-side. Most agent runtimes serialize overflow automatically — submit all your calls and they'll execute in order. If you get repeated `429`s, reduce to sequential calls.

**Fail-closed:** If the concurrency limiter is temporarily unavailable, it returns `503 SERVICE_UNAVAILABLE` rather than allowing unlimited concurrency. This is transient — retry after a brief delay.

### Endpoints

Unless noted, all requests include:

```bash
-H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT"
```

#### GET /filters

Fetch available filters (hackathons, tracks, tags, clusters). Use to translate hackathon or track names into valid slugs/keys and to get canonical hackathon `startDate` values for chronology-sensitive answers.

```bash
curl "$COLOSSEUM_COPILOT_API_BASE/filters" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT"
```

Response includes:
- `tracks[]`: `{ key, name, hackathonSlug, projectCount }`
- `hackathons[]`: `{ slug, name, startDate, projectCount, winnerCount }` — ordered chronologically (oldest first)
- `acceleratorBatches[]`: `{ key, name, companyCount }`
- `prizeTypes[]`: string array of prize category names
- `prizePlacements[]`: integer array of placement ranks
- `problemTags[]`: `{ tag, count }` — top 25 by frequency
- `solutionTags[]`: `{ tag, count }`
- `primitives[]`: `{ tag, count }`
- `techStack[]`: `{ tag, count }`
- `targetUsers[]`: `{ tag, count }`
- `clusters[]`: `{ key, label, projectCount }` — key format `v<N>-c<N>`
- `archiveSources[]`: `{ key, label, documentCount }` — use `key` values in archive `sources` filter

Use this endpoint to discover valid filter values for search requests.

#### POST /search/projects

Primary similarity search for hackathon projects.

Recommended defaults:
- `limit`: 8-12
- `includeFacets`: false (only use when you need aggregate tags)

```bash
curl -X POST "$COLOSSEUM_COPILOT_API_BASE/search/projects" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "privacy wallet for stablecoin users",
    "limit": 10,
    "filters": {
      "winnersOnly": false,
      "acceleratorOnly": false
    }
  }'
```

**Filter parameters** (`filters` object):

| Param | Type | Description |
|-------|------|-------------|
| `winnersOnly` | boolean | Only prize-winning projects |
| `acceleratorOnly` | boolean | Only accelerator portfolio companies |
| `acceleratorBatchKeys` | string[] | Specific accelerator batches (format `accelerator/<batchSlug>`) |
| `prizePlacements` | int[] | Prize placement ranks (e.g., `[1, 2, 3]`) |
| `prizeTypes` | string[] | Prize categories |
| `isUniversityProject` | boolean | University-affiliated projects only |
| `isSolanaMobile` | boolean | Solana Mobile projects only |
| `techStack` | string[] | Filter by tech stack tags |
| `primitives` | string[] | Filter by primitive/protocol tags |
| `problemTags` | string[] | Filter by problem domain tags |
| `solutionTags` | string[] | Filter by solution approach tags |
| `targetUsers` | string[] | Filter by target user segments |
| `clusterKeys` | string[] | Filter by cluster (format `v<N>-c<N>`) |

Discover valid values for tag/cluster/source filters via `GET /filters`.

**Facets** — aggregate tag distributions across the matched set:

- `includeFacets` (boolean, default `false`): enable facet computation. Adds overhead — only use when you need aggregate distributions.
- `facets` (string[], optional): which dimensions to compute. Options: `hackathons`, `tracks`, `prizes`, `problemTags`, `solutionTags`, `primitives`, `techStack`, `clusters`. Omit to compute all 8.
- `facetTopK` (int, 1-20, default `8`): max buckets per dimension.

Response includes `facets.{dimension}[]`: `{ key, label, count, sampleProjectSlugs[] }`.

Note: facets reflect corpus-wide counts scoped to active filters, not just the returned results page.

**Diagnostics** — pass `includeDiagnostics: true` to get search debug info:

Response includes `diagnostics`:
- `modeUsed`: `"vector"`, `"text"`, `"hybrid"`, or `"filters"` — which search mode was used
- `fallbackUsed`: whether text fallback was triggered
- `fallbackReason`: why fallback occurred (if applicable)
- `vectorCandidates`: number of vector search candidates
- `textCandidates`: number of text search candidates
- `tagCandidates`: number of semantic tag matches
- `diversityDropped`: results removed by diversity filter
- `totalFoundIsEstimate`: whether `totalFound` is an estimate (true for query searches)
- `queryExpanded`: the expanded query after synonym expansion
- `effectiveFilters`: the resolved filter values used

Notes:
- `query` is optional; omit it for filter-only browsing (prefer omission over an empty string).
- `limit <= 25`. `offset` applies after ranking/diversity.
- `results[]`: each result includes `hackathon: { name, slug, startDate }` alongside project metadata, tracks, links, evidence, prize, and accelerator fields

**Score interpretation (projects):** Scores reflect hybrid RRF fusion across vector, text, and semantic tag channels — not raw embedding distance. Use relative ranking within a result set (higher = better match) rather than absolute thresholds. When `diagnostics.modeUsed` is `text`, scores represent text relevance (static 0.8). When `hybrid`, scores combine similarity and text rank. Enable `includeDiagnostics: true` to see which mode produced results.

#### POST /search/archives

Search archival documents for conceptual precedents. Search auto-cascades through tiers (vector → chunk text → document text) when a tier returns no results, so empty responses only occur when all tiers are exhausted.

Recommended defaults:
- `limit`: 4-6
- `maxChunksPerDoc`: `1` for exploratory search, `2` for deep-dive passes
- `minSimilarity`: `0.2` (default; lower for broader recall, raise for precision)

```bash
curl -X POST "$COLOSSEUM_COPILOT_API_BASE/search/archives" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "prediction markets governance",
    "limit": 5,
    "maxChunksPerDoc": 1
  }'
```

Response includes:
- `results[]`: `{ documentId, title, author, source, url, publishedAt, similarity, snippet, chunkIndex }`
- `searchTier`: which search method produced results (`vector`, `chunk_text`, or `doc_text`)
- `totalFound`: tier-based count for pagination
- `totalMatched`: FTS corpus match count
- `hasMore`: whether more results exist (`results.length >= limit`)

Notes:
- `limit <= 10`. `limit` controls the number of *documents* returned; each document contributes up to `maxChunksPerDoc` result items, so total items returned can be `limit × maxChunksPerDoc`.
- `offset` applies per document (not per chunk).
- `minSimilarity` (optional, 0–1, default `0.2`): minimum cosine similarity for vector retrieval. Lower values increase recall for niche queries.

**Search tiers:** Archive search auto-cascades through three retrieval tiers:
1. `vector` — embedding similarity (primary, uses cosine distance)
2. `chunk_text` — full-text search on indexed chunks
3. `doc_text` — full-text search on full documents

The `searchTier` response field indicates which tier produced results. Score interpretation varies by tier: `vector` scores are cosine similarity (higher = more similar), while text tier scores are FTS rank values.

**Intent modes:**
- `intent: "docs"` (default) — single-query vector search, optimized for precision
- `intent: "ideation"` — multi-query decomposition for broader recall. Automatically sets `maxChunksPerDoc >= 3`.

**Additional parameters:**
- `maxDocsPerSource` (int, 0-10, default `3`): cap results from any single source. Set `0` for unlimited.
- `minSimilarity` (0-1, default `0.2`): minimum cosine similarity for vector retrieval. Lower for niche queries.

**Limit semantics:** `limit` controls the number of *documents* returned. Each document can have up to `maxChunksPerDoc` chunks, so total result items can exceed `limit`.

**Score interpretation (archives):** Similarity > 0.4 is a strong topical match. 0.2–0.4 is worth reading but verify relevance. < 0.2 is usually tangential — only include if content is clearly relevant despite low score. Scores vary by query breadth: broad queries ("crypto payments") produce higher peaks than niche queries ("zero-knowledge invoice factoring"). When `searchTier` is `chunk_text` or `doc_text`, the result came from text fallback, not vector similarity — prioritize snippet/title relevance over score magnitude in those cases.

**Note:** `publishedAt` can be `null` for some archive documents (undated sources). Handle this field as nullable in any date-based filtering or display logic.

#### GET /archives/:documentId

Fetch a paged archive document slice by `documentId`. Use `offset` + `maxChars` to page through the text.

```bash
curl "$COLOSSEUM_COPILOT_API_BASE/archives/DOCUMENT_UUID?offset=0&maxChars=8000" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT"
```

#### GET /projects/by-slug/:slug

Fetch full details for a project by slug. Use for 1-2 top results when evidence is insufficient.

```bash
curl "$COLOSSEUM_COPILOT_API_BASE/projects/by-slug/your-project-slug" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT"
```

Response includes `hackathon`: `{ name, slug, startDate }` alongside project description, tracks, links, team, prize, repo/media, and semantic tags.

#### POST /analyze

Summarize tag/track distributions for a hackathon set.

```bash
curl -X POST "$COLOSSEUM_COPILOT_API_BASE/analyze" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "cohort": { "hackathons": ["breakout", "radar"], "winnersOnly": true },
    "dimensions": ["tracks", "problemTags"],
    "topK": 5,
    "samplePerBucket": 1
  }'
```

Response shape:
- `totals`: `{ "projects": <number>, "winners": <number> }`
- `buckets`: Object keyed by each requested dimension. Each dimension maps to an array of buckets:
  `{ "key": "<tag>", "label": "<display name>", "count": <number>, "share": <0-1 fraction>, "sampleProjectSlugs": ["slug1", "slug2"] }`

`samplePerBucket` controls how many sample slugs appear per bucket (default: 2, max: 5).

#### POST /compare

Compare two hackathon sets across the same dimensions.

```bash
curl -X POST "$COLOSSEUM_COPILOT_API_BASE/compare" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "cohortA": { "hackathons": ["breakout", "radar"], "winnersOnly": true },
    "cohortB": { "hackathons": ["breakout", "radar"], "winnersOnly": false },
    "dimensions": ["tracks", "problemTags"],
    "topK": 5
  }'
```

#### GET /clusters/:clusterKey

Fetch cluster details by cluster key. Only use when a cluster key is present in results.

```bash
curl "$COLOSSEUM_COPILOT_API_BASE/clusters/v1-c12" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT"
```

Response includes:
- `key`: cluster key (e.g., `v1-c12`)
- `label`: human-readable cluster name
- `summary`: LLM-generated cluster description
- `projectCount`: total projects in cluster
- `winnerCount`: prize-winning projects
- `representativeProjects[]`: `{ slug, name, oneLiner, isWinner }` — sample projects
- `topTags.problemTags[]`: `{ tag, count }` — top problem tags
- `topTags.primitives[]`: `{ tag, count }`
- `topTags.techStack[]`: `{ tag, count }`

### Query Tips

**Archive search:**
- Keep queries to **3-6 focused keywords**. Too short (1-2 words) is vague; too long dilutes embedding similarity (e.g., use `"prediction markets governance"` not `"remailers anonymity mix networks privacy routing onion"`).
- Quality gate: if top results are all pre-2010 and prompt is about modern implementation, re-query with ecosystem-specific terms (`Solana`, `SPL`, `Anchor`, etc.).
- Prefer **3-4 high-quality archive citations** over padding to 5 with tangential references.
- `maxChunksPerDoc`: use `1` for exploratory passes (broad discovery); use `2` for deep-dive passes (Step 7c) when you need richer context from a known-relevant document.
- Archive search auto-cascades (vector → chunk text → doc text) before returning empty. If still empty, try conceptual synonyms (e.g., `"prediction markets"` -> `"futarchy"`).
- Check `searchTier` in the response to understand which tier produced results — `chunk_text` or `doc_text` means vector similarity was too low for the query.

**Project search:**
- Natural language queries work well (`"privacy wallet for stablecoin users"`).
- Use `filters` to narrow by hackathon, track, or tech stack rather than stuffing filter terms into the query.
- `includeFacets: true` adds overhead — only enable when you need aggregate tag distributions.
- `diversify: false` — use this when doing a focused investigation of a specific niche, incumbent, or competitor landscape (e.g., "show me all DEX aggregators"). This disables cross-hackathon diversity ranking and returns results purely by similarity score. Only use for narrow deep-dives, not for broad discovery where cross-hackathon coverage matters.

**Hackathon analysis:**
- `clusters`, `problemTags`, `techStack`: these dimensions exist in the schema but may not be populated for all hackathon sets. If a dimension returns empty, try `tracks` or `problemTags` instead.
- Cross-hackathon compare: use `GET /filters` `hackathons[].startDate` for chronology; track keys are per-hackathon, so track-level comparisons work best within the same hackathon (e.g., winners vs. all).


## Web Search

Use your runtime's most powerful web search tool (WebSearch, Brave Search, Exa, etc.).

Recommended defaults:
- One query per differentiated angle (2-3 queries typical)
- 5-8 results per query

Suggested query patterns:
- `"{idea}" crypto startup funding`
- `"{idea}" production on Solana`
- `"{idea}" DAO governance implementation`
- `"{idea}" research report 2024 2025`
- `"{idea}" protocol standard specification 2024 2025`

## Error Handling

All errors return a JSON body with this shape:
```json
{ "error": "<message>", "code": "<ERROR_CODE>", "retryable": <boolean> }
```

| Status | Code | Retryable | Meaning |
|--------|------|-----------|---------|
| `400` | `INVALID_QUERY` | false | Request validation failed (bad params, unknown fields) |
| `401` | `UNAUTHORIZED` | false | Missing or invalid PAT |
| `403` | `FORBIDDEN` | false | PAT lacks required scope |
| `404` | `NOT_FOUND` | false | Resource not found (project slug, document ID) |
| `429` | `RATE_LIMITED` | true | Rate limit or concurrency limit exceeded. Check `Retry-After` header. |
| `500` | `SERVICE_UNAVAILABLE` | true | Internal server error. Retry after brief delay. |
| `503` | `SERVICE_UNAVAILABLE` | true | Service temporarily unavailable (all search tiers failed, infrastructure transient error). Retry after brief delay. |

For `429`: the `Retry-After` header indicates seconds to wait. Most agent runtimes serialize overflow automatically.
