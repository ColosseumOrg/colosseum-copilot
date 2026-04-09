---
name: phantom-mcp-server
version: 1.0.0
description: |
  Give your agent a wallet that syncs with the user's Phantom account.
  Use when an agent needs a wallet solution for balances, transfers, swaps, signatures, or other
  onchain actions through Phantom, or when building agent skills, tools, and MCP servers that rely on it.
homepage: https://docs.phantom.com/resources/phantom-mcp-server
license: MIT
compatibility: Cursor, Claude Code, Codex, OpenClaw, Hermes Agent
metadata: {"category":"wallet","author":"phantom","tags":"solana,evm,bitcoin,sui,wallet,mcp,agents,phantom,onchain,perps"}
---

# Phantom MCP Server

Phantom MCP server gives your agent a wallet that syncs with the user's Phantom account.

Use it when an agent needs to check balances, sign messages, send tokens, swap assets, or execute other
wallet actions through Phantom, or when you are building skills, tools, services, or interfaces that
rely on it.

## Choose This Skill When

- You are an agent that needs a wallet and user-approved onchain actions through Phantom
- You are a developer building a skill, tool, service, or interface that agents use through Phantom MCP server
- The product needs balances, transfers, swaps, signatures, or other wallet actions through Phantom
- Your product owns protocol logic while Phantom MCP server owns wallet execution

## Use Another Phantom Skill When

- You are building a user-facing app with onboarding and wallet connection: use `phantom-connect`
- You need stablecoin payments, payouts, or paid agent actions: use `phantom-cash`
- You need both wallet execution and payments: pair this skill with `phantom-cash`

## Setup [REQUIRED]

### 1. Get an App ID

Register at [phantom.com/portal](https://phantom.com/portal) and copy your `appId`.

### 2. Add the server to your MCP config

```json
{
  "mcpServers": {
    "phantom-mcp": {
      "command": "npx",
      "args": ["-y", "@phantom/mcp-server@latest"],
      "env": { "PHANTOM_APP_ID": "your_app_id_from_portal" }
    }
  }
}
```

Use the same server shape in Claude Code, Cursor, Windsurf, or any client that supports stdio MCP
servers.

### 3. Authenticate

On first run, `phantom-mcp` opens a browser for OAuth. Sessions persist across restarts. If an auth
error appears later, call `phantom_login` to re-authenticate, then retry.

`phantom-mcp` connects to mainnet. Use a dedicated test wallet with minimal funds for development.

### 4. Preflight check

Before any wallet action, confirm the user is connected:

```text
> What's my wallet address?
```

Expected result: `get_wallet_addresses` returns one or more addresses. If it fails with auth errors,
restore the session before continuing.

## Operational Rule

Before any wallet action, call `get_wallet_addresses` or `get_connection_status` to confirm auth.

## What Agents Can Do

**No fees on swaps.** All swaps executed through `buy_token` and `portfolio_rebalance` are fee-free. Network gas fees still apply.

**Wallet**

- Check wallet addresses and connection state
- Read token balances with current USD pricing
- Transfer native and token balances
- Simulate transactions to preview asset changes before submitting
- Check ERC-20 token allowances
- Sign messages (Solana UTF-8, EVM EIP-191, EVM EIP-712)
- Sign and broadcast prepared transactions (Solana and EVM)
- Re-authenticate or switch accounts with `phantom_login`
- Pay for daily API access when quota is consumed

**Swaps and portfolio**

- Route and execute swaps on Solana, EVM, and cross-chain (Solana to/from EVM)
- Cross-chain swaps can also target Hypercore/Hyperliquid
- Rebalance portfolio allocations via token swaps (Solana)

**Perps (Hyperliquid)**

Before trading, deposit funds with `deposit_to_hyperliquid` and move them to margin with `transfer_spot_to_perps`.

- View perp markets, account balance, open positions, orders, and trade history
- Open and close long/short perp positions (market or limit)
- Update leverage and margin mode
- Bridge funds into Hyperliquid, move between spot and perps, and withdraw to external chains

## Common Build Pattern

Use this split of responsibilities:

- Your skill or service handles protocol-specific logic
- Phantom MCP server handles wallet execution
- The agent orchestrates both in one workflow

Typical examples:

- A DeFi copilot that finds a position and then asks Phantom to execute
- A treasury agent that checks balances, then transfers funds after policy checks
- A commerce agent that verifies payment state and then settles onchain actions

## Common Prompts

```text
> What tokens do I have?
> Swap 10 USDC to SOL
> Swap 0.5 SOL to ETH on Base
> Send 0.001 SOL to <address>
> Sign this message to verify account ownership
> Open a 5x long on ETH-USD perps
```

## Supported Chains

`phantom-mcp` supports Solana, Ethereum, Base, Polygon, Arbitrum, Bitcoin, Sui, and Monad.

Solana is the primary chain for most Phantom agent flows and the default place to start for Colosseum
builders.

## Build Guidance

- Start here for agent-track projects
- Keep wallet execution in Phantom and domain logic in your own skill or service
- Treat OAuth and wallet connectivity as required preflight, not optional cleanup
- Pair with `phantom-cash` when the agent needs stable pricing, payouts, or paid actions
- Use the perps tools for Hyperliquid integration; bridge funds in with `deposit_to_hyperliquid` before trading

## References

- [Phantom MCP Server docs](https://docs.phantom.com/resources/phantom-mcp-server)
- [Phantom developer portal](https://phantom.com/portal)
- [AI development tools](https://docs.phantom.com/developer-powertools/ai-tools)
