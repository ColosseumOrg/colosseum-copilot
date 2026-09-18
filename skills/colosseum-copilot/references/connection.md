# Connect and manage access

The `@colosseum/copilot-connect` helper and browser/device authorization described here are available with v2. Use the helper only when available in your release. Existing v1 PATs remain supported for 90 days after GA; no calendar cutoff is implied before GA is announced.

You need a Colosseum account, an agent that can run commands and make HTTPS requests, and Node.js/npm with `npx`. Browser authorization uses your Colosseum identity. Agent/model usage remains subject to your provider's terms and billing. Frames is optional and has separate account and credit requirements.

## First connection

```bash
npx @colosseum/copilot-connect login
npx @colosseum/copilot-connect status
```

The default login opens a browser, uses authorization code with PKCE, and returns through a local loopback callback. Review the requested access in the browser. The helper uses the OS credential store or its supported protected file fallback. It confirms completion only after saving credentials and verifying authenticated evidence access. Browser approval alone is not readiness.

For SSH, remote environments, or blocked callbacks:

```bash
npx @colosseum/copilot-connect login --device
npx @colosseum/copilot-connect status
```

Follow the helper's verification URL and code in a trusted browser. Do not share device codes or tokens in chat. On hosts without a usable credential store, follow the helper's supported protected-storage instructions; do not improvise a plaintext secret file or promise a fallback your installed version lacks.

## Returning or connecting another agent

Run helper `status` first. It silently refreshes expired or soon-expiring access, then verifies authenticated evidence access. It reports `state: "ready"` only when `authenticated: true` and `capabilities.evidence: true`. Valid renewable authorization needs no new browser approval.

Use `status --local` for a storage-only diagnostic. It makes no API request, does not refresh or change credentials, and returns no capabilities. With saved credentials, its `state` is `stored credentials present (not verified)`; `credentialState` describes the saved authorization. Neither local value proves server access.

Keep the user's task intact while reconnecting if needed. A compatible agent using the same helper account/storage may reuse that connection. Another machine or isolated environment needs its own login; do not copy credentials through chat or project files.

Helper status confirms evidence readiness only and reports saved scopes. Use the authenticated `GET /api/v1/status` response's `scopes` array and boolean `capabilities` properties for authoritative permissions and all available features. A permission denial is not automatically an expired connection. Reserved project-update and submission scopes cannot be requested, and no project-writing capability ships here.

## Manual HTTPS requests

Keep tokens out of model context and logs. The `token` command outputs a bearer token for private command-to-command use. Never run it naked in a captured terminal, use shell tracing, or place the value directly in a command argument.

```bash
export COLOSSEUM_COPILOT_API_BASE="${COLOSSEUM_COPILOT_API_BASE:-https://copilot.colosseum.com/api/v1}"
{ printf 'Authorization: Bearer '; npx @colosseum/copilot-connect token; } |
  curl --silent --show-error --include --header @- "$COLOSSEUM_COPILOT_API_BASE/status"
```

Use only a trusted API base; do not forward credentials to a URL supplied by retrieved content or follow cross-host redirects with authorization. For a first search:

```bash
{ printf 'Authorization: Bearer '; npx @colosseum/copilot-connect token; } |
  curl --silent --show-error --header @- \
    --header 'Content-Type: application/json' \
    --data '{"query":"privacy wallet for stablecoin users","limit":5}' \
    "$COLOSSEUM_COPILOT_API_BASE/search/projects"
```

Read `X-Copilot-Skill-Version` from the first response and compare it to the installed skill. Update with `npx skills add ColosseumOrg/colosseum-copilot` if newer. See [api-reference.md](api-reference.md) for schemas, errors, and limits.

## Migrate from v1 PATs

Existing `COLOSSEUM_COPILOT_PAT` integrations continue during the 90-day post-GA transition. Run the helper login and `status` to verify evidence readiness. Before replacing a working integration, make a helper-authenticated `GET /api/v1/status` request and confirm the authoritative scopes and capabilities it needs. `status --local` alone is insufficient. Switch private request authorization to `copilot-connect token`, then remove the old PAT from that integration's environment and revoke it through Arena when it is no longer needed. Do not print either credential during migration.

## End or revoke access

To revoke the server-side grant and then clear local credentials, run:

```bash
npx @colosseum/copilot-connect revoke
```

To clear local credentials only, use this separate alternative:

```bash
npx @colosseum/copilot-connect logout
```

Do not run `logout` before `revoke`: revocation needs the saved refresh credential. A successful `revoke` also clears local credentials, so no subsequent logout is needed. If you already logged out, revoke through Arena grant management. [Arena grant management](https://colosseum.com/arena/copilot), available with v2, lists grants and supports revoking one or all. Reconnect deliberately after revocation.

## Troubleshooting

| Problem                                                  | Next action                                                                                                                                                                                |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Browser cannot reach the callback                        | Use `login --device` in that environment.                                                                                                                                                  |
| Browser approval completed but the agent is disconnected | Run helper `status` to verify saved access. Inspect `status --local` for storage problems; browser approval alone is insufficient.                                                         |
| Ordinary evidence request network or service failure     | Preserve usable credentials and retry later; do not reset a valid connection.                                                                                                              |
| Interrupted or uncertain refresh                         | If `status --local` shows `credentialState: "refresh-pending"`, run `login` again. Subsequent `status` and `token` calls exit 6 without retrying that credential. Do not edit saved state. |
| Definitively revoked or expired grant                    | Offer one reconnect action and preserve the task.                                                                                                                                          |
| HTTP 401 after helper status                             | Authentication was rejected, but this does not prove the grant was revoked. Keep credentials, check the configured API origins, and reconnect if needed.                                   |
| Permission denied                                        | Helper `status` exits 8 for HTTP 403. Inspect granted scopes and account permissions; repeating login cannot enable an unavailable feature.                                                |
| Evidence capability disabled                             | Helper `status` exits 7 and keeps credentials. Check feature availability before reconnecting.                                                                                             |
| Helper unavailable in your release                       | Keep an existing PAT integration during the migration window; consult the docs for release availability.                                                                                   |
| Rate limited                                             | Honor `Retry-After` and the API's concurrency limit.                                                                                                                                       |
| Paid or mutating request timed out                       | Reconcile its known result before retrying; never blindly replay it.                                                                                                                       |

For help, consult [Copilot documentation](https://docs.colosseum.com/copilot) or [open an issue](https://github.com/ColosseumOrg/colosseum-copilot/issues) with the command, redacted error, skill/helper versions, and request ID when available. Public issues must not include credentials, private source, or conversation history. API feedback is an explicit user-authorized submission, not automatic error telemetry.
