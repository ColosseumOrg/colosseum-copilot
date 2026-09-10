# Project API fields

Field definitions generated from the shared v2 contract, reviewed 2026-09-09. This is schema notation, not a sample response. `[optional]` permits omission; `null` is a distinct value; `[default x]` supplies x when omitted. `int` means integer. Array bounds apply to item counts, string bounds to length. Datetimes accept ISO 8601 offsets. Strict request objects reject unknown keys. Optional v2 fields are available with v2 and may be absent on older deployments.

[Endpoint reference](api-reference.md).

## searchProjectsRequest

```text
query: string [trim, max 500] [optional] [default ""]
hackathons: Array<string [min 1]> [max 10] [optional]
trackKeys: Array<string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]> [max 10] [optional]
limit: number [int, min 1, max 25] [default 10]
offset: number [int, min 0] [default 0]
filters: { builtWith: builtWithFilters [optional]; category: string [pattern /^[a-z0-9]+(?:-[a-z0-9]+)*$/] [optional]; winnersOnly: boolean [optional]; acceleratorOnly: boolean [optional]; acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [max 10] [optional]; prizePlacements: Array<number [int]> [optional]; prizeTypes: Array<string> [max 10] [optional]; isUniversityProject: boolean [optional]; isSolanaMobile: boolean [optional]; techStack: Array<string> [max 10] [optional]; primitives: Array<string> [max 10] [optional]; problemTags: Array<string> [max 10] [optional]; solutionTags: Array<string> [max 10] [optional]; targetUsers: Array<string> [max 10] [optional]; clusterKeys: Array<string [pattern /^v\d+-c\d+$/]> [max 10] [optional] } [strict] [optional]
diversify: boolean [optional] [default true]
includeFacets: boolean [optional] [default false]
facets: Array<"category" | "hackathons" | "tracks" | "prizes" | "problemTags" | "solutionTags" | "primitives" | "techStack" | "clusters" | "builtWith.languages" | "builtWith.frameworks" | "builtWith.chains" | "builtWith.protocols" | "builtWith.services" | "builtWith.tooling" | "builtWith.standards"> [optional]
facetTopK: number [int, min 1, max 20] [optional] [default 8]
includeDiagnostics: boolean [optional] [default false]
```

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

Use `filters.builtWith` for exact canonical-name matches. Matching trims whitespace and ignores case. It combines categories with AND and names within a category with OR. Discover canonical names through facets; matching does not resolve arbitrary aliases. These filters are separate from the existing `techStack` tags.

For example, `POST /projects/search` finds projects tagged with Solana and either Kamino Lend or Jupiter:

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
  "includeFacets": true,
  "facets": ["builtWith.protocols", "builtWith.frameworks"],
  "facetTopK": 10,
  "limit": 10
}
```

Facet names are `builtWith.languages`, `builtWith.frameworks`, `builtWith.chains`, `builtWith.protocols`, `builtWith.services`, `builtWith.tooling`, and `builtWith.standards`. The response uses those same flattened keys in `facets`. Each bucket contains `key`, `label`, `count`, and `sampleProjectSlugs`; `count` counts distinct projects. `facetTopK` defaults to 8 and permits at most 20 buckets per requested facet.

Read `facetScope` before interpreting counts. With `facetScope: "filters"`, facets describe the projects satisfying the request's filters, including its built-with filters, rather than just the returned page or text-query matches.

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

Project details return the complete permitted Gemini summary for each available kind, preserving Markdown up to 12,000 characters. `truncated` is true only when that limit cuts off text. These summaries describe the sources; raw source files and full derived materials are not distributed.

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
filters: { builtWith: builtWithFilters [optional]; category: string [pattern /^[a-z0-9]+(?:-[a-z0-9]+)*$/] [optional]; winnersOnly: boolean [optional]; acceleratorOnly: boolean [optional]; acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [max 10] [optional]; prizePlacements: Array<number [int]> [optional]; prizeTypes: Array<string> [max 10] [optional]; isUniversityProject: boolean [optional]; isSolanaMobile: boolean [optional]; techStack: Array<string> [max 10] [optional]; primitives: Array<string> [max 10] [optional]; problemTags: Array<string> [max 10] [optional]; solutionTags: Array<string> [max 10] [optional]; targetUsers: Array<string> [max 10] [optional]; clusterKeys: Array<string [pattern /^v\d+-c\d+$/]> [max 10] [optional] } [strict] [optional]
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
filtersApplied: { hackathons: Array<string> [optional]; trackKeys: Array<string [pattern /^[a-z0-9-]+\/[a-z0-9-]+$/]> [optional]; filters: { builtWith: builtWithFilters [optional]; category: string [pattern /^[a-z0-9]+(?:-[a-z0-9]+)*$/] [optional]; winnersOnly: boolean [optional]; acceleratorOnly: boolean [optional]; acceleratorBatchKeys: Array<string [pattern /^accelerator\/[a-z0-9-]+$/]> [max 10] [optional]; prizePlacements: Array<number [int]> [optional]; prizeTypes: Array<string> [max 10] [optional]; isUniversityProject: boolean [optional]; isSolanaMobile: boolean [optional]; techStack: Array<string> [max 10] [optional]; primitives: Array<string> [max 10] [optional]; problemTags: Array<string> [max 10] [optional]; solutionTags: Array<string> [max 10] [optional]; targetUsers: Array<string> [max 10] [optional]; clusterKeys: Array<string [pattern /^v\d+-c\d+$/]> [max 10] [optional] } [strict] [optional] }
totalFound: number [int]
hasMore: boolean
facets: { category: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; hackathons: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; tracks: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; prizes: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; problemTags: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; solutionTags: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; primitives: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; techStack: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; clusters: Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [optional]; "builtWith.languages": Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [max 20] [optional]; "builtWith.frameworks": Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [max 20] [optional]; "builtWith.chains": Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [max 20] [optional]; "builtWith.protocols": Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [max 20] [optional]; "builtWith.services": Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [max 20] [optional]; "builtWith.tooling": Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [max 20] [optional]; "builtWith.standards": Array<{ key: string; label: string; count: number [int]; sampleProjectSlugs: Array<string> }> [max 20] [optional] } [optional]
diagnostics: searchDiagnostics [optional]
```

## getProjectBySlugParams

```text
slug: string
```

## projectDetails

```text
builtWith: repositoryTags | null [optional]
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
