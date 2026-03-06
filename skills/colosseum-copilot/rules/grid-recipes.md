# The Grid — GraphQL Recipes

## The Grid (Direct GraphQL)

### Schema Overview

- **Endpoint**: `https://beta.node.thegrid.id/graphql`
- **GraphiQL**: `https://cloud.hasura.io/public/graphiql?endpoint=https%3A%2F%2Fbeta.node.thegrid.id%2Fgraphql`
- **Auth**: No API key required for public queries. If you have an enterprise key, add `-H "x-api-key: <key>"`.
- **Schema hierarchy**: `roots` → `products`/`entities`/`assets`/`profileInfos` → `deployments`/`contracts`
- **Data volume**: ~6,300 products, ~3,000 roots, ~2,500 entities
- **Operators**: `_eq`, `_in`, `_contains`, `_like`, `_gt`/`_gte`/`_lt`/`_lte`, `_and`/`_or`/`_not`, `_is_null`
- No full-text search — `_contains` and `_like` are case-insensitive substring matches
- Always check the `errors` field in JSON responses (GraphQL errors return HTTP 200)

### Product Type Slug Cheat Sheet

See the topic → slug mapping table and full slug list in **Step 2e** above. Key verticals for quick reference:

- **DeFi**: `decentralised_exchange` (207), `decentralised_borrowing_and_lending` (114), `yield_aggregator` (113), `dex_aggregator` (81), `liquid_staking` (82), `derivatives` (46)
- **Payments**: `merchant_payment_gateway` (159), `on_off_ramp` (145), `payments_infrastructure_and_orchestration` (136)
- **Infrastructure**: `developer_tooling` (599), `block_explorer` (113), `onchain_data_api` (100), `rpc_provider` (44), `oracle` (46)
- **AI**: `ai_agent` (104), `ai_agent_platform` (77), `ai_agent_framework` (27)
- **Other**: `wallet` (331), `game` (131), `bridge` (101), `depin` (80), `stablecoin_issuance` (71), `nft_marketplace` (68)

### Query Recipes

#### 1. Vertical Search (category + Solana scoping) — default starting point

Filter by `productType` slugs with triple-OR Solana scoping (deployment, supports-product, profile tag) and dead-product exclusion:

```bash
curl -s -X POST "https://beta.node.thegrid.id/graphql" \
  -H "content-type: application/json" \
  --data-binary @- <<'QUERY'
{"query":"query VerticalSearch($typeSlugs:[String!]!,$chain:String!,$tag:String!,$dead:[String!]!,$limit:Int!){products(limit:$limit,where:{_and:[{productType:{slug:{_in:$typeSlugs}}},{_or:[{productDeployments:{smartContractDeployment:{deployedOnProduct:{name:{_eq:$chain}}}}},{supportsProducts:{supportsProduct:{name:{_eq:$chain}}}},{root:{profileTags:{tag:{slug:{_eq:$tag}}}}}]},{_not:{productStatus:{slug:{_in:$dead}}}}]}){id name productType{slug name}productStatus{slug}root{slug urlMain gridRank{score}}}}","variables":{"typeSlugs":["decentralised_exchange","dex_aggregator"],"chain":"Solana Mainnet","tag":"solana","dead":["discontinued","support_ended"],"limit":25}}
QUERY
```

#### 2. Broad Keyword Search (name/description/slug/entity recall) — fallback

Searches across product name, description, root slug, and entity names. Use when the topic doesn't map cleanly to product type slugs:

```bash
curl -s -X POST "https://beta.node.thegrid.id/graphql" \
  -H "content-type: application/json" \
  --data-binary @- <<'QUERY'
{"query":"query BroadKeyword($q:String!,$dead:[String!]!,$limit:Int!){products(limit:$limit,where:{_and:[{_or:[{name:{_contains:$q}},{description:{_contains:$q}},{root:{slug:{_contains:$q}}},{root:{entities:{_or:[{name:{_contains:$q}},{tradeName:{_contains:$q}}]}}}]},{_not:{productStatus:{slug:{_in:$dead}}}}]}){id name description productType{slug name}productStatus{slug}root{slug urlMain}}}","variables":{"q":"lending","dead":["discontinued","support_ended"],"limit":15}}
QUERY
```

#### 3. Root Profile Expansion (deep enrichment) — for Step 6 incumbent analysis

Once you have a root slug, pull descriptions, tags, socials, URLs, and products:

```bash
curl -s -X POST "https://beta.node.thegrid.id/graphql" \
  -H "content-type: application/json" \
  --data-binary @- <<'QUERY'
{"query":"query RootProfile($slug:String!){roots(limit:1,where:{slug:{_eq:$slug}}){id slug urlMain gridRank{score}profileInfos{tagLine descriptionShort descriptionLong}urls{url urlType{slug name}}socials{name socialType{slug name}urls{url}}products(limit:10,order_by:{name:Asc}){id name productType{slug name}productStatus{slug name}}profileTags(limit:10){tag{slug name}}}}","variables":{"slug":"Jupiter"}}
QUERY
```

#### 4. Saturation Aggregate (product count + distinct root count) — for gap validation

Count total products and distinct roots matching a category filter. Use to ground "how crowded is this space?" claims:

```bash
curl -s -X POST "https://beta.node.thegrid.id/graphql" \
  -H "content-type: application/json" \
  --data-binary @- <<'QUERY'
{"query":"query Saturation($typeSlugs:[String!]!,$tag:String!,$dead:[String!]!){productsAggregate(filter_input:{where:{_and:[{productType:{slug:{_in:$typeSlugs}}},{root:{profileTags:{tag:{slug:{_eq:$tag}}}}},{_not:{productStatus:{slug:{_in:$dead}}}}]}}){_count rootId{_count_distinct}}}","variables":{"typeSlugs":["decentralised_exchange","dex_aggregator"],"tag":"solana","dead":["discontinued","support_ended"]}}
QUERY
```

### Solana Ecosystem Filtering

Three approaches with different coverage/precision trade-offs:

- **Tag-based** (broadest, ~3,400 products): `root: { profileTags: { tag: { slug: { _eq: "solana" } } } }`
- **Deployment-based** (highest precision, ~510 products): `productDeployments: { smartContractDeployment: { deployedOnProduct: { name: { _eq: "Solana Mainnet" } } } }`
- **CAIP-2 attribute** (narrow, limited coverage): `attributes: { attributeType: { slug: { _eq: "chain_id_caip2" } }, value: { _contains: "solana" } }`

The Vertical Search recipe above uses triple-OR across all three for maximum recall.

For additional Grid query recipes (asset mapping, token relationships, deployment graphs, corporate structure), see `the-grid-skill.md`.

