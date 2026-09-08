# The Grid query recipes

## The Grid (Direct GraphQL)

These inherited query examples were not re-executed for the v2 documentation rewrite. Validate the live schema and source dates before relying on their results. Queries go directly to The Grid; send only public task context authorized by the user.

### Schema overview

- **Endpoint**: `https://beta.node.thegrid.id/graphql`
- **GraphiQL**: `https://cloud.hasura.io/public/graphiql?endpoint=https%3A%2F%2Fbeta.node.thegrid.id%2Fgraphql`
- **Auth**: No API key required for public queries. If you have an enterprise key, add `-H "x-api-key: <key>"`.
- **Schema hierarchy**: `roots` → `products`/`entities`/`assets`/`profileInfos` → `deployments`/`contracts`
- **Operators**: `_eq`, `_in`, `_contains`, `_like`, `_gt`/`_gte`/`_lt`/`_lte`, `_and`/`_or`/`_not`, `_is_null`
- No full-text search — `_contains` and `_like` are case-insensitive substring matches
- Always check the `errors` field in JSON responses (GraphQL errors return HTTP 200)

### Product Type Slug Cheat Sheet

These example type slugs may change. Check the current schema before use; the list is not a market taxonomy.

- **DeFi**: `decentralised_exchange`, `decentralised_borrowing_and_lending`, `yield_aggregator`, `dex_aggregator`, `liquid_staking`, `derivatives`
- **Payments**: `merchant_payment_gateway`, `on_off_ramp`, `payments_infrastructure_and_orchestration`
- **Infrastructure**: `developer_tooling`, `block_explorer`, `onchain_data_api`, `rpc_provider`, `oracle`
- **AI**: `ai_agent`, `ai_agent_platform`, `ai_agent_framework`
- **Other**: `wallet`, `game`, `bridge`, `depin`, `stablecoin_issuance`, `nft_marketplace`

### Query Recipes

#### 1. Category search with optional Solana scoping

This example filters by type and Solana relations and excludes discontinued records. Keep discontinued/unknown cases when researching histories; remove or change chain restrictions for other ecosystems. A status label is metadata, not independently verified outcome evidence.

```bash
curl -s -X POST "https://beta.node.thegrid.id/graphql" \
  -H "content-type: application/json" \
  --data-binary @- <<'QUERY'
{"query":"query VerticalSearch($typeSlugs:[String!]!,$chain:String!,$tag:String!,$dead:[String!]!,$limit:Int!){products(limit:$limit,where:{_and:[{productType:{slug:{_in:$typeSlugs}}},{_or:[{productDeployments:{smartContractDeployment:{deployedOnProduct:{name:{_eq:$chain}}}}},{supportsProducts:{supportsProduct:{name:{_eq:$chain}}}},{root:{profileTags:{tag:{slug:{_eq:$tag}}}}}]},{_not:{productStatus:{slug:{_in:$dead}}}}]}){id name productType{slug name}productStatus{slug}root{slug urlMain gridRank{score}}}}","variables":{"typeSlugs":["decentralised_exchange","dex_aggregator"],"chain":"Solana Mainnet","tag":"solana","dead":["discontinued","support_ended"],"limit":25}}
QUERY
```

#### 2. Broad keyword search

Searches across product name, description, root slug, and entity names. Use when the topic doesn't map cleanly to product type slugs:

```bash
curl -s -X POST "https://beta.node.thegrid.id/graphql" \
  -H "content-type: application/json" \
  --data-binary @- <<'QUERY'
{"query":"query BroadKeyword($q:String!,$dead:[String!]!,$limit:Int!){products(limit:$limit,where:{_and:[{_or:[{name:{_contains:$q}},{description:{_contains:$q}},{root:{slug:{_contains:$q}}},{root:{entities:{_or:[{name:{_contains:$q}},{tradeName:{_contains:$q}}]}}}]},{_not:{productStatus:{slug:{_in:$dead}}}}]}){id name description productType{slug name}productStatus{slug}root{slug urlMain}}}","variables":{"q":"lending","dead":["discontinued","support_ended"],"limit":15}}
QUERY
```

#### 3. Root profile expansion

Once you have a root slug, pull descriptions, tags, socials, URLs, and products:

```bash
curl -s -X POST "https://beta.node.thegrid.id/graphql" \
  -H "content-type: application/json" \
  --data-binary @- <<'QUERY'
{"query":"query RootProfile($slug:String!){roots(limit:1,where:{slug:{_eq:$slug}}){id slug urlMain gridRank{score}profileInfos{tagLine descriptionShort descriptionLong}urls{url urlType{slug name}}socials{name socialType{slug name}urls{url}}products(limit:10,order_by:{name:Asc}){id name productType{slug name}productStatus{slug name}}profileTags(limit:10){tag{slug name}}}}","variables":{"slug":"Jupiter"}}
QUERY
```

#### 4. Corpus aggregate

Count products and distinct roots matching a category filter. These are corpus counts, not market size or adoption.

```bash
curl -s -X POST "https://beta.node.thegrid.id/graphql" \
  -H "content-type: application/json" \
  --data-binary @- <<'QUERY'
{"query":"query Saturation($typeSlugs:[String!]!,$tag:String!,$dead:[String!]!){productsAggregate(filter_input:{where:{_and:[{productType:{slug:{_in:$typeSlugs}}},{root:{profileTags:{tag:{slug:{_eq:$tag}}}}},{_not:{productStatus:{slug:{_in:$dead}}}}]}}){_count rootId{_count_distinct}}}","variables":{"typeSlugs":["decentralised_exchange","dex_aggregator"],"tag":"solana","dead":["discontinued","support_ended"]}}
QUERY
```

### Solana Ecosystem Filtering

Three approaches with different coverage/precision trade-offs:

- **Tag-based** (broadest): `root: { profileTags: { tag: { slug: { _eq: "solana" } } } }`
- **Deployment-based** (highest precision, narrower coverage): `productDeployments: { smartContractDeployment: { deployedOnProduct: { name: { _eq: "Solana Mainnet" } } } }`
- **CAIP-2 attribute** (narrow, limited coverage): `attributes: { attributeType: { slug: { _eq: "chain_id_caip2" } }, value: { _contains: "solana" } }`

The category recipe combines deployment, supports-product, and profile-tag relations. Those relations have different coverage; none proves current product activity.

See [Grid context](the-grid-skill.md) and the [current upstream documentation](https://docs.thegrid.id) for schema changes and additional queries.
