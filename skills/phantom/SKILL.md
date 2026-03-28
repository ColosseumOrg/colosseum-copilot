---
name: phantom
version: 1.0.0
description: |
  Build wallet-connected apps, skills, and services for Phantom's MCP server users on Solana and EVM.
  Connects your AI coding agent to a live Phantom wallet for transaction signing, balance checks, and
  swaps (phantom-mcp), and to real-time Phantom Connect SDK documentation for accurate API reference
  while building (phantom-connect-sdk).
homepage: https://phantom.com/developers
license: MIT
compatibility: Claude Code, Codex, OpenClaw
metadata: {"category":"wallet","author":"phantom","tags":"solana,evm,wallet,mcp,web3,phantom,connect-sdk,embedded-wallet"}
---

## The Mental Model

Phantom's MCP server is a wallet product — the way a growing number of people experience crypto through
their AI agent, through Phantom. Your job as a developer is to build the programs, skills, and services
that MCP server users reach via their agents.

Think of Phantom's MCP server the way you think of a mobile wallet or browser extension: developers build
destinations, Phantom gets users there. The developer creates the capability. The MCP server is how users
reach it.

**This skill gives your agent two things:**
- **phantom-mcp** — a live Phantom wallet. Sign transactions, check balances, and execute swaps *as* the
  user during development and testing.
- **phantom-connect-sdk** — live Phantom SDK documentation. Real-time API reference for
  `@phantom/react-sdk`, `@phantom/react-native-sdk`, and `@phantom/browser-sdk`, fetched directly from
  Phantom's docs — not from training data.

---

## Setup [REQUIRED]

### 1. Get an App ID

Register at [phantom.com/portal](https://phantom.com/portal) → Create App → copy your `appId`.
Required for phantom-mcp; optional for phantom-connect-sdk.

### 2. Add to your MCP config

**Claude Code** (`.mcp.json` in your project root):

```json
{
  "mcpServers": {
    "phantom-mcp": {
      "command": "npx",
      "args": ["-y", "@phantom/mcp-server"],
      "env": { "PHANTOM_APP_ID": "YOUR_APP_ID" }
    },
    "phantom-connect-sdk": {
      "type": "sse",
      "url": "https://docs.phantom.com/mcp"
    }
  }
}
```

**Cursor / Windsurf** (`mcp.json`): same structure, same keys.

### 3. Authenticate

On first run, `phantom-mcp` opens a browser for OAuth (Google or Apple sign-in). Sessions persist across
restarts. If an auth error occurs mid-session, re-run the login flow and retry.

> ⚠️ `phantom-mcp` connects to **mainnet**. Use a dedicated test wallet with minimal funds.

### 4. Preflight check

Confirm your wallet is connected before any wallet operation:

```
> What's my wallet address?
```

Expected: one or more wallet addresses returned by `get_wallet_addresses`. If you get an auth error,
the session needs to be re-established — complete the browser OAuth flow and retry.

---

## The Two MCP Servers

| Server | Package / URL | Purpose |
|--------|---------------|---------|
| `phantom-mcp` | `@phantom/mcp-server` (npm) | Live wallet — check balances, transfer tokens, swap, sign transactions and messages on Solana and EVM |
| `phantom-connect-sdk` | `https://docs.phantom.com/mcp` (SSE) | Live docs — real-time API reference for the Phantom Connect SDK while you build |

Use **phantom-mcp** when you need to act on-chain: test a payment flow end-to-end, verify a transaction
your code constructs, sign a message, or demo a skill live.

Use **phantom-connect-sdk** when you're writing code that uses the embedded wallet SDKs. It surfaces
current method signatures, parameters, and examples so the agent references the live API, not stale
training data.

---

## What to Build

Developers build destinations for MCP server users. Four categories, ordered by how well they compose
with the MCP server:

| What | Description | When to use |
|------|-------------|-------------|
| **Onchain skills** | MCP server tools that interface with smart contracts (DeFi, NFTs, staking). Structured and scoped — most token-efficient option for agent consumption. | Default choice for protocol integrations |
| **Protocol MCP servers** | A standalone MCP server for your protocol that composes with phantom-mcp. The agent orchestrates both. | Protocols with complex state or multi-step workflows |
| **API services** | REST endpoints agents call for data or actions. Keep payloads concise and well-typed. | Analytics, alerts, off-chain data, notifications |
| **Payment-enabled endpoints** | Services that accept $CASH from agents via x402 or MPP. | Gated access to premium data or compute |

An **onchain skill** is a tool in an MCP server you build and publish. Users add it to their agent config
alongside `phantom-mcp`. When their agent calls your skill, the skill composes with the Phantom wallet —
your program's capability, Phantom's wallet as the execution layer.

---

## Key Patterns

### Check a user's balance
```
> What tokens do I have?
```
`phantom-mcp` fetches all token balances with current USD prices via `get_token_balances`.

### Execute a swap
```
> Swap 10 USDC to SOL
```
`phantom-mcp` routes the swap via Phantom's internal routing and executes it via `buy_token`.

### Sign a transaction your code builds
Have the agent verify your transaction-building code, then test end-to-end:
```
> Send 0.001 SOL to <address>
```
`phantom-mcp` calls `transfer_tokens`, signs, and broadcasts. Verify on-chain.

### Reference live SDK docs while coding
When writing embedded wallet code, ask the agent directly:
```
> How do I initialize the React SDK and connect a wallet?
> What does createPhantom() accept?
> Show me the signAndSendTransaction signature
```
`phantom-connect-sdk` fetches the answer from Phantom's live docs — not from training data.

---

## Supported Chains

`phantom-mcp` supports **Solana**, **Ethereum**, **Base**, **Polygon**, **Arbitrum**, and **Bitcoin**.
Solana is the primary chain for MCP server user interactions and where most skills run. EVM chains are
supported for message signing and transaction broadcasting.

---

## Key Rules (Don't Skip)

- ✅ Always use `signAndSendTransaction` — `signTransaction` alone is **not supported** for embedded wallets
- ✅ Always use `LAMPORTS_PER_SOL` — never hardcode `1000000000`
- ✅ React Native: `import 'react-native-get-random-values'` must be the **very first** import
- ✅ Browser SDK: call `createPhantom()` once as a singleton — never create multiple instances
- ✅ SDK targets mainnet: `https://api.mainnet-beta.solana.com`
- ✅ Call `get_wallet_addresses` or `get_connection_status` before any wallet operation to confirm auth

---

## Error Handling

| Scenario | Cause | Resolution |
|----------|-------|------------|
| Auth error on first run | OAuth not completed | Complete browser sign-in and retry |
| Auth error mid-session | Session expired | Re-authenticate via `phantom_login` |
| Transaction fails — insufficient funds | Wallet balance too low | Top up the test wallet |
| Transaction fails — simulation error | Instruction error in your code | Check instruction accounts and data |
| `phantom-connect-sdk` returns no results | Remote endpoint unreachable | Fall back to `docs.phantom.com` directly |

---

## References

- [Phantom MCP Server docs](https://docs.phantom.com/resources/phantom-mcp-server)
- [Connect SDK docs MCP](https://docs.phantom.com/resources/mcp-server)
- [SDK comparison guide](https://docs.phantom.com/wallet-sdks-overview)
- [React SDK](https://docs.phantom.com/sdks/react-sdk) · [React Native SDK](https://docs.phantom.com/sdks/react-native-sdk) · [Browser SDK](https://docs.phantom.com/sdks/browser-sdk)
- [Portal — App ID registration](https://phantom.com/portal)
- [AI development tools](https://docs.phantom.com/developer-powertools/ai-tools)
- [phantom-mcp tool reference](./references/phantom-mcp-tools.md)
