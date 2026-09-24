# API reference

Contract reviewed 2026-09-24 for skill 2.0.0. The API base is `https://copilot.colosseum.com/api/v1`; endpoint paths below are relative to it. The public evidence-service endpoints below require a bearer token. Send JSON bodies with `Content-Type: application/json`. The body limit is 1 MB.

## Connect and call

The connection helper is **available with v2**. It uses browser authorization with PKCE by default, a device fallback, and rotating refresh tokens. See [connection instructions](connection.md) for setup and v1 migration. Do not print, commit, or send tokens to the model. This manual fallback feeds the token directly to curl through standard input; keep shell tracing off.

```bash
npx @colosseum-org/copilot-connect login
npx @colosseum-org/copilot-connect status
export COLOSSEUM_COPILOT_API_BASE="${COLOSSEUM_COPILOT_API_BASE:-https://copilot.colosseum.com/api/v1}"
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

## Endpoints and field definitions

Each schema name below resolves to the field definitions on its linked page. Those pages describe the fields used by this v2 skill, including validation bounds, defaults and nullable values. They are definitions, not invented live outputs.

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
| `POST /session-shares` | JSON [session sharing request](#privacy-and-session-sharing), where conversation sharing is available | 201, `{ saved: true, expiresAt: string }` |
| `POST /source-suggestions`    | JSON [sourceSuggestionRequest](api-analysis.md#sourcesuggestionrequest)                                   | 201, `{ "message": "Thanks! We'll review your suggestion." }`                                         |
| `POST /feedback`              | JSON [feedbackRequest](api-analysis.md#feedbackrequest)                                                   | 201, `{ "message": "Feedback received. Thank you." }`                                                 |

Source suggestions require a public HTTP or HTTPS URL without embedded credentials. Feedback `context` must serialize to at most 10,000 characters; the validation message describes this as 10 KB. Preview these submissions and obtain the user's consent. Using research does not authorize sending feedback or suggestions.

See [FAQ fields and freshness](api-faqs.md) for canonical program answers.

## Curated V2 categories

Categories are available only to a V2 signed-in client. `GET /categories` returns the current map: its version, six broad areas, 34 group keys, labels and definitions, plus `other-emerging`. Do not invent, rename or infer category keys. Categories describe project purpose, not investment quality, market size, technology or current activity.

`filters.categoryKeys` accepts one to ten group keys, including `other-emerging`. Listed keys are alternatives: a project matches if its main or secondary group matches any key. To cover a broad area, list its group keys, not the area key.

Category facets and `/analyze` count a project under both its main and secondary groups. Buckets overlap: never add them to get a project total or treat `share` as exclusive. Each returns at most 20 buckets (`facetTopK` for search, `topK` for analysis), so a missing bucket does not establish zero projects.

For an exact count, use `POST /search/projects` with `query: ""` and `filters.categoryKeys`, then read `totalFound`. The count includes each matching project once even if several selected keys match it. For trends, run one search per hackathon with the same group keys and other filters. `/compare` rejects `"categories"`; neither analysis nor comparison cohorts accept `categoryKeys`.

In a returned `categories` object, `primaryKey: null` means Other / emerging. `categories: null` means no category record is available. Without V2 sign-in, categories return `403 INSUFFICIENT_SCOPE`. With V2 sign-in, `GET /categories` always works, while category filters, facets and analysis return `503 CATEGORIES_UNAVAILABLE` until categories are published.

## Status and scopes

`authenticated`, `expiresAt`, and `scope` describe authentication. An unknown expiry or scope can be `null`. `scope` is a space-delimited string of granted values. On a V2 connection, confirm `evidence:read` (or its alias `copilot:retrieval`) before reading protected evidence. A v1 token reports `colosseum_copilot:read`, which also grants evidence access.

The helper requests `evidence:read` and `self-data:read`, plus `telemetry:write` where conversation sharing is available. `telemetry:write` shares nothing unless the user also opts in when approving the connection. `profile:read` is requestable but is not a default. Request only what the connection flow offers. The scope enum also includes compatibility aliases `copilot:retrieval`, `copilot:telemetry`, and `copilot:self-data`, plus `telemetry:write`. `projects:updates:write` and `submissions:write` are reserved, unavailable scopes. Posting project updates and completing submissions from your agent are coming; nothing writes to your project yet. There are no project-action endpoints to call.

## Privacy and session sharing

Copilot retains request records, including account association, request metadata and search inputs, for 12 months. Those service records are separate from optional conversation sharing. The Copilot notice supplements the existing [Terms of Service](https://colosseum.com/terms-of-service) and [Privacy Policy](https://colosseum.com/privacy-policy). Contact [hello@colosseum.com](mailto:hello@colosseum.com) for data-handling questions or requests.

Conversation sharing requires a separate opt-in at sign-in for the connection: an unchecked box on the approval page, shown only when the connection requests `telemetry:write`. This opt-in is consent to share full sessions without a per-share preview or approval. `POST /session-shares`, relative to the API base, requires a V2 connection with session sharing enabled and `telemetry:write` (or its compatibility alias `copilot:telemetry`). A scope alone is not consent. Before each upload, check authenticated `GET /status` for `sessionSharingEnabled: true` and the required scope. Never share sessions if the opt-in is absent or sharing has been turned off. Shared sessions are retained for 90 days. Users can turn sharing off at any time from their connected-agents page in Arena.

Redact secrets from session messages before upload. The opt-in covers the session's conversation, not separate uploads of repositories, unrelated conversation history or paid results. The request is a strict JSON object with `sessionId` (a UUID) and `messages` (2–100 strict objects with `role: "user" | "assistant"` and trimmed `content` of 1–20,000 characters). Include at least one message of each role. The serialized `messages` array must be at most 100,000 characters. Success is `201` with `{ saved: true, expiresAt: string }`, where `expiresAt` is an ISO datetime. Credential-like text is also removed from shared messages before they are saved. Repeating the same `sessionId` for the same connection does not replace the saved session or extend its expiry. A connection without the required opt-in and scope receives `403 INSUFFICIENT_SCOPE`.

Revoking access does not delete historical records. The [privacy guide](https://docs.colosseum.com/copilot/privacy) explains these boundaries. Continue the user's task if optional sharing is unavailable.

## Evidence and search interpretation

Project details can return `evidenceSummaries`, `corpusRevision` and `freshness`. Search results can return `corpusRevision` and `freshness` but omit `evidenceSummaries`; open details by slug for summaries. Search results require the separate legacy `evidence: string[]` field, capped at two match snippets. Project details have no `evidence` field. Structured evidence has nullable `repoSummary`, `pitchSummary` and `demoSummary`. Each present summary carries text, source URL, source revision, capture time and extractor version. A missing channel is unknown, not negative evidence. Capture time is not event time or proof that a claim remains current.

Facets need `includeFacets: true`. Always list the facets you want in `facets`, including `"categories"`; the default set omits categories. They count everything matching the filters and ignore the query. With a query, `totalFound` is offset plus returned results, plus one if more exist; never report it as a count. With an empty query, it is the exact filtered project count. Check `filtersApplied` before reporting the population.

Counts describe covered projects, not market size. Similarity, prizes and update counts do not establish commercial outcomes. Freshness values may be null.

Use `/filters` to discover valid slugs and keys, including canonical hackathon `startDate`, accelerator batches and archive sources. Project search permits an empty query for browsing with filters. `hasMore` and `offset` support pagination. For archive search, `hasMore` means an additional result was observed in the active retrieval tier. `totalFound` is a compatibility pagination value: `totalMatched` when more results exist, or `offset + returned results` on the last page. It is not an exact semantic-result total. `totalMatched` is the lexical text-match count, falling back to the retrieved result count if counting fails; it can be zero even when semantic results are useful. It reports `searchTier` as vector, chunk text or document text retrieval. `maxDocsPerSource: 0` removes that per-source cap.

Archive reads default to `offset: 0` and `maxChars: 8000`; the allowed character window is 200 to 20,000. Continue with `nextOffset` while `hasMore` is true. Respect `restricted` and cite the source URL; pagination does not grant permission to redistribute restricted text.

## Limits

Limits are shared per authenticated user, including when that user has multiple tokens.

| Category           | Limit              | Endpoints                                |
| ------------------ | ------------------ | ---------------------------------------- |
| Search             | 30 requests/minute | Both search endpoints, `/faqs`, `/faqs/:program/:id` and `/resources` combined           |
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
| 403  | `INSUFFICIENT_SCOPE` | false | Check the required scope, V2 sign-in and any separate consent. |
| 404  | `NOT_FOUND`              | false     | Check slug, key or document ID.                         |
| 413  | `PAYLOAD_TOO_LARGE`      | false     | Reduce the body below 1 MB.                             |
| 415  | `UNSUPPORTED_MEDIA_TYPE` | false     | Use supported encoding and charset.                     |
| 429  | `RATE_LIMITED`           | true      | Honor `Retry-After` and reduce concurrency.             |
| 500  | `INTERNAL_ERROR`         | true      | Retry with bounded backoff.                             |
| 503  | `SERVICE_UNAVAILABLE`    | true      | Honor `Retry-After` when present, then retry.           |
| 503  | `PROJECT_PERMISSIONS_UNAVAILABLE` | true | Project research is temporarily unavailable; retry later. |
| 503  | `CATEGORIES_UNAVAILABLE` | true | Categories aren't published yet; retry later or search without categories. |
| 503  | `EVIDENCE_UNAVAILABLE`   | true      | Repository checks pending; retry later.                 |

Other application error codes may occur. Honor the returned status and `retryable` flag. Empty search results are successful responses, not errors; broaden filters or terms and disclose coverage limits rather than inferring that no relevant project exists.
