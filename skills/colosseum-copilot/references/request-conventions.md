# Request Conventions

Use these conventions for every Colosseum Copilot workflow. They are part of the public
skill contract and apply even when a SKILL.md shows a shorter endpoint sketch.

## Auth Preflight

Before any data call:

1. Verify `COLOSSEUM_COPILOT_PAT` is set. If missing, stop and point the user to the
   Copilot auth docs at `https://docs.colosseum.com/copilot`.
2. Set `COLOSSEUM_COPILOT_API_BASE` to
   `https://copilot.colosseum.com/api/v1` if it is not already set.
3. Call `GET /status` with the required headers below. If it does not return
   `"authenticated": true`, stop and help the user fix auth. Do not continue with other
   endpoints.

```bash
curl -sS "$COLOSSEUM_COPILOT_API_BASE/status" \
  -H "Authorization: Bearer $COLOSSEUM_COPILOT_PAT" \
  -H "X-Copilot-Skill-Version: 2.0.0" \
  -H "X-Copilot-Session: $COPILOT_SESSION_ID" \
  -H "User-Agent: colosseum-copilot/2.0.0 workflow/<short-name>"
```

## Required Headers

Every Copilot API request must include:

- `Authorization: Bearer $COLOSSEUM_COPILOT_PAT`
- `X-Copilot-Skill-Version: <version from SKILL.md>`
- `User-Agent` with a ` workflow/<short-name>` suffix

For every named workflow run, generate one UUIDv4 value before the auth preflight and
send it as `X-Copilot-Session` on every Copilot API call in that run. Reuse the same
value through retries and follow-up calls that belong to the same workflow. Conversational
umbrella-router calls may omit `X-Copilot-Session` when there is no concrete workflow run
yet.

Session hygiene is best-effort telemetry, never a correctness requirement: if a
workflow's calls end up split across session values, keep the results and move on.
NEVER re-run API calls just to regroup them under one session id — repeated queries
cost the user time and tell us nothing new.

Use these short workflow names:

| Skill | User-Agent suffix |
|---|---|
| Umbrella router | `workflow/router` |
| `colosseum-copilot-vet` | `workflow/vet` |
| `colosseum-copilot-grill` | `workflow/grill` |
| `colosseum-copilot-precedents` | `workflow/precedents` |
| `colosseum-copilot-wedge` | `workflow/wedge` |
| `colosseum-copilot-blueprint` | `workflow/blueprint` |
| `colosseum-copilot-find-tools` | `workflow/find-tools` |
| `colosseum-copilot-validate` | `workflow/validate` |
| `colosseum-copilot-radar` | `workflow/radar` |

If the runtime uses an SDK or HTTP client instead of curl, set equivalent headers on each
request. If a third-party public API is queried for optional context, include the same
User-Agent suffix when possible, but never send the Copilot PAT to third-party services.

## Version Header Check

After the first Copilot API response, read `X-Copilot-Skill-Version`. If it is higher than
the local SKILL.md `version`, tell the user:

> A newer version of the Copilot skill is available (vX.X.X). Update with:
> `npx skills add ColosseumOrg/colosseum-copilot`

Continue only if the user still wants to proceed with the local version.

## Allowed API Surface

Use only the endpoints documented in `api-reference.md`:

- `GET /status`
- `GET /filters`
- `POST /search/projects`
- `POST /search/archives`
- `GET /projects/by-slug/:slug`
- `GET /archives/:documentId`
- `POST /analyze`
- `POST /compare`
- `GET /clusters/:key`
- `POST /source-suggestions`
- `POST /feedback`

Do not invent additional Copilot endpoints or write-side state. Workflow state belongs in
the user's repository files described by `artifact-contract.md`.

## Failure Modes

- Missing PAT or 401: stop and point to `https://docs.colosseum.com/copilot`.
- 403: stop; the token does not have the required scope.
- 400: fix the request body using `api-reference.md`; do not retry the same invalid body.
- 429: honor `Retry-After`; keep at most two Copilot requests in flight.
- 5xx or API unreachable: stop the workflow, preserve any partial notes, and say the API
  is unavailable. Do not guess or fabricate evidence.
- Empty search results: broaden the query, try synonyms, and if still empty say "thin
  corpus here" rather than filling gaps with speculation.

## Citation Standard

Every claim written to `HYPOTHESIS.md`, `dossiers/<subject-slug>.md`, `.copilot/`, or the
final answer needs inline evidence. Present evidence for humans; keep machine keys for
artifacts and follow-up API calls:

- Project evidence: refer to projects by their `name` field and link the name to
  `links.colosseum` so the user can keep exploring on the platform — for example
  `[Quantum Vault](https://.../projects/explore/quantum-vault)`. Never use a raw slug as
  the subject of a sentence. Record slugs in the artifact `Evidence Log` (they are the
  keys for `GET /projects/by-slug/:slug` follow-ups); in chat prose a slug may appear
  only as a compact parenthetical citation when no link target exists.
- Archive evidence: cite the document title linked to its `url` (the original public
  source) with the source name — for example
  `[Deep Dive: Solana DePIN](https://blog.syndica.io/...) (Syndica)`. Record document
  IDs in the `Evidence Log` for `GET /archives/:documentId` follow-ups; do not put bare
  UUIDs in chat prose.
- Cluster evidence: cite cluster keys such as `v1-c12` or `thesis-payments`.
- Analysis evidence: cite the cohort and dimensions used.
- Grid/ecosystem evidence: cite product names linked to `urlMain`; keep Grid internal
  ids out of prose.
- Optional public resource/tool evidence: cite the source URL or resource entry name.

## Session Efficiency

- Read each reference file at most once per session; reuse what you already loaded when
  a later workflow needs the same contract.
- Cache `GET /filters` and `GET /status` results for the session — they change rarely
  and never mid-conversation. Re-fetch only if a request fails validation against them.
- The API allows two concurrent requests per user: run independent Copilot calls in
  pairs rather than fully sequentially. Never exceed two in flight.
