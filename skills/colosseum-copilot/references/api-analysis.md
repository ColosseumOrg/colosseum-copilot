# Analysis, status and submission fields

Fields used by the v2 skill, checked against the release API on 2026-09-24. This is schema notation, not a sample response. `[optional]` permits omission; `null` is a distinct value; `[default x]` supplies x when omitted. `int` means integer. Array bounds apply to item counts, string bounds to length. Datetimes accept ISO 8601 offsets. Strict request objects reject unknown keys. Optional v2 fields are available with v2 and may be absent on older deployments.

[Endpoint reference](api-reference.md).

## analyzeRequest

```text
cohort: { hackathons: Array<string [min 1]> [optional]; trackKeys: Array<string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]> [optional]; winnersOnly: boolean [optional]; acceleratorOnly: boolean [optional]; acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [optional]; prizePlacements: Array<number [int]> [optional] } [strict]
dimensions: Array<"categories" | "tracks" | "problemTags" | "solutionTags" | "primitives" | "techStack" | "targetUsers">
topK: number [int, min 1, max 20] [default 10]
samplePerBucket: number [int, min 0, max 5] [default 2]
```

For technology counts, use [project search](api-projects.md#built-with-technology-tags) with an empty query, `filters.builtWith`, and the requested hackathon scope. Inspect `totalFound` and its diagnostics before reporting a count; inspect project details for tag evidence. Run separate searches for each hackathon when comparing recorded technology use over time.

Category buckets count main and secondary groups, so buckets overlap. Never add them or treat `share` as exclusive. `topK` returns at most 20 buckets. Use empty-query project search with `filters.categoryKeys` for exact counts, listing the group keys to cover an area.

`totals.winners`, `totalsA.winners` and `totalsB.winners` include honorable mentions. Report them separately from prize winners using the [`filters.prizeTypes` searches](api-projects.md#winners-and-honorable-mentions).

## analyzeResponse

```text
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
```

`POST /compare` rejects `"categories"`. For category trends, use an empty-query project search per hackathon with the same `filters.categoryKeys`. Analysis and comparison cohorts do not accept `categoryKeys` or `prizeTypes`.

## compareRequest

```text
cohortA: cohortDefinition
cohortB: cohortDefinition
dimensions: Array<"tracks" | "problemTags" | "solutionTags" | "primitives" | "techStack" | "targetUsers">
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
sessionSharingEnabled: boolean [optional, V2 session sharing]
```
