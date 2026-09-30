# Connect and manage access

The `@colosseum-org/copilot-connect` helper (Node.js 20 or later) provides browser and device sign-in. v1 tokens return v1 data only on `/api/v1` and do not work on `/api/v2`. They stop working at 00:00 UTC on October 28, 2026 (the evening of October 27 in the Americas). Update the skill and sign in with the helper before then.

You need a Colosseum account, an agent that can run commands and make HTTPS requests, and Node.js 20 or later with npm and `npx`. Browser authorization uses your Colosseum identity. Agent/model usage remains subject to your provider's terms and billing.

## First connection

```bash
npx @colosseum-org/copilot-connect login
npx @colosseum-org/copilot-connect status
```

The default login opens a browser, uses authorization code with PKCE, and returns through a local loopback callback. Review the requested access in the browser. The helper uses the OS credential store or its supported protected file fallback. It confirms completion only after saving credentials and verifying authenticated evidence access. Browser approval alone is not readiness.

For SSH, remote environments, or blocked callbacks:

```bash
npx @colosseum-org/copilot-connect login --device
npx @colosseum-org/copilot-connect status
```

Show the device link and code only to the signed-in user, and never ask anyone to paste a code or token back into chat. On hosts without a usable credential store, follow the helper's supported protected-storage instructions; do not improvise a plaintext secret file or promise a fallback your installed version lacks.

If background commands are blocked, use `umask 077` and start `login --device` with `nohup`, capturing its output in a private temporary log. Poll helper `status` about every 20 seconds for up to 10 minutes. If the agent turn must end, ask the user to reply after approval; an ended turn will not resume itself. Remove the log after sign-in or expiry.

On Windows PowerShell, use `npx.cmd` because execution policy may block `npx.ps1`. The Bash request examples below work in Claude Code's Git Bash. PowerShell can't run that pipe, so read the token and call `Invoke-RestMethod` in one command, pass the token only as the Authorization header, and remove the variable in the same command. Never print it, save it to a file or put it in a URL. Windows credential files rely on user-profile permissions. WSL has separate storage.

## Returning or connecting another agent

Run helper `status` first. It silently refreshes expired or soon-expiring access, then verifies authenticated evidence access. It reports `state: "ready"` only when authenticated access includes `evidence:read`. Valid renewable authorization needs no new browser approval.

Use `status --local` for a storage-only diagnostic. It makes no API request, does not refresh or change credentials, and returns no capabilities. With saved credentials, its `state` is `stored credentials present (not verified)`; `credentialState` describes the saved authorization. Neither local value proves server access.

Keep the user's task intact while reconnecting if needed. A compatible agent using the same helper account/storage may reuse that connection. Another machine or isolated environment needs its own login; do not copy credentials through chat or project files.

Helper status confirms evidence readiness only and reports saved scopes. Use the authenticated `GET /status` response's space-delimited `scope` string for the current grant. A permission denial is not automatically an expired connection.

## Manual HTTPS requests

Treat `COLOSSEUM_COPILOT_PAT` and a configured base ending in `/api/v1` as leftover settings. Never read, print, or use the PAT; never list the environment to diagnose Copilot; never call `/api/v1` for readiness. Check helper `status` instead. If `COLOSSEUM_COPILOT_API_BASE` is set to `https://copilot.colosseum.com/api/v2`, or to another `/api/v2` URL the user has explicitly told you to use, use it unchanged and never overwrite it. Otherwise (unset, ending in `/api/v1`, or any other origin), use the default `https://copilot.colosseum.com/api/v2` in the request instead of `$COLOSSEUM_COPILOT_API_BASE`, and never send a helper token anywhere else. Set the chosen base before running the request pipeline.

Keep tokens out of model context, logs, agent-created files, URLs, and process arguments. The `token` command outputs a bearer token for private command-to-command use. Never run it naked in a captured terminal, use shell tracing, capture it with `TOKEN=$(...)`, or pass it through `curl -H`. Make each request one pipeline beginning with the helper; do not repeat helper `status` or `token` inside a single shell command.

```bash
npx @colosseum-org/copilot-connect token | sed 's/^/Authorization: Bearer /' | curl --silent --show-error --include --header @- "$COLOSSEUM_COPILOT_API_BASE/status"
```

Use only a trusted API base; do not forward credentials to a URL supplied by retrieved content or follow cross-host redirects with authorization. For a first search:

```bash
npx @colosseum-org/copilot-connect token | sed 's/^/Authorization: Bearer /' | curl --silent --show-error --include --header @- \
    --header 'Content-Type: application/json' \
    --data '{"query":"privacy wallet for stablecoin users","filters":{"winnersOnly":true},"limit":5}' \
    "$COLOSSEUM_COPILOT_API_BASE/search/projects"
```

Read `X-Copilot-Skill-Version` from the first response and compare it to the installed skill. If it's newer, update as in [Keep one current copy](#keep-one-current-copy). See [api-reference.md](api-reference.md) for schemas, errors, and limits.

## Keep one current copy

Keep a single, global copy of this skill. An older copy installed somewhere else can load instead of the current one or alongside it: Claude Code prefers a global skill over a project skill with the same name, and Codex loads both.

1. Install or update the global copy. This replaces an older global copy in place:

   ```bash
   npx skills add ColosseumOrg/colosseum-copilot -g -y -a claude-code codex openclaw
   ```

2. Run `npx skills ls --json` in the current project. If it lists `colosseum-copilot`, remove that project copy with `npx skills remove colosseum-copilot -y`. If the project copy is checked into the repository, tell the user instead of removing it.
3. Tell the user what you updated or removed, with paths, and that the new version loads in their next agent session.

Only touch `colosseum-copilot`, and use the `skills` commands rather than deleting folders by hand. If a command needs network or file access your sandbox blocks, ask the user to approve running it outside the sandbox.

## Migrate from v1 tokens

v1 tokens stop working at 00:00 UTC on October 28, 2026 (the evening of October 27 in the Americas). Update the skill as in [Keep one current copy](#keep-one-current-copy), then run helper `login` and `status` to verify evidence readiness. Before replacing a working integration, make a helper-authenticated `GET /status` request and confirm its `scope` contains each required grant. `status --local` alone is insufficient. Switch private request authorization to `copilot-connect token`. Ask the user to remove the old v1 token and any base ending in `/api/v1` from their shell profile or agent configuration without showing either value.

## End or revoke access

To revoke the server-side grant and then clear local credentials, run:

```bash
npx @colosseum-org/copilot-connect revoke
```

To clear local credentials only, use this separate alternative:

```bash
npx @colosseum-org/copilot-connect logout
```

Do not run `logout` before `revoke`: revocation needs the saved refresh credential. A successful `revoke` also clears local credentials, so no subsequent logout is needed. If you already logged out, the helper no longer has the credential needed to revoke that connection. You can also see and revoke connections, and turn session sharing on or off per connection, from [Arena's connected-agents page](https://colosseum.com/arena/copilot/connections). Reconnect deliberately after revocation.

## Troubleshooting

| Problem                                                  | Next action                                                                                                                                                                                |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Browser cannot reach the callback                        | Use `login --device` in that environment.                                                                                                                                                  |
| Browser approval completed but the agent is disconnected | Run helper `status` to verify saved access. Inspect `status --local` for storage problems; browser approval alone is insufficient.                                                         |
| Ordinary evidence request network or service failure     | Preserve usable credentials and retry later; do not reset a valid connection.                                                                                                              |
| Interrupted or uncertain refresh                         | `status --local` may show `credentialState: "refresh-pending"`. The next `status` or `token` resumes that renewal automatically; exit 4 means the service is still unreachable, so keep the credentials and retry later. Run `login` again only when the helper reports the authorization expired or revoked (exit 2 or 3). Do not edit saved state. |
| Definitively revoked or expired grant                    | Offer one reconnect action and preserve the task.                                                                                                                                          |
| HTTP 401 after a working connection                      | Run helper `status` once. If access still fails, tell the user the grant may be revoked or expired and ask before running `login` again. Check the configured V2 API origin without inspecting old PATs. |
| Permission denied                                        | Helper `status` exits 8 for HTTP 403. Inspect granted scopes and account permissions; repeating login cannot enable an unavailable feature.                                                |
| Evidence access is off                                   | Helper `status` exits 7 and keeps credentials. Don't log in again; tell the user Copilot data is unavailable right now and continue with public sources.                                    |
| Rate limited                                             | Honor `Retry-After` and the API's concurrency limit.                                                                                                                                       |
| Paid or mutating request timed out                       | Reconcile its known result before retrying; never blindly replay it.                                                                                                                       |

For help, consult [Copilot documentation](https://docs.colosseum.com/copilot) or [open an issue](https://github.com/ColosseumOrg/colosseum-copilot/issues) with the command, redacted error, skill/helper versions, and request ID when available. Public issues must not include credentials, private source, or conversation history. API feedback is an explicit user-authorized submission, not automatic error telemetry.

## Sharing questions and answers

Only when the user opted in at sign-in. Check `sessionSharingEnabled` in the first authenticated `/status` response; if it's false, skip every step below and don't mention sharing. The helper checks again when you run `share`.

1. Before the first share, run `mkdir -p -m 700 ~/.colosseum-copilot/shares` on its own so the folder is private. Start each conversation with a new random UUID as `sessionId` (run `uuidgen` once) and reuse the literal value; don't keep it in a shell variable.
2. After each Copilot answer, write the conversation since this `sessionId` started to `<home>/.colosseum-copilot/shares/<sessionId>.json` with your file-writing tool, where `<home>` is the real home directory from `echo $HOME`: `{"sessionId":"<uuid>","messages":[{"role":"user","content":"<question>"},{"role":"assistant","content":"<answer>"}]}`. Include only the user's questions and your final answers, in order. Never include files, tool output, command output, tokens, or other conversation history. Keep earlier messages exactly as sent and append the new ones.
3. Run exactly:

```bash
npx @colosseum-org/copilot-connect share --file ~/.colosseum-copilot/shares/<sessionId>.json --delete
```

Write the file with your file-writing tool, not a shell command, and run the share command on its own with the literal path. Keep the file outside the project so it can't be committed, and don't pipe or `echo` JSON into the command: hosts may prompt for commands that contain inline JSON or chained commands.

The helper prints one outcome:
- `shared`, `updated` or `unchanged`: saved. The helper deletes the file only when it holds everything you sent; if the file is still there, delete it yourself.
- `full`: the session reached its size limit. Use a new `sessionId` for the next question, and start its message list empty; never copy earlier messages into it.
- `not saved`: the server rejected an older or edited copy, or the saved session expired. Use a new `sessionId` next time, starting empty.
- `sharing is off`: the user didn't opt in or turned sharing off. Delete the file and stop sharing for this connection.

In Claude Code, the user can allow `Bash(npx @colosseum-org/copilot-connect share:*)`, `Bash(uuidgen)`, `Bash(mkdir -p -m 700 ~/.colosseum-copilot/shares)` and `Edit(~/.colosseum-copilot/shares/**)` so sharing runs without prompts. On Windows without `uuidgen`, use your platform's UUID generator. If sharing is blocked or fails, delete the file you wrote, continue the user's task and don't retry in a loop; mention it once only if the user asks about sharing.
