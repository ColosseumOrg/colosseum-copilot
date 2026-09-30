# Colosseum Copilot

Copilot is your agent's connection to Colosseum. Use project histories, crypto archives, The Grid, and current primary sources to answer a question, make a founder decision, or choose tools.

Research and tool guidance work inside your agent. Solana is our deepest evidence base; other ecosystems have uneven coverage. Copilot recommends tools for your product and existing stack, including offchain or existing-provider approaches when appropriate.

## Start

You need a compatible AI agent, a Colosseum account for protected evidence, and Node.js 20 or later with npm and `npx` for installation and the connection helper. The agent must be able to read skills and make authorized HTTPS requests. Claude Code, Codex, and OpenClaw are examples, not an allowlist or a guarantee of identical capabilities. Your agent/model provider bills its own usage under its terms.

```bash
npx skills add ColosseumOrg/colosseum-copilot -g
npx @colosseum-org/copilot-connect login
npx @colosseum-org/copilot-connect status
```

Installing globally replaces an older Copilot skill in place. If you once installed Copilot inside a project, run `npx skills remove colosseum-copilot` there so the old copy can't load instead. For OpenClaw, add `-a openclaw`. On Windows PowerShell, run the helper through `npx.cmd`.

For tool picks from the same hub without signing in, use the lighter [`colosseum-resources` skill](https://github.com/ColosseumOrg/colosseum-resources) (`npx skills add ColosseumOrg/colosseum-resources`).

Default login opens the browser using PKCE; use `npx @colosseum-org/copilot-connect login --device` for remote environments or blocked callbacks. Credentials stay in the helper's protected storage. Do not paste tokens into chat. v1 tokens return v1 data only and stop working at 00:00 UTC on October 28, 2026 (the evening of October 27 in the Americas). Update the skill and sign in with the helper before then.

Then ask your agent for a task, for example:

- Research: "Compare two relevant stablecoin payment project histories. Separate submission-time claims from later outcomes, cite dates, and tell me what remains unknown."
- Tools: "Given my existing stack and customers, which payment tools should I evaluate? Check current support and explain the tradeoffs."

These are example requests, not claimed results. The agent picks the evidence and checks your task needs.

## Help and privacy

Read the [documentation](https://docs.colosseum.com/copilot), [connection guide](skills/colosseum-copilot/references/connection.md), or [API reference](skills/colosseum-copilot/references/api-reference.md). Use the helper's `revoke` command or [Arena's connected-agents page](https://colosseum.com/arena/copilot/connections) to revoke a connection. The sign-in choice is "Help improve Copilot (optional)": "Share your questions and your agent's answers with Colosseum, not files or tool output. We keep them for 12 months to make Copilot better." It's unchecked by default. If you opt in, that connection's sessions are shared until you turn sharing off. The Arena page lets you turn sharing on or off for each connection. For skill issues, [open an issue](https://github.com/ColosseumOrg/colosseum-copilot/issues) with redacted errors and versions; never include credentials or private repository content.

Your agent sends Colosseum only the API queries it needs, plus other services you've authorized. It doesn't upload repositories. It shares conversations only if you opt in. Feedback and source suggestions need your approval each time. Your agent and model provider handle data under their own terms.

## License and terms

The skill declares **Proprietary**, copyright Colosseum. This repository has no separate LICENSE file granting an open-source license. Public visibility does not grant additional reuse rights. Follow the Colosseum terms presented during account authorization and the terms of your agent and optional data providers.
