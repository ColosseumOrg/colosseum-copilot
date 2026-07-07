# Colosseum Copilot

Colosseum Copilot is a research copilot for crypto builders. It runs inside Claude Code,
Codex, and OpenClaw, and gives your agent a grounded way to research Solana startup
ideas, compare them against builder projects and archives, and keep one evolving
hypothesis file current.

## Install

```bash
npx skills add ColosseumOrg/colosseum-copilot
```

You need a Personal Access Token (PAT) before first use. Setup and auth docs live at
[docs.colosseum.com/copilot](https://docs.colosseum.com/copilot).

## The Loop

```text
idea -> /vet -> /grill -> /precedents -> /wedge -> /blueprint -> /find-tools -> build
                                      \-> /validate + /radar as the ongoing loop
```

The suite has one router plus eight named workflows. The router handles short
conversational research and routes workflow-shaped requests. The workflows sharpen one
artifact: `HYPOTHESIS.md` in your repo root.

## Skills

| Skill | Use it for | Example prompt |
|---|---|---|
| `colosseum-copilot` | Route conversational Solana or crypto startup Q&A, "what should I do next?", and workflow requests. | `What should I do next?` |
| `colosseum-copilot-vet` | Vet a Solana or crypto startup idea and create or refresh `HYPOTHESIS.md`. | `/vet privacy-preserving payroll for global contractors on Solana` |
| `colosseum-copilot-grill` | Grill a hypothesis with evidence-backed adversarial questions. | `Grill my hypothesis and tell me what breaks first` |
| `colosseum-copilot-precedents` | Find prior art and precedent projects for an idea. | `Has this been tried before: decentralized chargebacks for stablecoin commerce?` |
| `colosseum-copilot-wedge` | Synthesize a differentiated wedge for a hypothesis. | `Find the wedge for this hypothesis` |
| `colosseum-copilot-blueprint` | Create a high-level build blueprint and design constraints. | `Blueprint the architecture for the wedge in HYPOTHESIS.md` |
| `colosseum-copilot-find-tools` | Recommend Solana tools, SDKs, APIs, wallets, RPC providers, and build resources. | `/find-tools for a private stablecoin payroll app` |
| `colosseum-copilot-validate` | Re-check `HYPOTHESIS.md` against fresh corpus queries and append validation diffs. | `Run the daily validation loop for the Wedge assumptions` |
| `colosseum-copilot-radar` | Watch a thesis, category, or space for new entrants and momentum shifts. | `/radar privacy stablecoin payments` |

If you ask for multiple workflows, the router runs them in this order:

```text
vet -> grill -> precedents -> wedge -> blueprint -> find-tools -> validate/radar
```

## Artifact Model

`HYPOTHESIS.md` is the human-facing state file. Workflows read it, update their section,
and end with `Next step: /<skill> - <one-sentence reason>`.

The sections are:

```markdown
# HYPOTHESIS

## Hypothesis

## Thesis Placement

## Competitive Field

## Evidence Log

## Risk Register

## Wedge

## Design Constraints

## Tooling

## Validation Log

## Open Questions
```

Longer run notes live under `.copilot/`:

```text
.copilot/
  runs/
  radar/
  validation/
```

Copilot's backend is read-only for workflow state. Your repo holds the working notes.

## What It Can Query

- Colosseum hackathon projects with tags, facets, clusters, prize data, accelerator data,
  and project details.
- Curated archive documents across protocol docs, research, founder essays, and historical
  crypto sources.
- Hackathon analysis and comparison endpoints.
- Public build-resource data for `/find-tools` when reachable.

Every non-obvious claim should cite project slugs, archive document IDs, cluster keys,
analysis cohorts, or public resource URLs from the data source used.

## Compatible Runtimes

- Claude Code
- Codex
- OpenClaw

## License

Proprietary. Copyright Colosseum.
