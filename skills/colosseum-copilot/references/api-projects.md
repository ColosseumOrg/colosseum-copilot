# Project API fields

Fields used by the v2 skill. This is schema notation, not a sample response. `[optional]` permits omission; `null` is a distinct value; `[default x]` supplies x when omitted. `int` means integer. Array bounds apply to item counts, string bounds to length. Datetimes accept ISO 8601 offsets. Strict request objects reject unknown keys.

[Endpoint reference](api-reference.md).

## searchProjectsRequest

```text
query: string [trim, max 500] [optional] [default ""]
hackathons: Array<string [min 1]> [max 10] [optional]
trackKeys: Array<string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]> [max 10] [optional]
labelKeys: Array<string [pattern /^label:[a-z0-9-]+\/[a-z0-9-]+$/]> [max 10] [optional]
limit: number [int, min 1, max 25] [default 10]
offset: number [int, min 0] [default 0]
filters: { categoryKeys: Array<v2CategoryKey | "other-emerging" | "insufficient-information"> [min 1, max 10] [optional, V2 only]; includeSecondaryCategories: boolean [optional, V2 only, default false]; builtWith: builtWithFilters [optional]; winnersOnly: boolean [optional]; acceleratorOnly: boolean [optional]; acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [max 10] [optional]; prizePlacements: Array<number [int]> [optional]; prizeTypes: Array<string> [max 10] [optional]; isUniversityProject: boolean [optional]; isSolanaMobile: boolean [optional]; techStack: Array<string> [max 10] [optional]; primitives: Array<string> [max 10] [optional]; problemTags: Array<string> [max 10] [optional]; solutionTags: Array<string> [max 10] [optional]; targetUsers: Array<string> [max 10] [optional] } [strict] [optional]
diversify: boolean [optional] [default false]
includeFacets: boolean [optional] [default false]
facets: Array<"categories" | "hackathons" | "tracks" | "labels" | "clusters" | "prizes" | "problemTags" | "solutionTags" | "primitives" | "techStack"> [optional]
facetTopK: number [int, min 1, max 43 with includeFacets and "categories" in facets; otherwise max 20] [optional] [default 8]
includeDiagnostics: boolean [optional] [default false]
```

Use `labelKeys` from `GET /filters` or the `labels` facet for submission labels. Do not combine `trackKeys` and `labelKeys`. `tracks` lists the prize tracks a project entered, not the one it won. The winning track is `prize.trackName`; to list a track's winners, filter `winnersOnly` results by `prize.trackName`. Hackathons without track prizes use `labels`. An `ambiguous` classification exposes neither. A `trackKeys` filter for a hackathon without track prizes is rejected.

## Winners and honorable mentions

In V2, `filters.winnersOnly: true`, detail `isWinner`, `winnerCount`, and analysis `winners` count prize winners and exclude honorable mentions. `award` is `winner`, `honorable_mention`, or `null`. Honorable mentions carry `prize.type: "HONORABLE_MENTION"` with no amount; they are recognitions, never wins. Frontier had no tracks: its 25 `TRACK_PRIZE` awards named `Winner` are its top-25 awards, not track prizes. To count mentions separately, use an empty query with `filters.prizeTypes: ["HONORABLE_MENTION"]` and read `totalFound`. Keep the same hackathon and other filters for both counts.

## Categories and counts

Call `GET /categories` for the current 41 groups in six areas, their keys and definitions, and the two named buckets. Do not use a hardcoded list. `filters.categoryKeys` accepts one to ten group or bucket keys. Listed keys are alternatives. By default, a project matches through its main group only. Set `filters.includeSecondaryCategories: true` to match its related second group too. To cover an area, list its group keys, not the area key.

Category facets and `/analyze` count main groups by default. Set `includeSecondaryCategories: true` in search `filters` or analysis `cohort` to count runner-up guesses too. Then buckets overlap; label those counts as overlapping, do not add them for a project total, and do not treat `share` as exclusive. `categoryCountsOverlap` reports whether the option was used. Category facets accept `facetTopK: 43`; other facets remain capped at 20. For all category counts in one request per cohort, prefer `POST /analyze` with `dimensions: ["categories"]` and `topK: 43`. A missing bucket with a lower limit does not establish zero projects.

For an exact count of selected keys, use `POST /search/projects` with `query: ""` and `filters.categoryKeys`, then read `totalFound`. The count includes each matching project once even if several selected keys match it. Add `includeFacets: true`, `facets: ["hackathons"]`, and `facetTopK: 20` to get per-hackathon counts for those keys in the same search; omitted facet buckets are unknown, not zero. If low-confidence placements materially affect the count, paginate all matching projects and say how many have `categories.confidence: "low"` for their main group. Facets and `/analyze` do not provide a confidence breakdown; secondary groups have no separate confidence. For "who has tried X" lists, include secondary groups, paginate, deduplicate projects, and label the list "including runner-up guesses." Do not loop over categories or hackathons for counts; narrow a cross-tab the API cannot return in one aggregate request. `/analyze` accepts `cohort.categoryKeys`; `/compare` rejects `"categories"` and does not accept category keys.

All published assignments count, including low-confidence ones. In a returned `categories` object, `primaryKey` is a group key, `other-emerging`, or `insufficient-information`; `secondaryKey` is a distinct group key or `null` and has no separate confidence field. `confidence` describes only the main group; it is an agreement level, not a calibrated probability. For high confidence, say the project is classified in that group. For medium, say it likely belongs there and mention the second group if present. For low, call the placement tentative, explain that evidence is thin or ambiguous, and inspect the project before drawing a conclusion. Never quote confidence as a percentage or treat it as project quality. `categories: null` means "not yet categorized," often for a new project. The `insufficient-information` bucket means the available record does not say what the product does; `other-emerging` means the product does not clearly fit a current group. For "how many AI projects," use technology tags: job categories omit AI projects doing other jobs. Renaissance and Radar (2024) were classified from descriptions alone. A missing summary says nothing about a project's quality. Inspect a low-confidence winner or accelerator company before describing its category. If category data is temporarily unavailable, category filters, facets and analysis return `503 CATEGORIES_UNAVAILABLE`; `GET /categories` still works.

Facets need `includeFacets: true`. Always list the facets you want in `facets`, including `"categories"`; the default set omits categories. They count everything matching the filters and ignore the query. With a query, `totalFound` is offset plus returned results, plus one if more exist; never report it as a count. With an empty query, it is the exact filtered project count. Check `filtersApplied` before reporting the population.

## Built with technology tags

`builtWith` describes technology evidence found in a project's code tree at capture time. It is derived from a repository summary and can be available even when the full repository summary is unavailable. It does not describe architecture or establish that an integration is deployed, active, or maintained today.

Project details return the full record, with at most 100 tags per category. Each tag has a canonical display `name`. When the project's repository was confirmed public, each tag also has a `confidence` from 0 to 1 and an `evidence` quote of at most 120 characters from the source summary; otherwise tags contain only `name`. A `version` appears only when the source states it. Chain tags may include `network`, one of `mainnet`, `devnet`, `testnet`, `localnet`, or `unknown`, and `source: "inferred"` when the chain was inferred rather than found in the code. Tags exclude architecture, endpoints, file paths, secrets, and business terms.

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
confidence: number [min 0, max 1] [optional, absent when the repository is not confirmed public]
evidence: string [max 120] [optional, absent when the repository is not confirmed public]
```

### repositoryChainTag

Includes the `repositoryTag` fields and:

```text
network: "mainnet" | "devnet" | "testnet" | "localnet" | "unknown" [optional]
source: "inferred" [optional]
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

Use `filters.builtWith` for exact canonical-name matches. Matching trims whitespace and ignores case. It combines categories with AND and names within a category with OR. The category key groups names but doesn't restrict the match. Inspect project details for canonical names; matching does not resolve arbitrary aliases. These filters are separate from the existing `techStack` tags. Technology filtering requires a v2 sign-in.

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

If repository technology data is temporarily unavailable, technology filters return `503 EVIDENCE_UNAVAILABLE`; retry later.

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
categories: { version: string; primaryKey: v2CategoryKey | "other-emerging" | "insufficient-information"; confidence: "high" | "medium" | "low"; secondaryKey: v2CategoryKey | null } | null [optional, V2 only]
slug: string
name: string
oneLiner: string | null
similarity: number
hackathon: { name: string; slug: string; startDate: string }
tracks: Array<{ name: string; key: string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/] }>
labels: Array<string>
trackClassification: "prize_tracks" | "submission_labels" | "ambiguous"
award: "winner" | "honorable_mention" | null
crowdedness: number [int] | null
cluster: { key: string [pattern /^v\d+-c\d+$/]; label: string } | null
links: { github: string | null; demo: string | null; presentation: string | null; technicalDemo: string | null; twitter: string | null; colosseum: string | null; repoPublic: boolean [optional] }
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
missingVectorProjects: number [int] [optional]
missingVectorMatches: number [int] [optional]
totalFoundIsEstimate: boolean
queryExpanded: string
effectiveFilters: Record<string, unknown>
```

## searchProjectsResponse

```text
categoryCountsOverlap: boolean [optional, V2 only]
results: Array<projectSearchResult>
filtersApplied: { hackathons: Array<string> [optional]; trackKeys: Array<string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]> [optional]; labelKeys: Array<string [pattern /^label:[a-z0-9-]+\/[a-z0-9-]+$/]> [optional]; filters: { categoryKeys: Array<v2CategoryKey | "other-emerging" | "insufficient-information"> [min 1, max 10] [optional, V2 only]; includeSecondaryCategories: boolean [optional, V2 only]; builtWith: builtWithFilters [optional]; winnersOnly: boolean [optional]; acceleratorOnly: boolean [optional]; acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [max 10] [optional]; prizePlacements: Array<number [int]> [optional]; prizeTypes: Array<string> [max 10] [optional]; isUniversityProject: boolean [optional]; isSolanaMobile: boolean [optional]; techStack: Array<string> [max 10] [optional]; primitives: Array<string> [max 10] [optional]; problemTags: Array<string> [max 10] [optional]; solutionTags: Array<string> [max 10] [optional]; targetUsers: Array<string> [max 10] [optional] } [strict] [optional] }
totalFound: number [int]
hasMore: boolean
facets: { categories: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; clusters: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; hackathons: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; tracks: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; labels: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; prizes: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; problemTags: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; solutionTags: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; primitives: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; techStack: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional] } [optional]
diagnostics: searchDiagnostics [optional]
```

## getProjectBySlugParams

```text
slug: string
```

## projectDetails

```text
builtWith: repositoryTags | null [optional]
categories: { version: string; primaryKey: v2CategoryKey | "other-emerging" | "insufficient-information"; confidence: "high" | "medium" | "low"; secondaryKey: v2CategoryKey | null } | null [optional, V2 only]
evidenceSummaries: projectEvidence [optional]
corpusRevision: string [optional]
freshness: projectFreshness [optional]
slug: string
name: string
description: string | null
oneLiner: string | null
hackathon: { name: string; slug: string; startDate: string }
tracks: Array<{ name: string; key: string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/] }>
labels: Array<string>
trackClassification: "prize_tracks" | "submission_labels" | "ambiguous"
award: "winner" | "honorable_mention" | null
cluster: { key: string [pattern /^v\d+-c\d+$/]; label: string } | null
links: { github: string | null; demo: string | null; presentation: string | null; technicalDemo: string | null; twitter: string | null; colosseum: string | null; repoPublic: boolean [optional] }
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
labels: Array<{ key: string [pattern /^label:[a-z0-9-]+\/[a-z0-9-]+$/]; name: string; hackathonSlug: string; projectCount: number }>
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
clusters: Array<{ key: string [pattern /^v\d+-c\d+$/]; label: string; projectCount: number [int] }>
```
