# Analysis, status and submission fields

Fields used by the v2 skill, checked against the release API on 2026-09-25. This is schema notation, not a sample response. `[optional]` permits omission; `null` is a distinct value; `[default x]` supplies x when omitted. `int` means integer. Array bounds apply to item counts, string bounds to length. Datetimes accept ISO 8601 offsets. Strict request objects reject unknown keys. Optional v2 fields are available with v2 and may be absent on older deployments.

[Endpoint reference](api-reference.md).

## analyzeRequest

```text
cohort: { hackathons: Array<string [min 1]> [optional]; trackKeys: Array<string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]> [optional]; winnersOnly: boolean [optional]; acceleratorOnly: boolean [optional]; acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [optional]; prizePlacements: Array<number [int]> [optional]; clusterKeys: Array<string [pattern /^v\d+-c\d+$/]> [optional]; categoryKeys: Array<v2CategoryKey | "other-emerging" | "insufficient-information"> [min 1, max 10] [optional, V2 only]; includeSecondaryCategories: boolean [optional, V2 only, default false] } [strict]
dimensions: Array<"categories" | "clusters" | "tracks" | "problemTags" | "solutionTags" | "primitives" | "techStack" | "targetUsers">
topK: number [int, min 1, max 43 with "categories" in dimensions; otherwise max 20] [default 10]
samplePerBucket: number [int, min 0, max 5] [default 2]
```

For technology counts, co-usage, trends, and rankings, use the [V2 technology routes](api-technologies.md). Use [project search](api-projects.md#built-with-technology-tags) for project names and evidence.

Category buckets count main groups by default. Set `cohort.includeSecondaryCategories: true` to include runner-up guesses; then `categoryCountsOverlap: true` marks overlapping buckets. Label those counts as overlapping, do not add them for a project total, and do not treat shares as exclusive. To get the complete category breakdown (up to 41 groups and two special buckets) in one request per cohort, call `POST /analyze` with `dimensions: ["categories"]` and `topK: 43`. Other dimensions still return at most 20 buckets. Use empty-query project search with `filters.categoryKeys` for an exact count of a selected group or area. If low-confidence placements materially affect a category count, page through the matching projects and state how many have low confidence for their main group; see [categories and counts](api-projects.md#categories-and-counts).

`totals.winners`, `totalsA.winners` and `totalsB.winners` exclude honorable mentions. Find mentions separately with [`filters.prizeTypes`](api-projects.md#winners-and-honorable-mentions).

## analyzeResponse

```text
categoryCountsOverlap: boolean [optional, V2 only]
totals: { projects: number [int]; winners: number [int] }
buckets: Record<string, Array<{ key: string; label: string; count: number [int]; share: number; sampleProjectSlugs: Array<string> }>>
```

## cohortDefinition

```text
hackathons: Array<string [min 1]> [optional]
trackKeys: Array<string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]> [optional]
winnersOnly: boolean [optional]
acceleratorOnly: boolean [optional]
acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [optional]
prizePlacements: Array<number [int]> [optional]
clusterKeys: Array<string [pattern /^v\d+-c\d+$/]> [optional]
```

`POST /analyze` accepts `cohort.categoryKeys`; `POST /compare` rejects `"categories"` and category keys. For per-hackathon counts of selected category keys, use one empty-query project search with `filters.categoryKeys`, `includeFacets: true`, and `facets: ["hackathons"]`. Avoid a per-hackathon analysis loop; narrow a full category-by-hackathon cross-tab if one aggregate call cannot supply it. Neither analysis nor comparison cohorts accept `prizeTypes`.

## compareRequest

```text
cohortA: cohortDefinition
cohortB: cohortDefinition
dimensions: Array<"clusters" | "tracks" | "problemTags" | "solutionTags" | "primitives" | "techStack" | "targetUsers">
topK: number [int, min 1, max 20] [default 10]
```

## compareResponse

```text
totalsA: { projects: number [int]; winners: number [int] }
totalsB: { projects: number [int]; winners: number [int] }
results: Record<string, Array<{ key: string; label: string; countA: number [int]; shareA: number; countB: number [int]; shareB: number; lift: number; delta: number; examplesA: Array<string>; examplesB: Array<string> }>>
```

## sourceSuggestionRequest

```text
url: string [url]
name: string [max 200] [optional]
reason: string [max 500] [optional]
```

## feedbackRequest

```text
category: "error" | "quality" | "suggestion" | "other"
message: string [trim, min 1, max 5000]
context: Record<string, unknown> [optional]
severity: "low" | "medium" | "high" | "critical" [default "medium"]
```

## statusResponse

```text
authenticated: boolean
expiresAt: string | null
scope: string | null
sessionSharingEnabled: boolean [optional, V2 sign-in; true only if opted in]
```
