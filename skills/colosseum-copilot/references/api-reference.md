# API reference

Contract reviewed 2026-09-18 for skill 2.0.0. The API path remains `/api/v1`. The public evidence-service endpoints below require a bearer token. Send JSON bodies with `Content-Type: application/json`. The body limit is 1 MB.

## Connect and call

The connection helper is **available with v2**. It uses browser authorization with PKCE by default, a device fallback, and rotating refresh tokens. See [connection instructions](connection.md) for setup and v1 migration. Do not print, commit, or send tokens to the model. This manual fallback feeds the token directly to curl through standard input; keep shell tracing off.

```bash
npx @colosseum-org/copilot-connect login
npx @colosseum-org/copilot-connect status
export COLOSSEUM_COPILOT_API_BASE="https://copilot.colosseum.com/api/v1"
set +x
npx @colosseum-org/copilot-connect token | {
  IFS= read -r copilot_token
  printf 'Authorization: Bearer %s\n' "$copilot_token" |
    curl --silent --show-error --fail-with-body \
      --header @- "$COLOSSEUM_COPILOT_API_BASE/status"
}
```

Use only a trusted HTTPS API base. `token` is for programmatic consumption; do not run it alone in an agent-visible terminal. V1 PATs keep working; Colosseum will announce any end date well in advance. The legacy token response contract is `{ access_token: string, token_type: "Bearer", expires_in: number, scope: string }`; `expires_in` is seconds. Issuance and grant management belong to the Colosseum connection service, not an endpoint under this API base.

Compare `X-Copilot-Skill-Version` semantically with local version `2.0.0`; when newer, recommend `npx skills add ColosseumOrg/colosseum-copilot`. A newer header does not prove a capability is enabled.

## Endpoints and complete field definitions

Each schema name below resolves to the field definitions on its linked page. Those pages include every nested request and response field, validation bound, enum, default, optional value and nullable value in the shared contract. They are definitions, not invented live outputs.

| Endpoint                      | Request                                                                                                   | Successful response                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `GET /status`                 | No body or query                                                                                          | 200, [statusResponse](api-analysis.md#statusresponse)                                                 |
| `POST /search/projects`       | JSON [searchProjectsRequest](api-projects.md#searchprojectsrequest)                                       | 200, [searchProjectsResponse](api-projects.md#searchprojectsresponse), containing projectSearchResult |
| `POST /search/archives`       | JSON [searchArchivesRequest](api-archives.md#searcharchivesrequest)                                       | 200, [searchArchivesResponse](api-archives.md#searcharchivesresponse), containing archiveSearchResult |
| `GET /projects/by-slug/:slug` | Path [getProjectBySlugParams](api-projects.md#getprojectbyslugparams)                                     | 200, [projectDetails](api-projects.md#projectdetails)                                                 |
| `GET /archives/:documentId`   | Path getArchiveDocumentParams; query [archiveDocumentPageQuery](api-archives.md#archivedocumentpagequery) | 200, [archiveDocumentPage](api-archives.md#archivedocumentpage) extending archiveDocument             |
| `GET /resources` | Query [getResourcesQuery](api-resources.md#getresourcesquery) | 200, [getResourcesResponse](api-resources.md#getresourcesresponse) |
| `GET /faqs` | Optional `program`, `q` | 200, FAQ list with canonical links and revisions |
| `GET /faqs/:program/:id` | Program and stable FAQ ID | 200, one FAQ; 404 if unknown |
| `GET /filters`                | No body or query                                                                                          | 200, [filtersResponse](api-projects.md#filtersresponse)                                               |
| `GET /categories`             | No body or query                                                                                          | 200, the current V2 category map: its version, six areas, 34 group keys, labels, and definitions     |
| `POST /analyze`               | JSON [analyzeRequest](api-analysis.md#analyzerequest)                                                     | 200, [analyzeResponse](api-analysis.md#analyzeresponse)                                               |
| `POST /compare`               | JSON [compareRequest](api-analysis.md#comparerequest), with cohortDefinition for each side                | 200, [compareResponse](api-analysis.md#compareresponse)                                               |
| `GET /clusters/:key`          | Path [getClusterDetailsParams](api-analysis.md#getclusterdetailsparams)                                   | 200, [clusterDetails](api-analysis.md#clusterdetails)                                                 |
| `POST /source-suggestions`    | JSON [sourceSuggestionRequest](api-analysis.md#sourcesuggestionrequest)                                   | 201, `{ "message": "Thanks! We'll review your suggestion." }`                                         |
| `POST /feedback`              | JSON [feedbackRequest](api-analysis.md#feedbackrequest)                                                   | 201, `{ "message": "Feedback received. Thank you." }`                                                 |

Source suggestions require a public HTTP or HTTPS URL without embedded credentials. Feedback `context` must serialize to at most 10,000 characters; the validation message describes this as 10 KB. Preview these submissions and obtain the user's consent. Using research does not authorize sending feedback or suggestions.

See [FAQ fields and freshness](api-faqs.md) for canonical program answers.

## Curated V2 categories

Categories are available only to a V2 signed-in client. They are not available to a legacy v1 token, and v1 clusters remain a separate, unchanged surface. Call `GET /categories` before using a category key: it returns the current map, including six broad areas, 34 stable group keys, each group's plain definition, and `other-emerging` for projects that do not fit the map. Do not invent, rename, or infer category keys.

Use `filters.categoryKeys` with one to ten keys when searching projects. Request the `categories` facet only when it helps answer the question. Project-search and project-detail responses may include a project's main and secondary category with the map version. A category read returns `503 CATEGORIES_UNAVAILABLE` while the current map has not been published; retry later or continue the request without category filters or category facets. A regular project search remains available before publication.

Use `"categories"` in the `dimensions` array for `POST /analyze` to compare category counts in a cohort. The same availability rule applies. Categories are descriptive groupings, not investment scores, market-size claims, chain or technology tags, or evidence that a project is active today.

## Status, scopes and capabilities

`authenticated`, `expiresAt`, and `scope` describe authentication. An unknown expiry or scope can be `null`. `scope` is a space-delimited string of granted values. Deployments can also return an optional `capabilities` object with the boolean properties below. Read a property such as `capabilities.frames` only when it is present; capabilities are not a string array.

| Property      | Meaning when true                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deviceFlow`  | Device authorization is enabled.                                                                                                                                          |
| `pkce`        | Authorization code with PKCE is enabled.                                                                                                                                  |
| `evidence`    | Evidence retrieval is enabled.                                                                                                                                            |
| `embeddingV2` | V2 embeddings are enabled.                                                                                                                                                |
| `reranker`    | Search reranking is enabled.                                                                                                                                              |
| `frames`      | Optional Frames guidance is enabled. This does not establish an account connection, provider availability, a paid-call proxy, or funded credits. See [Frames](frames.md). |
| `faqs` | Canonical Colosseum FAQ list and detail reads are available. |
| `resources` | The canonical hackathon resources catalog is available. |

Treat an absent capability property as unknown or unavailable. Do not infer support from an absent property.

The helper defaults to `evidence:read self-data:read`; `profile:read` is requestable but is not a default. Request only what the connection flow offers. The scope enum also includes compatibility aliases `copilot:retrieval`, `copilot:telemetry`, and `copilot:self-data`, plus `telemetry:write`. `projects:updates:write` and `submissions:write` are reserved, unavailable scopes. Posting project updates and completing submissions from your agent are coming; nothing writes to your project yet. There are no project-action endpoints to call.

## Optional usage feedback

V2 operational telemetry requires separate, current user consent. A connection scope permits access; it does not establish consent or prove that collection is enabled. Read the current disclosure and settings before describing what this connection shares. When enabled and consented, bounded service observations can include tool family, result count, status and timing. HTTP success does not establish that the answer was helpful.

Structured ratings use schema `2.1` with `name: "user.feedback"`, `observationOrigin: "user-feedback"`, `rating` (`helpful`, `partly`, or `not-helpful`), and an optional bounded reason. Ask for an actual user rating; never infer or submit it from your own assessment. Accepted batches return `accepted`, `rejected`, and optionally `deduplicated`; accepted includes already-stored retries. Exports can contain `2.0` client events and `2.1` server observations or ratings. Exported event/run identifiers are pseudonymous receipts.

Query-content telemetry is currently unavailable. Do not send query text to an operational event endpoint. The [privacy guide](https://docs.colosseum.com/copilot/privacy) describes consent, export/deletion and retention limits. Continue the user's task if optional telemetry is unavailable.

## Evidence and search interpretation

Structured `evidenceSummaries`, `corpusRevision` and `freshness` on project results and details are optional and **available with v2**. Search results require the separate legacy `evidence: string[]` field, capped at two match snippets. Project details have no `evidence` field. Structured evidence has nullable `repoSummary`, `pitchSummary` and `demoSummary`. Each present summary carries text, source URL, source revision, capture time and extractor version. A missing channel is unknown, not negative evidence. Capture time is not event time or proof that a claim remains current.

`appliedFilters`, `coverage` and `facetScope` are optional and **available with v2**. Preserve legacy `filtersApplied` compatibility. Coverage records counts by hackathon and evidence channel plus exclusions with reasons; it does not certify completeness beyond the returned accounting. Freshness values may be null.

When `facetScope` is `filters`, facets describe the filtered corpus without the semantic query. `query` identifies query-scoped counts. When absent, do not infer query scope. Counts are corpus counts, never market sizes. Similarity, cluster crowdedness, prizes and update counts do not establish commercial outcomes.

Use `/filters` to discover valid slugs and keys, including canonical hackathon `startDate`, accelerator batches and archive sources. Project search permits an empty query for browsing with filters. `hasMore` and `offset` support pagination; `totalFound` can be estimated, as reported by diagnostics. For archive search, `hasMore` means an additional result was observed in the active retrieval tier. `totalFound` is a compatibility pagination value: the larger of the lexical count and observed page overflow when more results exist, or `offset + returned results` on the last page. It is not an exact semantic-result total. `totalMatched` is the lexical text-match count, falling back to the retrieved result count if counting fails; it can be zero even when semantic results are useful. It reports `searchTier` as vector, chunk text or document text retrieval. `maxDocsPerSource: 0` removes that per-source cap.

Archive reads default to `offset: 0` and `maxChars: 8000`; the allowed character window is 200 to 20,000. Continue with `nextOffset` while `hasMore` is true. Respect `restricted` and cite the source URL; pagination does not grant permission to redistribute restricted text.

## Limits

Limits are shared per authenticated user, including when that user has multiple tokens.

| Category           | Limit              | Endpoints                                |
| ------------------ | ------------------ | ---------------------------------------- |
| Search             | 30 requests/minute | Both search endpoints combined           |
| Analysis           | 10 requests/minute | `/analyze` and `/compare` combined       |
| Concurrency        | 2 in flight        | Authenticated evidence-service endpoints |
| Source suggestions | 5 requests/hour    | `/source-suggestions`                    |
| Feedback           | 10 requests/hour   | `/feedback`                              |

Honor `Retry-After` on 429 responses. Concurrency rejection uses `Retry-After: 1`. Queue client requests instead of assuming the host serializes them. Limit-service failures can return retryable 5xx responses; retry with bounded backoff.

## Errors

Error bodies contain `error: string`, `code: string`, and `retryable: boolean`. Server errors may also include `requestId: string`; include it in a user-approved support report. Do not include tokens or private task context.

| HTTP | Code                     | Retryable | Response                                                |
| ---- | ------------------------ | --------- | ------------------------------------------------------- |
| 400  | `INVALID_JSON`           | false     | Fix JSON syntax.                                        |
| 400  | `INVALID_QUERY`          | false     | Check body, path or query fields and validation bounds. |
| 400  | `BAD_REQUEST`            | false     | Correct the request body.                               |
| 401  | `UNAUTHORIZED`           | false     | Run `status`; check API origins before reconnecting.    |
| 403  | `FORBIDDEN`              | false     | Check account and granted access; do not bypass it.     |
| 404  | `NOT_FOUND`              | false     | Check slug, key or document ID.                         |
| 413  | `PAYLOAD_TOO_LARGE`      | false     | Reduce the body below 1 MB.                             |
| 415  | `UNSUPPORTED_MEDIA_TYPE` | false     | Use supported encoding and charset.                     |
| 429  | `RATE_LIMITED`           | true      | Honor `Retry-After` and reduce concurrency.             |
| 500  | `INTERNAL_ERROR`         | true      | Retry with bounded backoff.                             |
| 503  | `SERVICE_UNAVAILABLE`    | true      | Retry later.                                            |
| 503  | `EVIDENCE_UNAVAILABLE`   | true      | Repository checks pending; retry later.                 |

Other application error codes may occur. Honor the returned status and `retryable` flag. Empty search results are successful responses, not errors; broaden filters or terms and disclose coverage limits rather than inferring that no relevant project exists.
