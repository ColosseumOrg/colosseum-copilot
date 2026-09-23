# Resources API fields

Contract reviewed 2026-09-18 for skill 2.0.0. `GET /api/v1/resources` requires a bearer token and returns the canonical hackathon resources hub. `[optional]` permits omission; `[default x]` supplies x when omitted. This is schema notation, not a sample response.

[Endpoint reference](api-reference.md).

## getResourcesQuery

```text
hackathon: string [pattern /^[a-z0-9-]{1,40}$/] [optional, default "current"]
track: string [pattern /^[a-z0-9-]{1,40}$/] [optional]
q: string [trim, min 2, max 100] [optional]
topic: string [pattern /^(?:[a-z0-9-]{1,40}:)?[a-z0-9-]{1,60}$/] [optional]
kind: "all" | "sponsors" | "topics" | "rpc" [default "all"]
```

The default feed is `current.json`, which follows the current event unless the service explicitly overrides it. Multi-chain feeds return all tracks once by default; `track` selects one returned track ID. `tracks` always lists the available tracks. Entries carry `trackId`, and topic/group IDs are qualified as `track:topic`. Historical single-track feeds keep their original IDs and return `tracks: []`. An unqualified topic is accepted when unique or when a track resolves it; an ambiguous topic returns 400. Unknown tracks return 404; an unknown topic within a valid track returns no topics. `topic` restricts topics by section ID; it does not filter sponsors or RPC providers. Arrays excluded by `kind` are empty.

`q` ignores case and splits on whitespace. Every token must match the item's searchable text. Sponsors match on name, tags, content and link labels. Topic links match on label, description, group title and topic title. RPC providers match on name, description and offer. Only matching topic links remain; empty groups and topics are omitted. Without `q`, all entries remain subject to `kind` and `topic`.

## getResourcesResponse

```text
hackathon: { name: string; slug: string }
tracks: Array<{ id: string; name: string }>
source: { url: string; fetchedAt: string [ISO datetime]; stale: boolean }
sponsors: Array<{ name: string; slug: string; trackId: string [optional]; tags: Array<string>; hasSkill: boolean; content: string; links: Array<resourceLink> }>
topics: Array<{ id: string; trackId: string [optional]; title: string; summary: string [optional]; groups: Array<{ id: string; title: string; links: Array<resourceLink> }> }>
topicGroups: Array<{ id: string; trackId: string [optional]; title: string; topicIds: Array<string> }>
rpcProviders: Array<{ name: string; trackId: string [optional]; description: string; offer: string [optional]; links: Array<resourceLink> }>
query: { track: string [optional]; q: string [optional]; topic: string [optional]; kind: string; matched: number [int] }
```

```text
resourceLink: { label: string; url: string; description: string [optional, topic links only] }
```

`topics` contains the hub's resource sections, with link `hyperlink` values normalized to `label`. `topicGroups` contains only IDs of returned topics and omits empty groups. `query.matched` counts returned sponsors, topic links and RPC providers.

The public source is `https://ColosseumOrg.github.io/hackathon-resources/<hackathon-slug>.json`. `source.fetchedAt` records the last successful fetch. Cached data is fresh for 10 minutes; older data returns immediately with `stale: true` while refreshing. Copies older than 24 hours are not returned.

Unknown hackathons return 404 `NOT_FOUND` with `Hackathon resources not found`. If the hub is unavailable and no usable cached copy exists, the endpoint returns 503 `resources_unavailable`. Invalid query parameters return 400 `INVALID_QUERY`.

## Example call

Use the trusted API base configured in the endpoint reference. Keep shell tracing off and pass the token directly to curl.

```bash
set +x
npx @colosseum-org/copilot-connect token | {
  IFS= read -r copilot_token
  printf 'Authorization: Bearer %s\n' "$copilot_token" |
    curl --silent --show-error --fail-with-body \
      --header @- --get "$COLOSSEUM_COPILOT_API_BASE/resources" \
      --data-urlencode 'track=solana' \
      --data-urlencode 'q=wallet' \
      --data-urlencode 'kind=topics'
}
```

Copilot recommends tools only from this hub and uses `POST /analyze` `builtWith` facets for adoption evidence.
