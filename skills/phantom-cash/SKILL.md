---
name: phantom-cash
version: 1.0.0
description: |
  Add stablecoin payments, payouts, and paid actions with CASH across apps and agents. Use when the
  product needs a stablecoin for checkout, incentives, settlement, treasury flows, or agent commerce.
homepage: https://www.usecash.xyz
license: MIT
compatibility: Cursor, Claude Code, Codex, OpenClaw, Hermes Agent
metadata: {"category":"payments","author":"phantom","tags":"solana,payments,stablecoin,cash,payouts,commerce,agents,dapps"}
---

# Phantom CASH

CASH is the stablecoin of the Phantom ecosystem for apps and agents.

Use it when your app or agent needs a stablecoin for payments, payouts, trading, treasury actions, or
paid usage flows.

## Choose This Skill When

- You need a stable unit for checkout, pricing, or settlement
- You want payouts, incentives, or rewards without volatile asset exposure
- You are adding paid API calls, premium actions, or gated workflows
- You need a stablecoin that can work with both apps and agents

## Use Another Phantom Skill With It

- Pair with `phantom-mcp-server` for agent payments, paid agent actions, and treasury automation
- Pair with `phantom-connect` for user-facing dApps with stablecoin checkout or payouts
- Use all three when you are building both an app and an agent layer

## What It Is Good For

- Stablecoin payments between users, apps, and agents
- Prize payouts and rewards
- Paid tools, premium actions, or usage-based billing
- Agent trading or treasury flows that should settle in a stablecoin

## Token Details

- Mint: `CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH`
- Standard: Solana SPL token
- Decimals: 6

## Integration Notes

- CASH is a Solana SPL token
- If you already support SPL token transfers, the same integration pattern applies
- CASH works well anywhere you need stable value movement inside a Solana flow
- For paid API or service actions, CASH can be paired with `x402`-style payment gating (HTTP 402 + onchain payment verification before granting access). See [x402.org](https://www.x402.org) for the protocol spec and SDKs
- Devnet CASH is available for testing — request it through [Phantom developer support](https://docs.google.com/forms/d/e/1FAIpQLSeHWETFkEJbHQCF-lnl1AHmVQPuyfC0HbnxjDjIp6VYV1sBZQ/viewform)

## Common Build Patterns

- Agent executor + CASH: charge for agent actions, settle rewards, or pay out earnings
- dApp + CASH: stablecoin checkout, rewards, subscriptions, or creator payouts
- Marketplace + CASH: escrow-like flows, seller settlement, and buyer pricing in a stable unit

## Common Prompts

```text
> Add stablecoin payouts for hackathon prizes
> Gate this API behind CASH payments
> Design a paid agent action that settles in CASH
```

## Build Guidance

- Start here whenever payments are a core product requirement
- Keep payment logic and pricing in your product layer
- Use `phantom-mcp-server` or `phantom-connect` for the wallet and signing surface around CASH
- Treat CASH like a stablecoin you can use across app-track and agent-track builds

## References

- [CASH docs](https://docs.phantom.com/cash)
- [Phantom developer docs](https://docs.phantom.com)
