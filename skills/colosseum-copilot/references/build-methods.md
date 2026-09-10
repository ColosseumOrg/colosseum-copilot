# Build methods

Inspect the repository and its instructions before selecting tools. Identify the current chain, framework, dependencies, working changes, and relevant verification commands. Preserve the user's chosen stack unless a change is necessary and authorized. Use the agent's own coding environment; Copilot is not a hosted workspace.

## Choose an example you can verify

Prefer a maintained upstream example close to the requested change. Consult [tooling-reference.md](tooling-reference.md) for specialist Solana options. Historical hackathon code can explain what a team tried without being suitable for new implementation.

Pin the source commit or release and the complete compatible dependency set. Record lockfiles, Rust/Node/compiler versions, build environment, attribution, reuse terms, and date last verified. Independently versioned plugins and renderers need independent pins. Do not substitute "latest" for compatibility evidence.

An example is tested only after its checks have actually executed against that revision and environment. Keep the commands, exit status, relevant output, and limitations beside the example. If setup fails, label it failed or not run and investigate; do not present an upstream README as your own successful verification.

Public implementation evidence worth inspecting, last source-reviewed 2026-08-17:

| Example                      | Pinned source                                                                                                                                                      | What the source demonstrates                                                    | Verification limit                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Marginfi test workflow       | [4bd57850e689447fdd7bd300c6e2a8553cd9c25f](https://github.com/mrgnlabs/marginfi-v2/blob/4bd57850e689447fdd7bd300c6e2a8553cd9c25f/.github/workflows/test.yaml)      | Shared SBF artifact, unit/integration layers, fuzz jobs, and regression seeds   | Workflow inspected; not executed by this reference. Production code is not a beginner template.            |
| Jito Stakenet build workflow | [f452587f61235711cf434820a4d50a6d1f4ef058](https://github.com/jito-foundation/stakenet/blob/f452587f61235711cf434820a4d50a6d1f4ef058/.github/workflows/build.yaml) | Dependency audit, verified build, IDL checks, and tests against built artifacts | Workflow inspected; not executed by this reference. Check compatibility and reuse terms before adaptation. |

These are dated source examples, not a claim that Copilot has reproduced their complete suites. For the user's task, execute and retain the relevant checks before recommending the adapted example as tested.

## Executed example: native counter decoder

This example uses evidence captured 2026-09-04 and a local documentation verification run on 2026-09-08. It repairs a decoder for a native Solana counter; it does not add an Anchor discriminator or dependencies.

Pinned primary evidence:

- [Counter state](https://github.com/solana-foundation/program-examples/blob/a407926b641db9dd2d6974a6eb37dd0993e263b2/basics/counter/native/program/src/state.rs) and [client layout](https://github.com/solana-foundation/program-examples/blob/a407926b641db9dd2d6974a6eb37dd0993e263b2/basics/counter/native/ts/accounts/counter.ts), revision `a407926b641db9dd2d6974a6eb37dd0993e263b2`.
- [Borsh integer specification](https://github.com/near/borsh/blob/694a5b447ed1a20169e5cb524c1f9117c15a220d/README.md), revision `694a5b447ed1a20169e5cb524c1f9117c15a220d`.

The native layout is exactly eight bytes, an unsigned little-endian integer. An independent implementation preserves values above JavaScript's safe integer range and respects subarray offsets:

```js
export function decodeCounter(data) {
  if (!(data instanceof Uint8Array)) throw new TypeError('Expected Uint8Array');
  if (data.byteLength !== 8) throw new RangeError('Expected eight bytes');
  return new DataView(data.buffer, data.byteOffset, data.byteLength).getBigUint64(0, true);
}
```

The source repository's root says MIT while the native package declares Apache-2.0. This implementation is independent; confirm applicable reuse terms before copying upstream code.

Executed with Node.js 22.23.2 on 2026-09-08, using `node --test decoder.test.mjs` and the same eight-case test file before and after the fix:

| Check                   | Actual result                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| Original 32-bit decoder | 1 passed, 7 failed                                                                                 |
| Repaired decoder        | 8 passed, 0 failed, 0 skipped                                                                      |
| Cases                   | Zero, one, 256, value above 2^53, maximum u64, subarray offset, invalid lengths, wrong input types |

The full reproducible task is in the [build tutorial](https://docs.colosseum.com/copilot/tutorials/repair-counter). These checks establish local byte-decoding behavior for the tested layout. They do not verify account ownership, a live program, transaction signing, on-chain behavior, security, or comparative agent performance. The date records a documentation example check, not a new run of a model benchmark.

## Implement and verify the change

Make the smallest useful change that satisfies the task. Execute the repository's required checks and meaningful behavior tests. Report exactly what ran and whether it passed, failed, or was not run. Include any environmental limitation. Verify the current working changes, not a clean revision that omits them.

For Solana work, select checks for the behavior and risk:

- Client changes: types, transaction construction, address/program/cluster handling, and relevant integration behavior.
- Programs: arithmetic, account relationships, signer/owner/PDA validation, unauthorized transitions, and expected account deltas.
- Transaction behavior: LiteSVM; instruction and compute assertions: Mollusk; RPC/CPI dependencies: Surfpool with pinned account snapshots.
- Stateful or financial logic: explicit invariants, negative tests, fuzzing with reproducible seeds, and checks that the harness detects faults.
- Release preparation: lockfiles, artifact and IDL hashes, source revision, verified builds, and review of upgrade authorities.

A successful client test does not prove on-chain correctness. A verified build proves source/artifact correspondence, not safety. Independent security review and an audit cover only their stated scope and revision.

## Permissions and private work

Explain any new service that receives source, queries, transactions, or account data. Respect existing authorization for local work; require appropriate authorization for deployments, signing, spending, authority changes, new integrations, and publication. Never request or transmit seed phrases or private keys.

Keep private findings and working notes in existing private conventions or gitignored `.context/copilot`. Preview any tracked documentation. Finish with the change, executed verification, and material remaining limits; do not award a generic "secure" or "production-ready" badge.
