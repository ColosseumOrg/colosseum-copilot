# Project API fields

Field definitions generated from the shared v2 contract, reviewed 2026-09-08. This is schema notation, not a sample response. `[optional]` permits omission; `null` is a distinct value; `[default x]` supplies x when omitted. `int` means integer. Array bounds apply to item counts, string bounds to length. Datetimes accept ISO 8601 offsets. Strict request objects reject unknown keys. Optional v2 fields are available with v2 and may be absent on older deployments.

[Endpoint reference](api-reference.md).

## searchProjectsRequest

```text
query: string [trim, max 500] [optional] [default ""]
hackathons: Array<string [min 1]> [max 10] [optional]
trackKeys: Array<string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]> [max 10] [optional]
limit: number [int, min 1, max 25] [default 10]
offset: number [int, min 0] [default 0]
filters: { category: string [pattern /^[a-z0-9]+(?:-[a-z0-9]+)*$/] [optional]; winnersOnly: boolean [optional]; acceleratorOnly: boolean [optional]; acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [max 10] [optional]; prizePlacements: Array<number [int]> [optional]; prizeTypes: Array<string> [max 10] [optional]; isUniversityProject: boolean [optional]; isSolanaMobile: boolean [optional]; techStack: Array<string> [max 10] [optional]; primitives: Array<string> [max 10] [optional]; problemTags: Array<string> [max 10] [optional]; solutionTags: Array<string> [max 10] [optional]; targetUsers: Array<string> [max 10] [optional]; clusterKeys: Array<string [pattern /^v\d+-c\d+$/]> [max 10] [optional] } [strict] [optional]
diversify: boolean [optional] [default true]
includeFacets: boolean [optional] [default false]
facets: Array<"category" | "hackathons" | "tracks" | "prizes" | "problemTags" | "solutionTags" | "primitives" | "techStack" | "clusters"> [optional]
facetTopK: number [int, min 1, max 20] [optional] [default 8]
includeDiagnostics: boolean [optional] [default false]
```

## projectEvidenceSummary

```text
text: string
sourceUrl: string [url]
sourceRevision: string
capturedAt: string [datetime]
extractorVersion: string
```

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
slug: string
name: string
category: string | null [optional]
country: string | null [optional]
website: string | null [optional]
oneLiner: string | null
similarity: number
hackathon: { name: string; slug: string; startDate: string }
tracks: Array<{ name: string; key: string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/] }>
links: { github: string | null; demo: string | null; presentation: string | null; technicalDemo: string | null; twitter: string | null; colosseum: string | null }
evidence: Array<string> [max 2]
evidenceSummaries: projectEvidence [optional]
corpusRevision: string [optional]
freshness: projectFreshness [optional]
prize: { type: string; name: string | null; placement: number [int] | null; amount: number | null; trackName: string | null } | null
metrics: { updatesCount: number [int] }
team: { count: number [int] }
crowdedness: number [int] | null
tags: { problemTags: Array<string> [max 10]; solutionTags: Array<string> [max 10]; primitives: Array<string> [max 10]; techStack: Array<string> [max 10]; targetUsers: Array<string> [max 10] } | null
cluster: { key: string [pattern /^v\d+-c\d+$/]; label: string } | null
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

## appliedProjectFilters

```text
hackathons: Array<string> [optional]
trackKeys: Array<string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]> [optional]
filters: { category: string [pattern /^[a-z0-9]+(?:-[a-z0-9]+)*$/] [optional]; winnersOnly: boolean [optional]; acceleratorOnly: boolean [optional]; acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [max 10] [optional]; prizePlacements: Array<number [int]> [optional]; prizeTypes: Array<string> [max 10] [optional]; isUniversityProject: boolean [optional]; isSolanaMobile: boolean [optional]; techStack: Array<string> [max 10] [optional]; primitives: Array<string> [max 10] [optional]; problemTags: Array<string> [max 10] [optional]; solutionTags: Array<string> [max 10] [optional]; targetUsers: Array<string> [max 10] [optional]; clusterKeys: Array<string [pattern /^v\d+-c\d+$/]> [max 10] [optional] } [strict] [optional]
```

## projectSearchCoverage

```text
hackathons: Array<{ hackathonSlug: string [min 1]; count: number [int, min 0] }>
channels: Array<{ channel: "project" | "repository" | "pitch" | "demo"; count: number [int, min 0] }>
exclusions: Array<{ reason: string [min 1]; count: number [int, min 0]; hackathonSlug: string [min 1] [optional]; channel: "project" | "repository" | "pitch" | "demo" [optional] }>
```

## searchProjectsResponse

```text
appliedFilters: appliedProjectFilters [optional]
coverage: projectSearchCoverage [optional]
facetScope: "filters" | "query" [optional]
results: Array<projectSearchResult>
filtersApplied: { hackathons: Array<string> [optional]; trackKeys: Array<string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]> [optional]; filters: { category: string [pattern /^[a-z0-9]+(?:-[a-z0-9]+)*$/] [optional]; winnersOnly: boolean [optional]; acceleratorOnly: boolean [optional]; acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [max 10] [optional]; prizePlacements: Array<number [int]> [optional]; prizeTypes: Array<string> [max 10] [optional]; isUniversityProject: boolean [optional]; isSolanaMobile: boolean [optional]; techStack: Array<string> [max 10] [optional]; primitives: Array<string> [max 10] [optional]; problemTags: Array<string> [max 10] [optional]; solutionTags: Array<string> [max 10] [optional]; targetUsers: Array<string> [max 10] [optional]; clusterKeys: Array<string [pattern /^v\d+-c\d+$/]> [max 10] [optional] } [strict] [optional] }
totalFound: number [int]
hasMore: boolean
facets: { category: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; hackathons: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; tracks: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; prizes: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; problemTags: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; solutionTags: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; primitives: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; techStack: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; clusters: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional] } [optional]
diagnostics: searchDiagnostics [optional]
```

## getProjectBySlugParams

```text
slug: string
```

## projectDetails

```text
evidenceSummaries: projectEvidence [optional]
corpusRevision: string [optional]
freshness: projectFreshness [optional]
slug: string
name: string
category: string | null [optional]
country: string | null [optional]
website: string | null [optional]
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
cluster: { key: string [pattern /^v\d+-c\d+$/]; label: string } | null
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
clusters: Array<{ key: string [pattern /^v\d+-c\d+$/]; label: string; projectCount: number [int] }>
archiveSources: Array<{ key: string; label: string; documentCount: number [int] [optional] }>
```
