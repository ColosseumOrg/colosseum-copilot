# Tooling Reference

Use this reference with `colosseum-copilot-find-tools`. It summarizes the public
Colosseum Resources advisor content in neutral language and explains how to combine it
with Copilot corpus evidence.

## Source Order

1. Probe a public live resource index if available:
   - If `COLOSSEUM_DEV_RESOURCES_URL` is set, try that URL first.
   - Then try `https://ColosseumOrg.github.io/hackathon-resources/current.json`.
2. If the live index is unavailable, use this static category guidance and say the live
   resource index could not be reached.
3. Ground fit against Copilot evidence:
   - Mine nearby projects with `POST /search/projects` and `includeFacets` for
     `techStack`, `primitives`, and `solutionTags`.
   - Search archives for protocol docs or implementation notes.
   - Cite project slugs and archive document IDs next to recommendations.

Do not invent sponsor offers, docs links, install commands, or grants. Only quote exact
links and skill install commands from the live resource data when present.

## Live Resource Shape

The public resource JSON may include:

- `sponsors`: tools with names, descriptions, tags, links, markdown content, `hasSkill`,
  and optional `skillRepositoryUrl` or `skillInstallCommand`.
- `rpcProviders`: RPC providers with offers and links.
- `resources`: curated build-path resources.
- `resourceGroups`: grouped foundations and build-path resources.

Use 2-4 recommendations for a normal answer. For each recommendation include:

- What it does.
- Why it fits this exact project.
- One concrete integration move.
- A docs or starter link from the live resource entry when available.
- The sponsor skill install command only if the live entry provides it.

## Category Guidance

Use these as routing hints, not as uncited claims.

- Confidential compute, private state, sealed bids, hidden positions, or private voting:
  look for confidential compute or privacy sponsors such as Arcium in the live resource
  data, then verify with archives on the underlying primitive.
- Consumer wallet, mobile onboarding, wallet connection, collectibles, points, or rewards:
  look for wallet and mobile resources such as Phantom entries, mobile build paths, and
  relevant wallet docs.
- NFT, game asset, metadata, editions, compressed assets, or marketplace flows: look for
  Metaplex and asset-standard resources, then verify similar project tech stacks.
- Treasury, protocol admin, upgrade authority, grants, DAO operations, or multisig
  controls: look for Squads or comparable multisig/governance resources.
- Fiat onramp, payouts, stablecoin redemption, payments, or embedded finance: look for
  payments and onramp resources such as MoonPay or Swig when present in the live index.
- DeFi trading, routing, liquidity, or swaps: search archives and nearby projects for
  Jupiter, Meteora, Orca, Drift, margin, routing, liquidity, and risk patterns.
- High-throughput reads, indexers, transaction submission, bots, dashboards, or trading
  apps: choose an RPC or data provider from the live `rpcProviders` list and cite the
  provider entry.
- Agents, automation, codegen, or onchain workflows: look for agent framework resources
  in the live index and verify nearby projects' tech-stack tags.

## Thin Coverage

When no strong match exists, say:

> The current resource corpus does not have a strong dedicated match for this requirement.

Then provide the closest general resource, the missing capability, and a concrete question
the builder should ask in the relevant developer community.
