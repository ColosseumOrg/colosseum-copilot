# Colosseum Copilot

Copilot is your agent's connection to Colosseum. Use project histories, crypto archives, and current primary sources to answer a question, make a founder decision, choose tools, or make a verified local change in your repository.

Research and build guidance work inside your agent. Solana is our deepest evidence base; other ecosystems have uneven coverage. Copilot recommends tools for your product and existing stack, including offchain or existing-provider approaches when appropriate.

## Start

You need a compatible AI agent, a Colosseum account for protected evidence, and Node.js/npm with `npx` for installation and the connection helper. The agent must be able to read skills and make authorized HTTPS requests. Local implementation also needs filesystem and coding tools. Claude Code, Codex, and OpenClaw are examples, not an allowlist or a guarantee of identical capabilities. Your agent/model provider bills its own usage under its terms.

```bash
npx skills add ColosseumOrg/colosseum-copilot
npx @colosseum/copilot-connect login
npx @colosseum/copilot-connect status
```

The helper flow is available with v2. Default login opens the browser using PKCE; use `npx @colosseum/copilot-connect login --device` for remote environments or blocked callbacks. Credentials stay in the helper's protected storage. Do not paste tokens into chat. Existing v1 PATs remain supported for 90 days after GA.

Then ask your agent for a task, for example:

- Research: "Compare two relevant stablecoin payment project histories. Separate submission-time claims from later outcomes, cite dates, and tell me what remains unknown."
- Build and tools: "Inspect this repository and add one useful transaction-builder validation. Keep my chosen chain and dependencies, run the relevant checks, and show the result."

These are example requests, not claimed results. The agent selects the evidence and checks needed for your task; there is no required research funnel.

## What is coming

Posting project updates and completing submissions from your agent are coming; nothing writes to your project yet. This direction is unshipped. Current research and local coding guidance do not authorize platform writes, deployments, signing, or publication.

Optional [Frames research](skills/colosseum-copilot/references/frames.md) uses your own account and credits only after approval for a bounded task. Frames is a Colosseum portfolio company; affiliation does not affect source ranking. It is not required for setup.

## Help and privacy

Read the [documentation](https://docs.colosseum.com/copilot), [connection guide](skills/colosseum-copilot/references/connection.md), or [API reference](skills/colosseum-copilot/references/api-reference.md). Manage grants at [Colosseum Arena](https://colosseum.com/arena/copilot). For skill issues, [open an issue](https://github.com/ColosseumOrg/colosseum-copilot/issues) with redacted errors and versions; never include credentials or private repository content.

The agent sends necessary API queries to Colosseum and any separately authorized services. Do not automatically upload repositories or conversations. Feedback and source suggestions require explicit authorization. Agent/provider handling is governed by their own terms; local coding does not mean all model processing is local.

## License and terms

The skill declares **Proprietary**, copyright Colosseum. This repository has no separate LICENSE file granting an open-source license. Public visibility does not grant additional reuse rights. Follow the Colosseum terms presented during account authorization and the terms of your agent and optional data providers.
