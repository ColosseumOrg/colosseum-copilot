# Analysis, status and submission fields

Field definitions generated from the shared v2 contract, reviewed 2026-09-09. This is schema notation, not a sample response. `[optional]` permits omission; `null` is a distinct value; `[default x]` supplies x when omitted. `int` means integer. Array bounds apply to item counts, string bounds to length. Datetimes accept ISO 8601 offsets. Strict request objects reject unknown keys. Optional v2 fields are available with v2 and may be absent on older deployments.

[Endpoint reference](api-reference.md).

## analyzeRequest

```text
cohort: { builtWith: builtWithFilters [optional]; hackathons: Array<string [min 1]> [optional]; trackKeys: Array<string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]> [optional]; winnersOnly: boolean [optional]; acceleratorOnly: boolean [optional]; acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [optional]; prizePlacements: Array<number [int]> [optional]; clusterKeys: Array<string [pattern /^v\d+-c\d+$/]> [optional] } [strict]
dimensions: Array<"tracks" | "problemTags" | "solutionTags" | "primitives" | "techStack" | "targetUsers" | "clusters" | "builtWith">
topK: number [int, min 1, max 20] [default 10]
samplePerBucket: number [int, min 0, max 5] [default 2]
cooccurrence: builtWithTechnology [optional]
builtWithTrend: { technologies: Array<builtWithTechnology> [min 1, max 10]; hackathonLimit: number [int, min 1, max 50] [default 20] } [strict] [optional]
```

## Built with analysis

Use the `builtWith` dimension to count technologies in a scoped cohort. The same seven categories as project search apply: `languages`, `frameworks`, `chains`, `protocols`, `services`, `tooling`, and `standards`. `cohort.builtWith` accepts the built-with filters described in the [project API reference](api-projects.md), with at most 20 names per category. Names match after trimming whitespace and ignoring case; categories combine with AND and names within a category with OR.

`POST /analyze` returns technology buckets for this request:

```json
{
  "cohort": { "hackathons": ["cypherpunk"] },
  "dimensions": ["builtWith"],
  "topK": 10,
  "samplePerBucket": 2
}
```

Each `buckets.builtWith` item uses `category:lowercase-name` as its key, such as `frameworks:anchor`. `count` counts distinct projects with that technology. `share` is `count / totals.projects`, including projects without a built-with record in the denominator. A project can have several technologies, so shares need not sum to 1. `topK` caps this dimension at 20 buckets in total, not 20 per category.

### Co-occurring technologies

Add `cooccurrence` to ask what projects using one technology also use. This request counts other technologies among Kamino Lend projects in the selected hackathon:

```json
{
  "cohort": { "hackathons": ["cypherpunk"] },
  "dimensions": [],
  "cooccurrence": { "category": "protocols", "name": "Kamino Lend" },
  "topK": 10,
  "samplePerBucket": 2
}
```

The response includes `cooccurrence.anchor`, `cooccurrence.projects`, and `cooccurrence.buckets`. `projects` is the number of scoped projects matching the anchor technology. Bucket `share` divides its distinct project count by that number. The anchor itself is excluded. These counts show technologies found in the same project's evidence; they do not prove a direct dependency or runtime connection between them.

### Technology share by hackathon

Add `builtWithTrend` to compare selected technologies across hackathons:

```json
{
  "cohort": {},
  "dimensions": [],
  "builtWithTrend": {
    "technologies": [
      { "category": "frameworks", "name": "Anchor" },
      { "category": "protocols", "name": "Kamino Lend" }
    ],
    "hackathonLimit": 20
  }
}
```

Each `builtWithTrend` row identifies a hackathon, its scoped `projects` total, and a `technologies` array of counts and shares. Each share divides the technology's count by all scoped projects in that hackathon, including projects without tags. A requested technology with no matches has count and share 0. Trends accept at most 10 technologies and return at most 50 hackathons; `hackathonLimit` defaults to 20 and selects the most recent hackathons by start date.

You can combine the dimension, co-occurrence, and trend options in one request. `topK` defaults to 10 and caps dimension and co-occurrence buckets at 20. `samplePerBucket` defaults to 2 and permits at most 5 project slugs per bucket. An empty `dimensions` array lets you request only co-occurrence or trends.

Built-with tags describe evidence found in the code tree at capture time. Coverage varies by cohort, and a missing record is not evidence that a project lacks a technology. These shares measure recorded technology evidence; they do not measure current adoption or describe project architecture. Inspect project details for each tag's confidence and source-summary evidence quote of at most 120 characters.

### builtWithTechnology

```text
category: "languages" | "frameworks" | "chains" | "protocols" | "services" | "tooling" | "standards"
name: string [trim, min 1, max 100]
```

## analyzeResponse

```text
totals: { projects: number [int]; winners: number [int] }
buckets: Record<string, Array<{ key: string; label: string; count: number [int]; share: number; sampleProjectSlugs: Array<string> }>>
cooccurrence: { anchor: builtWithTechnology; projects: number [int]; buckets: Array<{ key: string; label: string; count: number [int]; share: number; sampleProjectSlugs: Array<string> }> [max 20] } [optional]
builtWithTrend: Array<{ hackathon: { slug: string; name: string; startDate: string }; projects: number [int]; technologies: Array<{ category: string; name: string; count: number [int]; share: number }> [max 10] }> [max 50] [optional]
```

## cohortDefinition

```text
builtWith: builtWithFilters [optional]
hackathons: Array<string [min 1]> [optional]
trackKeys: Array<string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]> [optional]
winnersOnly: boolean [optional]
acceleratorOnly: boolean [optional]
acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [optional]
prizePlacements: Array<number [int]> [optional]
clusterKeys: Array<string [pattern /^v\d+-c\d+$/]> [optional]
```

`cohort.builtWith` filters also apply to comparison cohorts. The `builtWith` dimension, co-occurrence, and trend options are available only on `/analyze`.

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
