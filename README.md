# Colosseum Copilot

Copilot is your agent's connection to Colosseum. Use project histories, crypto archives, The Grid, and current primary sources to answer a question, make a founder decision, or choose tools.

Research and tool guidance work inside your agent. Solana is our deepest evidence base; other ecosystems have uneven coverage. Copilot recommends tools for your product and existing stack, including offchain or existing-provider approaches when appropriate.

## Start

You need a compatible AI agent, a Colosseum account for protected evidence, and Node.js 20 or later with npm and `npx` for installation and the connection helper. The agent must be able to read skills and make authorized HTTPS requests. Claude Code, Codex, and OpenClaw are examples, not an allowlist or a guarantee of identical capabilities. Your agent/model provider bills its own usage under its terms.

```bash
npx skills add ColosseumOrg/colosseum-copilot
npx @colosseum-org/copilot-connect login
npx @colosseum-org/copilot-connect status
```

The helper flow is available with v2. Default login opens the browser using PKCE; use `npx @colosseum-org/copilot-connect login --device` for remote environments or blocked callbacks. Credentials stay in the helper's protected storage. Do not paste tokens into chat. Existing v1 personal tokens return v1 data only and stop working on October 28, 2026 at 00:00 UTC. Update the skill and sign in with the helper before then.

Then ask your agent for a task, for example:

- Research: "Compare two relevant stablecoin payment project histories. Separate submission-time claims from later outcomes, cite dates, and tell me what remains unknown."
- Tools: "Given my existing stack and customers, which payment tools should I evaluate? Check current support and explain the tradeoffs."

These are example requests, not claimed results. The agent selects the evidence and checks needed for your task; there is no required research funnel.

## What is coming

Posting project updates and completing submissions from your agent are coming; nothing writes to your project yet. Current research and tool guidance do not authorize platform writes, deployments, signing, or publication.

## Help and privacy

Read the [documentation](https://docs.colosseum.com/copilot), [connection guide](skills/colosseum-copilot/references/connection.md), or [API reference](skills/colosseum-copilot/references/api-reference.md). Use the helper's `revoke` command or Arena's connected-agents page to revoke a connection. The Arena page also lets you turn session sharing on or off for each connection. For skill issues, [open an issue](https://github.com/ColosseumOrg/colosseum-copilot/issues) with redacted errors and versions; never include credentials or private repository content.

The agent sends necessary API queries to Colosseum and any separately authorized services. Do not automatically upload repositories or conversations. Feedback and source suggestions require explicit authorization. Agent/provider handling is governed by their own terms.

## License and terms

The skill declares **Proprietary**, copyright Colosseum. This repository has no separate LICENSE file granting an open-source license. Public visibility does not grant additional reuse rights. Follow the Colosseum terms presented during account authorization and the terms of your agent and optional data providers.
