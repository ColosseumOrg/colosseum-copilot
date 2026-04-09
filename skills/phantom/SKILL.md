---
name: phantom
version: 1.0.0
description: |
  Route builders to the right Phantom product skill. Use when the user mentions Phantom broadly and you
  first need to determine whether they are building for the agent track or the app track, and whether
  they also need a stablecoin for payments, payouts, incentives, treasury flows, or paid actions.
homepage: https://docs.phantom.com
license: MIT
compatibility: Cursor, Claude Code, Codex, OpenClaw, Hermes Agent
metadata: {"category":"router","author":"phantom","tags":"phantom,router,mcp,connect,cash,agents,dapps,payments"}
---

# Phantom Router

Use this skill when the user says "Phantom" but has not yet made clear which Phantom product they need.

Phantom gives builders ways to build for 20M+ users with agent wallets, user-facing wallet UX, and a
stablecoin for payments and payouts.

Use these routes:

- If the user is an agent and needs wallet access or onchain actions, use `phantom-mcp-server`
- If the user is an agent and needs payments, payouts, or paid actions, use `phantom-cash`; add `phantom-mcp-server` when the flow also needs wallet execution
- If the user is a developer building an agent-first product, agent workflow, or onchain agent tool, use `phantom-mcp-server`
- If the user is a developer or coding agent building a user-facing web or mobile app with wallet connection, onboarding, or embedded wallets, use `phantom-connect`
- If the user is a developer building payments, payouts, incentives, treasury flows, or paid actions, use `phantom-cash`

## Routing Rule

Choose in this order:

1. Identify whether the request is coming from an agent or from a developer
2. Route to the skill that matches the primary use
3. Add `phantom-cash` when the request also includes payments, payouts, incentives, treasury flows, or paid actions

Do not treat `phantom-cash` as the default starting point unless the user's request is primarily about
payments.

## Common Combinations

- Agent wallet + payments: `phantom-mcp-server` + `phantom-cash`
- User-facing app + payments: `phantom-connect` + `phantom-cash`
- Agent + frontend + payments: all three

## Default Starting Point

If the request is ambiguous but sounds agent-track, start with `phantom-mcp-server`. If it sounds
app-track, start with `phantom-connect`.

## References

- [Phantom developer docs](https://docs.phantom.com)
- [Phantom Connect marketing site](https://phantom.com/connect)
- [CASH marketing site](https://www.usecash.xyz)
- [Phantom MCP Server docs](https://docs.phantom.com/resources/phantom-mcp-server)
- [Wallet SDK overview](https://docs.phantom.com/wallet-sdks-overview)
- [CASH docs](https://docs.phantom.com/cash)
