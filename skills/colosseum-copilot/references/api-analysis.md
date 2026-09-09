# Analysis, status and submission fields

Field definitions generated from the shared v2 contract, reviewed 2026-09-08. This is schema notation, not a sample response. `[optional]` permits omission; `null` is a distinct value; `[default x]` supplies x when omitted. `int` means integer. Array bounds apply to item counts, string bounds to length. Datetimes accept ISO 8601 offsets. Strict request objects reject unknown keys. Optional v2 fields are available with v2 and may be absent on older deployments.

[Endpoint reference](api-reference.md).

## analyzeRequest

```text
cohort: { hackathons: Array<string [min 1]> [optional]; trackKeys: Array<string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]> [optional]; winnersOnly: boolean [optional]; acceleratorOnly: boolean [optional]; acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [optional]; prizePlacements: Array<number [int]> [optional]; clusterKeys: Array<string [pattern /^v\d+-c\d+$/]> [optional] } [strict]
dimensions: Array<"tracks" | "problemTags" | "solutionTags" | "primitives" | "techStack" | "targetUsers" | "clusters">
topK: number [int, min 1, max 20] [default 10]
samplePerBucket: number [int, min 0, max 5] [default 2]
```

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
clusterKeys: Array<string [pattern /^v\d+-c\d+$/]> [optional]
```

## compareRequest

```text
cohortA: cohortDefinition
cohortB: cohortDefinition
dimensions: Array<"tracks" | "problemTags" | "solutionTags" | "primitives" | "techStack" | "targetUsers" | "clusters">
topK: number [int, min 1, max 20] [default 10]
```

## compareResponse

```text
totalsA: { projects: number [int]; winners: number [int] }
totalsB: { projects: number [int]; winners: number [int] }
results: Record<string, Array<{ key: string; label: string; countA: number [int]; shareA: number; countB: number [int]; shareB: number; lift: number; delta: number; examplesA: Array<string>; examplesB: Array<string> }>>
```

## getClusterDetailsParams

```text
key: string [pattern /^v\d+-c\d+$/]
```

## clusterDetails

```text
key: string [pattern /^v\d+-c\d+$/]
label: string
summary: string
projectCount: number [int]
winnerCount: number [int]
representativeProjects: Array<{ slug: string; name: string; oneLiner: string; isWinner: boolean }>
topTags: { problemTags: Array<{ tag: string; count: number [int] }>; primitives: Array<{ tag: string; count: number [int] }>; techStack: Array<{ tag: string; count: number [int] }> }
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
scopes: Array<"copilot:retrieval" | "copilot:telemetry" | "copilot:self-data" | "evidence:read" | "profile:read" | "telemetry:write" | "self-data:read" | "projects:updates:write" | "submissions:write">
capabilities: { deviceFlow: boolean; pkce: boolean; evidence: boolean; embeddingV2: boolean; reranker: boolean; frames: boolean } [strict]
```
