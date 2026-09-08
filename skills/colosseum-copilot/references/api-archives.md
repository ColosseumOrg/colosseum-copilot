# Archive API fields

Field definitions generated from the shared v2 contract, reviewed 2026-09-08. This is schema notation, not a sample response. `[optional]` permits omission; `null` is a distinct value; `[default x]` supplies x when omitted. `int` means integer. Array bounds apply to item counts, string bounds to length. Datetimes accept ISO 8601 offsets. Strict request objects reject unknown keys. Optional v2 fields are available with v2 and may be absent on older deployments.

[Endpoint reference](api-reference.md).

## searchArchivesRequest

```text
query: string [trim, max 500, min 1]
sources: Array<string> [max 20] [optional]
limit: number [int, min 1, max 10] [default 5]
offset: number [int, min 0] [default 0]
maxChunksPerDoc: number [int, min 1, max 4] [default 2]
maxDocsPerSource: number [int, min 0, max 10] [optional] [default 3]
intent: "ideation" | "docs" [optional] [default "docs"]
minSimilarity: number [min 0, max 1] [optional] [default 0.2]
```

## archiveSearchResult

```text
documentId: string [uuid]
title: string
author: string | null
source: string
url: string | null
publishedAt: string | null
similarity: number
snippet: string
chunkIndex: number
```

## searchArchivesResponse

```text
results: Array<archiveSearchResult>
filtersApplied: { sources: Array<string> [optional] }
searchTier: "vector" | "chunk_text" | "doc_text"
totalFound: number [int]
totalMatched: number [int]
hasMore: boolean
```

## getArchiveDocumentParams

```text
documentId: string [uuid]
```

## archiveDocumentPageQuery

```text
offset: number [int, min 0] [coerced] [optional]
maxChars: number [int, min 200, max 20000] [coerced] [optional]
```

## archiveDocument

```text
documentId: string [uuid]
title: string
author: string | null
source: string
url: string | null
publishedAt: string | null
content: string
restricted: boolean
```

## archiveDocumentPage

```text
documentId: string [uuid]
title: string
author: string | null
source: string
url: string | null
publishedAt: string | null
content: string
restricted: boolean
offset: number [int]
maxChars: number [int]
totalChars: number [int]
nextOffset: number [int] | null
hasMore: boolean
```
