# The Grid context

The Grid provides product, organization, asset, deployment, and relationship records for competitor and landscape research. Use it alongside web search, Colosseum project evidence, and current primary sources. See [query recipes](grid-recipes.md) and [upstream documentation](https://docs.thegrid.id) for the current schema and access requirements.

The public endpoint is `https://beta.node.thegrid.id/graphql`. It is a third-party service; requests leave the device. Do not send a Copilot credential, private source, or unrelated conversation history. Public queries currently require no key, but check current terms before relying on that behavior.

Check the response's `errors` field even after HTTP 200. Inspect pagination and filters before interpreting missing results. Resolve identity through explicit links and IDs, not matching names. Follow source URLs to verify consequential claims and date those reads.

Counts describe covered metadata records, not customers, market size, or commercial success. Chain tags, deployments, and product-support relations have different meanings. Product status is an attributed record, not proof of an outcome. Retain discontinued and unknown cases for historical comparisons when relevant.

The [query recipes](grid-recipes.md) were checked against the public schema on September 25, 2026. If a query breaks, consult the upstream schema instead of inventing fields. Do not bypass a TLS certificate error. For startup-history interpretation, see [research methods](research-methods.md).
