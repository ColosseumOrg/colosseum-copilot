# The Grid (Deep Research)

## What The Grid Is

The Grid provides ecosystem metadata you can query via GraphQL: roots (projects/organizations), products, assets/tokens, entities, tags, smart-contract deployments, and relationship graphs (product supports-product edges, root relationship edges).

**Data volume**: ~6,300 products (all ecosystems), ~3,000 roots, ~2,500 entities, ~1,700 assets, ~7,300 profile tags, ~3,900 smart contract deployments.

## Endpoints

Default endpoint:

```bash
export THEGRID_GRAPHQL_ENDPOINT="https://beta.node.thegrid.id/graphql"
```

GraphiQL (default endpoint):
- https://cloud.hasura.io/public/graphiql?endpoint=https%3A%2F%2Fbeta.node.thegrid.id%2Fgraphql

Docs:
- https://docs.thegrid.id/using-the-api-11

## Auth (Optional)

Most dataset queries work without an API key. The Grid docs state: "There is currently no key needed":
- https://docs.thegrid.id/getting-an-api-key-9

If you have a key (enterprise / future), send it as an HTTP header:

```bash
export THEGRID_API_KEY="YOUR_KEY"
```

Then add:

```
x-api-key: $THEGRID_API_KEY
```

Note: some advanced endpoints can also require an `xApiKey` GraphQL argument (example shown later).

## Ways To Query (Pick One)

- GraphiQL (manual exploration): https://cloud.hasura.io/public/graphiql?endpoint=https%3A%2F%2Fbeta.node.thegrid.id%2Fgraphql
- cURL (primary): copy/paste templates below
- Node.js (built-in `fetch`): minimal snippet below
- Python (`requests`): minimal snippet below

Node.js (built-in `fetch`):

```js
const endpoint =
  process.env.THEGRID_GRAPHQL_ENDPOINT ?? 'https://beta.node.thegrid.id/graphql';

const headers = { 'content-type': 'application/json' };
if (process.env.THEGRID_API_KEY) headers['x-api-key'] = process.env.THEGRID_API_KEY;

const payload = {
  query:
    'query($q:String!,$limit:Int!){products(limit:$limit,where:{_or:[{name:{_contains:$q}},{description:{_contains:$q}}]}){id name root{slug urlMain}}}',
  variables: { q: 'jupiter', limit: 5 },
};

const res = await fetch(endpoint, {
  method: 'POST',
  headers,
  body: JSON.stringify(payload),
});

const json = await res.json();
if (json.errors?.length) throw new Error(JSON.stringify(json.errors));
console.log(json.data);
```

Python (`requests`):

```python
import os
import requests

endpoint = os.environ.get("THEGRID_GRAPHQL_ENDPOINT", "https://beta.node.thegrid.id/graphql")
headers = {"content-type": "application/json"}

api_key = os.environ.get("THEGRID_API_KEY")
if api_key:
    headers["x-api-key"] = api_key

payload = {
    "query": "query($q:String!,$limit:Int!){products(limit:$limit,where:{_or:[{name:{_contains:$q}},{description:{_contains:$q}}]}){id name root{slug urlMain}}}",
    "variables": {"q": "jupiter", "limit": 5},
}

res = requests.post(endpoint, json=payload, headers=headers, timeout=30)
res.raise_for_status()
data = res.json()
print({"data": data.get("data"), "errors": data.get("errors")})
```

## cURL Template (Copy/Paste)

GraphQL errors often return with HTTP 200. Always check the `errors` field in the JSON response.

```bash
set -euo pipefail

export THEGRID_GRAPHQL_ENDPOINT="https://beta.node.thegrid.id/graphql"
# Optional:
# export THEGRID_API_KEY="YOUR_KEY"

H=(-H 'content-type: application/json')
if [ -n "${THEGRID_API_KEY:-}" ]; then
  H+=(-H "x-api-key: $THEGRID_API_KEY")
fi

curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{
  "query": "query($q:String!,$limit:Int!){products(limit:$limit,where:{_or:[{name:{_contains:$q}},{description:{_contains:$q}}]}){id name root{slug urlMain}}}",
  "variables": { "q": "jupiter", "limit": 5 }
}
JSON
```

## Critical Syntax Notes (Don't Get Stuck)

- String filters: use `_contains` (simple substring) and `_like` (pattern match). There is no `_ilike` or `_regex`. Both `_contains` and `_like` are case-insensitive in practice.
- Full operator set: `_eq`, `_in`, `_contains`, `_like`, `_gt`/`_gte`/`_lt`/`_lte`, `_and`/`_or`/`_not`, `_is_null`. No full-text search or scoring operator exists.
- Ordering enum values are `Asc` / `Desc` (capitalized).
- Keep `limit` small (5 to 25). Use `offset` for pagination.
- Start with small selection sets; expand by id (e.g. `rootsById`, `productsById`, `assetsById`) once you find promising candidates.
- Always exclude dead products in incumbent searches: `_not: { productStatus: { slug: { _in: ["discontinued", "support_ended"] } } }`.
- Aggregate queries use `filter_input: { where: {...} }` (not `where` directly).

## Schema Discovery (Introspection)

If a query fails with "no such field", use introspection to discover the right field names and filter inputs.

List fields for a type:

```graphql
query FieldsForRoots {
  __type(name: "Roots") {
    fields { name }
  }
}
```

List filter input fields for a bool exp type:

```graphql
query RootRelationshipFilters {
  __type(name: "RootRelationshipsBoolExp") {
    inputFields { name }
  }
}
```

## Product Type Slug Taxonomy

The strongest precision lever for incumbent discovery is filtering by `productType.slug`. There are 115 product type slugs total. Map your research topic to slugs using this guide:

| Research Topic | Suggested `productType` Slugs |
|---|---|
| DeFi lending | `decentralised_borrowing_and_lending`, `yield_aggregator` |
| Payments | `merchant_payment_gateway`, `on_off_ramp`, `payments_infrastructure_and_orchestration` |
| DEX / trading | `decentralised_exchange`, `dex_aggregator`, `derivatives` |
| Infrastructure | `developer_tooling`, `onchain_data_api`, `block_explorer`, `rpc_provider` |
| Staking | `liquid_staking`, `staking_service` |
| Cross-chain | `bridge`, `cross_chain_infrastructure` |
| AI agents | `ai_agent`, `ai_agent_platform`, `ai_agent_framework` |
| Gaming | `game`, `blockchain_gaming_infrastructure` |
| Identity | `decentralised_identity` |
| Stablecoins | `stablecoin_issuance` |
| NFTs | `nft_marketplace`, `nft_issuance_platform` |
| DePin | `depin` |
| Prediction markets | `prediction_markets` |
| Oracles | `oracle` |
| Wallets | `wallet`, `embedded_wallet`, `hardware_wallet` |

**Top 30 by count:** `developer_tooling` (599), `wallet` (331), `decentralised_exchange` (207), `centralised_exchange` (182), `financial_services_platform` (174), `merchant_payment_gateway` (159), `on_off_ramp` (145), `l1` (144), `payments_infrastructure_and_orchestration` (136), `game` (131), `decentralised_borrowing_and_lending` (114), `yield_aggregator` (113), `block_explorer` (113), `ai_agent` (104), `bridge` (101), `onchain_data_api` (100), `dex_aggregator` (81), `depin` (80), `ai_agent_platform` (77), `cross_chain_infrastructure` (73), `stablecoin_issuance` (71), `nft_marketplace` (68), `peer_to_peer_and_remittance` (67), `decentralised_identity` (55), `oracle` (46), `derivatives` (46), `embedded_wallet` (46), `rpc_provider` (44), `prediction_markets` (28), `ai_agent_framework` (27). Query `productTypes` for the full list.

## Solana Ecosystem Filtering

Three approaches with different coverage/precision trade-offs. **For maximum recall, combine all three with `_or`** (see Vertical Search recipe below).

**Option A: Profile tags** (broadest — recommended default)

```graphql
where: {
  root: {
    profileTags: {
      tag: { slug: { _eq: "solana" } }
    }
  }
}
```

**Option B: Smart contract deployments** (highest precision, narrower coverage)

```graphql
where: {
  productDeployments: {
    smartContractDeployment: {
      deployedOnProduct: { name: { _eq: "Solana Mainnet" } }
    }
  }
}
```

**Option C: CAIP-2 attribute** (narrow, limited coverage — use as supplement)

```graphql
where: {
  attributes: {
    attributeType: { slug: { _eq: "chain_id_caip2" } }
    value: { _contains: "solana" }
  }
}
```

Other ecosystem tags with profile coverage: `ethereum` (1,371), `tether` (1,337), `bitcoin` (599), `tron` (398), `starknet` (279), `ai` (180).

## High-Value Query Recipes (Idea Research)

Each recipe includes:
- When to use it
- A complete GraphQL query
- A ready-to-run `curl` invocation using variables

All `curl` examples assume you have set `THEGRID_GRAPHQL_ENDPOINT` and built the `H` header array as shown in the cURL template above. If you are running a single snippet in isolation, replace `"${H[@]}"` with `-H "content-type: application/json"` (and optionally `-H "x-api-key: $THEGRID_API_KEY"`).

### Vertical Search (Category + Solana Scoping)

When to use: incumbent search for a specific vertical. This is the **highest-precision starting point** — map your topic to `productType` slugs (see taxonomy above) and combine with triple-OR Solana ecosystem scoping for maximum recall.

```graphql
query VerticalSearch(
  $typeSlugs: [String!]!
  $chain: String!
  $tag: String!
  $dead: [String!]!
  $limit: Int!
) {
  products(
    limit: $limit
    where: {
      _and: [
        { productType: { slug: { _in: $typeSlugs } } }
        {
          _or: [
            { productDeployments: { smartContractDeployment: { deployedOnProduct: { name: { _eq: $chain } } } } }
            { supportsProducts: { supportsProduct: { name: { _eq: $chain } } } }
            { root: { profileTags: { tag: { slug: { _eq: $tag } } } } }
          ]
        }
        { _not: { productStatus: { slug: { _in: $dead } } } }
      ]
    }
  ) {
    id
    name
    productType { slug name }
    productStatus { slug }
    root { slug urlMain gridRank { score } }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query VerticalSearch($typeSlugs:[String!]!,$chain:String!,$tag:String!,$dead:[String!]!,$limit:Int!){products(limit:$limit,where:{_and:[{productType:{slug:{_in:$typeSlugs}}},{_or:[{productDeployments:{smartContractDeployment:{deployedOnProduct:{name:{_eq:$chain}}}}},{supportsProducts:{supportsProduct:{name:{_eq:$chain}}}},{root:{profileTags:{tag:{slug:{_eq:$tag}}}}}]},{_not:{productStatus:{slug:{_in:$dead}}}}]}){id name productType{slug name}productStatus{slug}root{slug urlMain gridRank{score}}}}","variables":{"typeSlugs":["decentralised_exchange","dex_aggregator"],"chain":"Solana Mainnet","tag":"solana","dead":["discontinued","support_ended"],"limit":25}}
JSON
```

### Broad Keyword Search (Multi-Field)

When to use: first-pass recall when the topic doesn't map cleanly to product type slugs. Searches across product name, description, root slug, and entity names with dead-product exclusion.

```graphql
query BroadKeyword($q: String!, $dead: [String!]!, $limit: Int!) {
  products(
    limit: $limit
    where: {
      _and: [
        {
          _or: [
            { name: { _contains: $q } }
            { description: { _contains: $q } }
            { root: { slug: { _contains: $q } } }
            { root: { entities: { _or: [{ name: { _contains: $q } }, { tradeName: { _contains: $q } }] } } }
          ]
        }
        { _not: { productStatus: { slug: { _in: $dead } } } }
      ]
    }
  ) {
    id
    name
    description
    productType { slug name }
    productStatus { slug }
    root { slug urlMain }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query BroadKeyword($q:String!,$dead:[String!]!,$limit:Int!){products(limit:$limit,where:{_and:[{_or:[{name:{_contains:$q}},{description:{_contains:$q}},{root:{slug:{_contains:$q}}},{root:{entities:{_or:[{name:{_contains:$q}},{tradeName:{_contains:$q}}]}}}]},{_not:{productStatus:{slug:{_in:$dead}}}}]}){id name description productType{slug name}productStatus{slug}root{slug urlMain}}}","variables":{"q":"lending","dead":["discontinued","support_ended"],"limit":15}}
JSON
```

### Keyword Search: Products (Basic)

When to use: quick product lookup by keyword. For incumbent discovery, prefer **Vertical Search** (category-based) or **Broad Keyword Search** (multi-field) above.

```graphql
query SearchProducts($q: String!, $limit: Int!) {
  products(
    limit: $limit
    where: {
      _or: [{ name: { _contains: $q } }, { description: { _contains: $q } }]
    }
  ) {
    id
    name
    description
    launchDate
    productType { slug name }
    productStatus { slug name }
    root { slug urlMain gridRank { score } }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query SearchProducts($q:String!,$limit:Int!){products(limit:$limit,where:{_or:[{name:{_contains:$q}},{description:{_contains:$q}}]}){id name description launchDate productType{slug name} productStatus{slug name} root{slug urlMain gridRank{score}}}}","variables":{"q":"jupiter","limit":5}}
JSON
```

### Keyword Search: Entities

When to use: find organizations/companies (entities) and jump to the related root profile.

```graphql
query SearchEntities($q: String!, $limit: Int!) {
  entities(
    limit: $limit
    where: { _or: [{ name: { _contains: $q } }, { tradeName: { _contains: $q } }] }
  ) {
    id
    name
    tradeName
    country { name }
    root { slug urlMain }
    urls { url urlType { slug name } }
    socials { name socialType { slug name } urls { url } }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query SearchEntities($q:String!,$limit:Int!){entities(limit:$limit,where:{_or:[{name:{_contains:$q}},{tradeName:{_contains:$q}}]}){id name tradeName country{name} root{slug urlMain} urls{url urlType{slug name}} socials{name socialType{slug name} urls{url}}}}","variables":{"q":"coinbase","limit":5}}
JSON
```

### Expand: Root Profile (Deep)

When to use: once you have a root slug, pull descriptions, socials/urls, and a few products.

```graphql
query RootProfile($slug: String!) {
  roots(limit: 1, where: { slug: { _eq: $slug } }) {
    id
    slug
    urlMain
    gridRank { score }
    profileInfos {
      tagLine
      descriptionShort
      descriptionLong
      descriptionMarketing
    }
    urls { url urlType { slug name } }
    socials { name socialType { slug name } urls { url } }
    products(
      limit: 10
      order_by: { name: Asc }
      where: { isMainProduct: { _eq: 1 } }
    ) {
      id
      name
      productType { slug name }
      productStatus { slug name }
    }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query RootProfile($slug:String!){roots(limit:1,where:{slug:{_eq:$slug}}){id slug urlMain gridRank{score} profileInfos{tagLine descriptionShort descriptionLong descriptionMarketing} urls{url urlType{slug name}} socials{name socialType{slug name} urls{url}} products(limit:10,order_by:{name:Asc},where:{isMainProduct:{_eq:1}}){id name productType{slug name} productStatus{slug name}}}}","variables":{"slug":"Jupiter"}}
JSON
```

### Top Ecosystems: Rank Leaderboard

When to use: identify category leaders and "default" primitives to benchmark against.

```graphql
query TopRoots($limit: Int!) {
  roots(limit: $limit, order_by: { gridRank: { score: Desc } }) {
    slug
    urlMain
    gridRank { score }
    profileInfos { tagLine descriptionShort }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query TopRoots($limit:Int!){roots(limit:$limit,order_by:{gridRank:{score:Desc}}){slug urlMain gridRank{score} profileInfos{tagLine descriptionShort}}}","variables":{"limit":10}}
JSON
```

### Tags: Find Relevant Tags + Expand To Roots

When to use: tag-based discovery is often higher-signal than free-text search for ecosystems.

Find tag slugs by keyword:

```graphql
query SearchTags($q: String!, $limit: Int!) {
  tags(limit: $limit, where: { name: { _contains: $q } }, order_by: { name: Asc }) {
    id
    slug
    name
    tagType { slug name }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query SearchTags($q:String!,$limit:Int!){tags(limit:$limit,where:{name:{_contains:$q}},order_by:{name:Asc}){id slug name tagType{slug name}}}","variables":{"q":"defi","limit":10}}
JSON
```

Expand a tag slug to top roots (rank-sorted):

```graphql
query RootsByTag($tag: String!, $limit: Int!) {
  profileTags(
    limit: $limit
    where: { tag: { slug: { _eq: $tag } } }
    order_by: { root: { gridRank: { score: Desc } } }
  ) {
    root { slug urlMain gridRank { score } }
    tag { slug name }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query RootsByTag($tag:String!,$limit:Int!){profileTags(limit:$limit,where:{tag:{slug:{_eq:$tag}}},order_by:{root:{gridRank:{score:Desc}}}){root{slug urlMain gridRank{score}} tag{slug name}}}","variables":{"tag":"defi","limit":10}}
JSON
```

### Solana-Focused Discovery (Approach 1): Chain Attribute (CAIP-2)

When to use: discover chain roots (and chain-specific ecosystems) by standard chain identifiers.

```graphql
query RootsByAttribute($attrSlug: String!, $needle: String!, $limit: Int!) {
  roots(
    limit: $limit
    where: {
      attributes: {
        attributeType: { slug: { _eq: $attrSlug } }
        value: { _contains: $needle }
      }
    }
  ) {
    slug
    urlMain
    attributes(where: { attributeType: { slug: { _eq: $attrSlug } } }) { value }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query RootsByAttribute($attrSlug:String!,$needle:String!,$limit:Int!){roots(limit:$limit,where:{attributes:{attributeType:{slug:{_eq:$attrSlug}},value:{_contains:$needle}}}){slug urlMain attributes(where:{attributeType:{slug:{_eq:$attrSlug}}}){value}}}","variables":{"attrSlug":"chain_id_caip2","needle":"solana:","limit":10}}
JSON
```

### Solana-Focused Discovery (Approach 2): Smart Contract Deployments

When to use: find products with on-chain deployments on a specific chain.

Step A: find the chain "product id" (example: Solana Mainnet).

```graphql
query FindChainProduct($q: String!) {
  products(limit: 10, where: { name: { _contains: $q } }) { id name }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query FindChainProduct($q:String!){products(limit:10,where:{name:{_contains:$q}}){id name}}","variables":{"q":"Solana Mainnet"}}
JSON
```

Step B: filter products deployed on that chain (use the id from Step A; for Solana Mainnet it's commonly `22`).

```graphql
query ProductsDeployedOn($deployedOnId: String!, $limit: Int!) {
  products(
    limit: $limit
    where: {
      productDeployments: {
        smartContractDeployment: { deployedOnId: { _eq: $deployedOnId } }
      }
    }
  ) {
    id
    name
    productType { slug name }
    productStatus { slug name }
    root { slug urlMain }
    productDeployments(limit: 2) {
      smartContractDeployment {
        deployedOnProduct { name }
        smartContracts(limit: 2) { address name }
      }
    }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query ProductsDeployedOn($deployedOnId:String!,$limit:Int!){products(limit:$limit,where:{productDeployments:{smartContractDeployment:{deployedOnId:{_eq:$deployedOnId}}}}){id name productType{slug name} productStatus{slug name} root{slug urlMain} productDeployments(limit:2){smartContractDeployment{deployedOnProduct{name} smartContracts(limit:2){address name}}}}}","variables":{"deployedOnId":"22","limit":10}}
JSON
```

### Solana-Focused Discovery (Approach 3): Profile Tags (Broadest)

When to use: broadest Solana ecosystem discovery; deployment-based is narrower but more precise. This is the **recommended default** for Solana scoping.

```graphql
query SolanaByTag($tag: String!, $limit: Int!) {
  products(
    limit: $limit
    where: {
      root: { profileTags: { tag: { slug: { _eq: $tag } } } }
      _not: { productStatus: { slug: { _in: ["discontinued", "support_ended"] } } }
    }
    order_by: { root: { gridRank: { score: Desc } } }
  ) {
    id
    name
    productType { slug name }
    productStatus { slug }
    root { slug urlMain gridRank { score } }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query SolanaByTag($tag:String!,$limit:Int!){products(limit:$limit,where:{root:{profileTags:{tag:{slug:{_eq:$tag}}}},_not:{productStatus:{slug:{_in:[\"discontinued\",\"support_ended\"]}}}},order_by:{root:{gridRank:{score:Desc}}}){id name productType{slug name}productStatus{slug}root{slug urlMain gridRank{score}}}}","variables":{"tag":"solana","limit":25}}
JSON
```

### Integration Graph: Supports Products (Dependencies + Reverse Dependencies)

When to use: map dependencies (infra, RPCs, frameworks) and identify missing primitives.

```graphql
query ProductSupportGraph($productId: String!) {
  productsById(id: $productId) {
    id
    name
    root { slug urlMain }
    supportsProducts(limit: 25) {
      supportsProduct { id name root { slug urlMain } }
    }
    supportsProductsBySupportsProductId(limit: 25) {
      product { id name root { slug urlMain } }
    }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query ProductSupportGraph($productId:String!){productsById(id:$productId){id name root{slug urlMain} supportsProducts(limit:25){supportsProduct{id name root{slug urlMain}}} supportsProductsBySupportsProductId(limit:25){product{id name root{slug urlMain}}}}}","variables":{"productId":"100"}}
JSON
```

### Asset / Token Mapping: Find By Ticker + Expand Relationships

When to use: link a token to products, distribution platforms, and governance systems.

Find the asset by ticker:

```graphql
query FindAssetByTicker($ticker: String!) {
  assets(limit: 5, where: { ticker: { _eq: $ticker } }) {
    id
    name
    ticker
    description
    assetType { slug name }
    root { slug urlMain }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query FindAssetByTicker($ticker:String!){assets(limit:5,where:{ticker:{_eq:$ticker}}){id name ticker description assetType{slug name} root{slug urlMain}}}","variables":{"ticker":"DRIFT"}}
JSON
```

Expand asset relationships:

```graphql
query AssetRelationships($assetId: String!) {
  assetsById(id: $assetId) {
    id
    name
    ticker
    root { slug urlMain }
    productAssetRelationships(limit: 25) {
      assetSupportType { slug name }
      product { id name root { slug urlMain } }
    }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query AssetRelationships($assetId:String!){assetsById(id:$assetId){id name ticker root{slug urlMain} productAssetRelationships(limit:25){assetSupportType{slug name} product{id name root{slug urlMain}}}}}","variables":{"assetId":"101"}}
JSON
```

### Root Relationship Graph: Corporate / Suite Structure

When to use: discover parent-child relationships like "managed by", "acquired by", "product of".

Step A: resolve a root slug to a root id.

```graphql
query RootId($slug: String!) {
  roots(limit: 1, where: { slug: { _eq: $slug } }) { id slug urlMain }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query RootId($slug:String!){roots(limit:1,where:{slug:{_eq:$slug}}){id slug urlMain}}","variables":{"slug":"Coinbase"}}
JSON
```

Step B: fetch relationships by `parentRootId` (filtering by slug is not supported in the relationship bool exp).

```graphql
query RootRelationships($rootId: String!, $limit: Int!) {
  rootRelationships(limit: $limit, where: { parentRootId: { _eq: $rootId } }) {
    rootRelationshipType { slug name }
    childRoot { id slug urlMain }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query RootRelationships($rootId:String!,$limit:Int!){rootRelationships(limit:$limit,where:{parentRootId:{_eq:$rootId}}){rootRelationshipType{slug name} childRoot{id slug urlMain}}}","variables":{"rootId":"1125","limit":25}}
JSON
```

### Aggregates: Saturation Signals

When to use: estimate how crowded a space is before you claim a "gap". Use the category-based version for vertical analysis; the keyword version for quick checks.

**Category-based** (recommended for vertical analysis):

```graphql
query VerticalSaturation($typeSlugs: [String!]!, $tag: String!, $dead: [String!]!) {
  productsAggregate(
    filter_input: {
      where: {
        _and: [
          { productType: { slug: { _in: $typeSlugs } } }
          { root: { profileTags: { tag: { slug: { _eq: $tag } } } } }
          { _not: { productStatus: { slug: { _in: $dead } } } }
        ]
      }
    }
  ) {
    _count
    rootId { _count_distinct }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query VerticalSaturation($typeSlugs:[String!]!,$tag:String!,$dead:[String!]!){productsAggregate(filter_input:{where:{_and:[{productType:{slug:{_in:$typeSlugs}}},{root:{profileTags:{tag:{slug:{_eq:$tag}}}}},{_not:{productStatus:{slug:{_in:$dead}}}}]}}){_count rootId{_count_distinct}}}","variables":{"typeSlugs":["decentralised_exchange","dex_aggregator"],"tag":"solana","dead":["discontinued","support_ended"]}}
JSON
```

**Keyword-based** (quick check):

```graphql
query ProductSaturation($q: String!) {
  productsAggregate(filter_input: { where: { name: { _contains: $q } } }) {
    _count
    rootId { _count_distinct }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query ProductSaturation($q:String!){productsAggregate(filter_input:{where:{name:{_contains:$q}}}){_count rootId{_count_distinct}}}","variables":{"q":"drift"}}
JSON
```

## Advanced / Keyed Endpoints (If You Have Access)

The following is an example of an endpoint that requires an `xApiKey` GraphQL argument. Do not assume this works without explicit access.

```graphql
query AlphaVybeRanking($xApiKey: String!) {
  alphaVybeRanking(xApiKey: $xApiKey, limit: 10) {
    date
    interval
    limit
    data {
      programId
      programName
      programRank
      score
      smartContract { address name }
    }
  }
}
```

```bash
curl -sS -X POST "$THEGRID_GRAPHQL_ENDPOINT" "${H[@]}" --data-binary @- <<'JSON' | jq '{data, errors}'
{"query":"query AlphaVybeRanking($xApiKey:String!){alphaVybeRanking(xApiKey:$xApiKey,limit:10){date interval limit data{programId programName programRank score smartContract{address name}}}}","variables":{"xApiKey":"REQUIRES_ACCESS_KEY"}}
JSON
```

## Idea-Generation Workflow (Recommended)

1. **Map topic to slugs**: Use the Product Type Slug Taxonomy to identify 1-3 `productType` slugs for your domain.
2. **Vertical Search**: Run the Vertical Search recipe with your slugs + Solana scoping to get the highest-precision incumbent list.
3. **Broad Keyword Search**: Run the Broad Keyword Search for recall — catches products that don't fit standard categories.
4. **Saturation check**: Run the category-based aggregate to count total products and distinct roots. This grounds your "crowded vs. whitespace" assessment.
5. **Expand top incumbents**: Pick 3-5 top results and expand their root profiles (descriptions, tags, socials, product lists).
6. **Map dependencies**: For each incumbent product, map `supportsProducts` (what they depend on) and `supportsProductsBySupportsProductId` (what depends on them) to find missing primitives.
7. **Asset mapping**: Find key token(s) and where they are distributed/governed.
8. **Tag-based discovery**: Use profile tags to explore adjacent ecosystems or niche intersections (e.g., `solana` + `defi`).

## Terms / Attribution

- The Grid docs: https://docs.thegrid.id
- Explorer reference implementation: https://github.com/The-Grid-Data/Explorer
- Respect The Grid licensing/terms. The Explorer repo notes that the Explorer code is MIT-licensed, but The Grid data service is separately licensed under The Grid's Web Services Terms unless you have a separate signed order.
