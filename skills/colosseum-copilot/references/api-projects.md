# Project API fields

Fields used by the v2 skill, checked against the release API on 2026-09-24. This is schema notation, not a sample response. `[optional]` permits omission; `null` is a distinct value; `[default x]` supplies x when omitted. `int` means integer. Array bounds apply to item counts, string bounds to length. Datetimes accept ISO 8601 offsets. Strict request objects reject unknown keys. Optional v2 fields are available with v2 and may be absent on older deployments.

[Endpoint reference](api-reference.md).

## searchProjectsRequest

```text
query: string [trim, max 500] [optional] [default ""]
hackathons: Array<string [min 1]> [max 10] [optional]
trackKeys: Array<string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]> [max 10] [optional]
limit: number [int, min 1, max 25] [default 10]
offset: number [int, min 0] [default 0]
filters: { categoryKeys: Array<v2CategoryKey | "other-emerging" | "insufficient-information"> [min 1, max 10] [optional, V2 only]; includeSecondaryCategories: boolean [optional, default false, V2 only]; builtWith: builtWithFilters [optional]; winnersOnly: boolean [optional]; acceleratorOnly: boolean [optional]; acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [max 10] [optional]; prizePlacements: Array<number [int]> [optional]; prizeTypes: Array<string> [max 10] [optional]; isUniversityProject: boolean [optional]; isSolanaMobile: boolean [optional]; techStack: Array<string> [max 10] [optional]; primitives: Array<string> [max 10] [optional]; problemTags: Array<string> [max 10] [optional]; solutionTags: Array<string> [max 10] [optional]; targetUsers: Array<string> [max 10] [optional] } [strict] [optional]
diversify: boolean [optional] [default true]
includeFacets: boolean [optional] [default false]
facets: Array<"categories" | "hackathons" | "tracks" | "prizes" | "problemTags" | "solutionTags" | "primitives" | "techStack"> [optional]
facetTopK: number [int, min 1, max 20] [optional] [default 8]
includeDiagnostics: boolean [optional] [default false]
```

## Winners and honorable mentions

`filters.winnersOnly: true` includes prize winners and honorable mentions. Honorable mentions (`prize.type: "HONORABLE_MENTION"`) are not winners, even though `winnersOnly`, `isWinner`, `winnerCount` and `winners` include them. Call them honorable mentions.

To count prize winners, use an empty query and `filters.prizeTypes` containing every type returned by `GET /filters` except `HONORABLE_MENTION`, then read `totalFound`. To count honorable mentions separately, use `filters.prizeTypes: ["HONORABLE_MENTION"]`. Keep the same hackathon and other filters for both counts. Prize types do not change the default relevance ranking.

## Categories and counts

Call `GET /categories` for six areas, 41 groups and their definitions. `filters.categoryKeys` accepts one to ten group keys, including `other-emerging` and `insufficient-information`. Keys match main groups by default. Set `filters.includeSecondaryCategories: true` to include runner-up guesses in search results, totals and facets. Such responses return `categoryCountsOverlap: true`; label counts as overlapping and discovery lists as “including runner-up guesses.” Area keys are not filter keys.

For an exact count, use an empty-query search and read `totalFound`. For trends, run one search per hackathon. Analysis accepts `cohort.categoryKeys` and `cohort.includeSecondaryCategories`; the default is main groups only. `/compare` rejects categories.

All published assignments count, including low confidence. `categories: null` means “not yet categorized.” Other means no group fits; insufficient information means the public description and summaries do not say what the product does. `confidence` is `high`, `medium` or `low`, an agreement level rather than a calibrated probability. The second group means “also related” and has no separate confidence field.

For “how many AI projects,” use technology tags; job categories omit AI projects doing other jobs. Renaissance and Radar (2024) were classified from descriptions alone. Missing summaries do not mean junk, and low-confidence winners and accelerator companies merit review.

Without V2 sign-in, categories return `403 INSUFFICIENT_SCOPE`. `GET /categories` works before publication; category filters, facets and analysis return `503 CATEGORIES_UNAVAILABLE` until a map is published.

Facets need `includeFacets: true`. Always list the facets you want in `facets`, including `"categories"`; the default set omits categories. They count everything matching the filters and ignore the query. With a query, `totalFound` is offset plus returned results, plus one if more exist; never report it as a count. With an empty query, it is the exact filtered project count. Check `filtersApplied` before reporting the population.

## Built with technology tags

`builtWith` describes technology evidence found in a project's code tree at capture time. It is derived from a repository summary and can be available even when the full repository summary is unavailable. It does not describe architecture or establish that an integration is deployed, active, or maintained today.

Project details return the full record, with at most 100 tags per category. Each tag has a canonical display `name`, a `confidence` from 0 to 1, and an `evidence` quote of at most 120 characters from the source summary. A `version` appears only when the source states it. Chain tags may include `network`, one of `mainnet`, `devnet`, `testnet`, `localnet`, or `unknown`. Tags exclude architecture, endpoints, file paths, secrets, and business terms.

`builtWith: null` means no record is available. An empty category array means the available record identified no technology in that category; it does not prove the project uses none. Search results contain only names, capped at 10 per category. Fetch project details to inspect confidence, evidence, and the complete record.

### repositoryTags

```text
schemaVersion: 1
languages: Array<repositoryTag> [max 100]
frameworks: Array<repositoryTag> [max 100]
chains: Array<repositoryChainTag> [max 100]
protocols: Array<repositoryTag> [max 100]
services: Array<repositoryTag> [max 100]
tooling: Array<repositoryTag> [max 100]
standards: Array<repositoryTag> [max 100]
```

### repositoryTag

```text
name: string [trim, min 1, max 100]
version: string [trim, min 1, max 100] [optional]
confidence: number [min 0, max 1]
evidence: string [max 120]
```

### repositoryChainTag

Includes the `repositoryTag` fields and:

```text
network: "mainnet" | "devnet" | "testnet" | "localnet" | "unknown" [optional]
```

### compactBuiltWith

```text
languages: Array<string [trim, min 1, max 100]> [max 10]
frameworks: Array<string [trim, min 1, max 100]> [max 10]
chains: Array<string [trim, min 1, max 100]> [max 10]
protocols: Array<string [trim, min 1, max 100]> [max 10]
services: Array<string [trim, min 1, max 100]> [max 10]
tooling: Array<string [trim, min 1, max 100]> [max 10]
standards: Array<string [trim, min 1, max 100]> [max 10]
```

### builtWithFilters

```text
languages: Array<string [trim, min 1, max 100]> [max 20] [optional]
frameworks: Array<string [trim, min 1, max 100]> [max 20] [optional]
chains: Array<string [trim, min 1, max 100]> [max 20] [optional]
protocols: Array<string [trim, min 1, max 100]> [max 20] [optional]
services: Array<string [trim, min 1, max 100]> [max 20] [optional]
tooling: Array<string [trim, min 1, max 100]> [max 20] [optional]
standards: Array<string [trim, min 1, max 100]> [max 20] [optional]
```

Use `filters.builtWith` for exact canonical-name matches. Matching trims whitespace and ignores case. It combines categories with AND and names within a category with OR. Inspect project details for canonical names; matching does not resolve arbitrary aliases. These filters are separate from the existing `techStack` tags. Technology filtering requires a v2 sign-in.

For example, `POST /search/projects` finds projects tagged with Solana and either Kamino Lend or Jupiter:

```json
{
  "query": "",
  "hackathons": ["cypherpunk"],
  "filters": {
    "builtWith": {
      "chains": ["Solana"],
      "protocols": ["Kamino Lend", "Jupiter"]
    }
  },
  "includeDiagnostics": true,
  "limit": 10
}
```

Use `totalFound` for the filtered project count and check `diagnostics.totalFoundIsEstimate` when present. Fetch project details to inspect the complete technology record and its evidence. Missing tags do not establish that a project uses none.

A v2 technology filter returns `503 EVIDENCE_UNAVAILABLE` while repository evidence checks are not current; retry later. A v1 PAT sending `filters.builtWith` gets `400 INVALID_QUERY`; sign in with the new helper or search without the technology filter.

## projectEvidenceSummary

```text
text: string [max 12000]
truncated: boolean
sourceUrl: string [url] | null
sourceRevision: string
sourceCapturedAt: string [datetime] | null
generatedAt: string [datetime] | null
indexedAt: string [datetime]
capturedAt: string [datetime] | null
sourceInferred: boolean
evidenceId: string | null
extractorVersion: string
```

Project details return the permitted summary for each available kind, preserving Markdown up to 12,000 characters. `truncated` is true only when that limit cuts off text. These summaries describe the sources; raw source files and full derived materials are not distributed.

`sourceUrl` points to the project's public GitHub repository, presentation, or technical demo for the corresponding summary, or is null when no valid link is known. The linked page may have changed since capture. `evidenceId` identifies the summary independently of that link; it is null for older evidence without a summary identifier. `sourceRevision` identifies the revision associated with the evidence.

`sourceCapturedAt` dates source capture. For older sources without a capture date, it uses the stored source's last-modified date when known. `capturedAt` is a compatibility alias with the same nullable value. `generatedAt` dates summary creation and is null when unknown. `indexedAt` dates Copilot ingestion or its most recent provenance refresh. `sourceInferred` is true when the source association was inferred from the only matching source kind rather than explicitly declared.

Search results omit `evidenceSummaries` to keep multi-project responses bounded. Use each result's slug with `GET /projects/by-slug/:slug` to read its summaries. Search still returns match snippets in `evidence` and optional freshness metadata.

## projectEvidence

```text
repoSummary: projectEvidenceSummary | null
pitchSummary: projectEvidenceSummary | null
demoSummary: projectEvidenceSummary | null
```

## projectFreshness

```text
projectsSyncedAt: string [datetime] | null
embeddingsVersion: string | null
archiveIngestedAt: string [datetime] | null
```

## projectSearchResult

```text
builtWith: compactBuiltWith | null [optional]
categories: { version: string; primaryKey: v2CategoryKey | "other-emerging" | "insufficient-information"; secondaryKey: v2CategoryKey | null; confidence: "high" | "medium" | "low" } | null [optional, V2 only]
slug: string
name: string
oneLiner: string | null
similarity: number
hackathon: { name: string; slug: string; startDate: string }
tracks: Array<{ name: string; key: string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/] }>
links: { github: string | null; demo: string | null; presentation: string | null; technicalDemo: string | null; twitter: string | null; colosseum: string | null }
evidence: Array<string> [max 2]
corpusRevision: string [optional]
freshness: projectFreshness [optional]
prize: { type: string; name: string | null; placement: number [int] | null; amount: number | null; trackName: string | null } | null
metrics: { updatesCount: number [int] }
team: { count: number [int] }
tags: { problemTags: Array<string> [max 10]; solutionTags: Array<string> [max 10]; primitives: Array<string> [max 10]; techStack: Array<string> [max 10]; targetUsers: Array<string> [max 10] } | null
accelerator: { companySlug: string | null; companyName: string | null; batchKey: string [pattern /^accelerator\/[a-z0-9-]+$/]; batchName: string } | null
```

## searchDiagnostics

```text
modeUsed: "vector" | "text" | "hybrid" | "filters"
fallbackUsed: boolean
fallbackReason: string [optional]
vectorCandidates: number [int]
textCandidates: number [int]
tagCandidates: number [int]
diversityDropped: number [int]
totalFoundIsEstimate: boolean
queryExpanded: string
effectiveFilters: Record<string, unknown>
```

## searchProjectsResponse

```text
results: Array<projectSearchResult>
filtersApplied: { hackathons: Array<string> [optional]; trackKeys: Array<string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]> [optional]; filters: { categoryKeys: Array<v2CategoryKey | "other-emerging" | "insufficient-information"> [min 1, max 10] [optional, V2 only]; includeSecondaryCategories: boolean [optional, default false, V2 only]; builtWith: builtWithFilters [optional]; winnersOnly: boolean [optional]; acceleratorOnly: boolean [optional]; acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [max 10] [optional]; prizePlacements: Array<number [int]> [optional]; prizeTypes: Array<string> [max 10] [optional]; isUniversityProject: boolean [optional]; isSolanaMobile: boolean [optional]; techStack: Array<string> [max 10] [optional]; primitives: Array<string> [max 10] [optional]; problemTags: Array<string> [max 10] [optional]; solutionTags: Array<string> [max 10] [optional]; targetUsers: Array<string> [max 10] [optional] } [strict] [optional] }
totalFound: number [int]
hasMore: boolean
facets: { categories: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; hackathons: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; tracks: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; prizes: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; problemTags: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; solutionTags: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; primitives: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; techStack: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional] } [optional]
diagnostics: searchDiagnostics [optional]
```

## getProjectBySlugParams

```text
slug: string
```

## projectDetails

```text
builtWith: repositoryTags | null [optional]
categories: { version: string; primaryKey: v2CategoryKey | "other-emerging" | "insufficient-information"; secondaryKey: v2CategoryKey | null; confidence: "high" | "medium" | "low" } | null [optional, V2 only]
evidenceSummaries: projectEvidence [optional]
corpusRevision: string [optional]
freshness: projectFreshness [optional]
slug: string
name: string
description: string | null
oneLiner: string | null
hackathon: { name: string; slug: string; startDate: string }
tracks: Array<{ name: string; key: string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/] }>
links: { github: string | null; demo: string | null; presentation: string | null; technicalDemo: string | null; twitter: string | null; colosseum: string | null }
team: { count: number [int]; members: Array<{ displayName: string | null; username: string | null; githubHandle: string | null; twitterHandle: string | null }> }
isWinner: boolean
accelerator: { companySlug: string | null; companyName: string | null; batchKey: string [pattern /^accelerator\/[a-z0-9-]+$/]; batchName: string } | null
createdAt: string
tags: { problemTags: Array<string> [max 10]; solutionTags: Array<string> [max 10]; primitives: Array<string> [max 10]; techStack: Array<string> [max 10]; targetUsers: Array<string> [max 10] } | null
metrics: { updatesCount: number [int] } | null
prize: { type: string; name: string | null; placement: number [int] | null; amount: number | null; trackName: string | null } | null
```

## filtersResponse

```text
tracks: Array<{ key: string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]; name: string; hackathonSlug: string; projectCount: number }>
hackathons: Array<{ slug: string; name: string; startDate: string; projectCount: number; winnerCount: number }>
acceleratorBatches: Array<{ key: string [pattern /^accelerator\/[a-z0-9-]+$/]; name: string; companyCount: number [int] }>
prizeTypes: Array<string>
prizePlacements: Array<number [int]>
problemTags: Array<{ tag: string; count: number [int] }>
solutionTags: Array<{ tag: string; count: number [int] }>
primitives: Array<{ tag: string; count: number [int] }>
techStack: Array<{ tag: string; count: number [int] }>
targetUsers: Array<{ tag: string; count: number [int] }>
archiveSources: Array<{ key: string; label: string; documentCount: number [int] [optional] }>
```
