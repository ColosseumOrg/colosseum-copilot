# phantom-mcp Tool Reference

Available tools in `@phantom/mcp-server`. Always call `get_wallet_addresses` or
`get_connection_status` first in any session to confirm the wallet is connected.

---

## Connection & Identity

### `get_connection_status`
Lightweight preflight check. Confirms the MCP server is connected and authenticated without
fetching additional data. Use this before any wallet operation if you haven't confirmed auth yet.

### `get_wallet_addresses`
Returns all wallet addresses for the authenticated Phantom account across supported chains
(Solana and EVM). Use this to confirm auth and retrieve the addresses your code should target.

---

## Portfolio

### `get_token_balances`
Returns all token balances for the connected wallet, including current USD prices via Phantom's
portfolio API. Covers both Solana SPL tokens and EVM tokens depending on the connected account.

---

## Transfers

### `transfer_tokens`
Send SOL or SPL tokens on Solana.

| Parameter | Description |
|-----------|-------------|
| `recipient` | Recipient wallet address (base58) |
| `amount` | Amount to send |
| `token` | Token mint address, or `SOL` for native SOL |

Requires a small SOL balance (~0.000005 SOL) in the sending wallet for network fees.

---

## Swaps

### `buy_token`
Swap tokens on Solana via Phantom's internal routing.

| Parameter | Description |
|-----------|-------------|
| `inputToken` | Token to sell — mint address or `SOL` for native SOL |
| `outputToken` | Token to buy — mint address |
| `amount` | Amount of input token to swap |

---

## Transactions

### `send_solana_transaction`
Sign and broadcast a pre-built Solana transaction. Use when your code constructs the transaction
object and you want `phantom-mcp` to sign and send it on your behalf. Ideal for testing the full
lifecycle of transactions your app will submit.

### `send_evm_transaction`
Sign and broadcast a pre-built EVM transaction on Ethereum, Base, Polygon, or Arbitrum.

---

## Message Signing

### `sign_solana_message`
Sign a UTF-8 message on Solana. Returns the base58-encoded signature. Use to test
sign-in with Solana (SIWS) flows or any signature-verification pattern in your app.

### `sign_evm_personal_message`
Sign a personal message on EVM chains per EIP-191. Returns the hex-encoded signature.

### `sign_evm_typed_data`
Sign typed structured data on EVM chains per EIP-712. Use for testing permit flows,
meta-transactions, or any typed-data signing in your contracts.

---

## Auth

### `phantom_login`
Trigger the Phantom Connect OAuth flow. Opens a browser for Google or Apple sign-in.
Called automatically on first use. Call explicitly if the session has expired.

---

## Notes

- All Solana transactions require a small SOL balance (~0.000005 SOL) for network fees.
- `phantom-mcp` connects to **mainnet** — use a dedicated test wallet with minimal funds.
- Sessions persist across restarts; you do not need to log in on every session.
- If an auth error occurs, re-run `phantom_login` and retry the original operation.
