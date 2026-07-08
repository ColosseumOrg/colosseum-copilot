# Colosseum Copilot

Colosseum Copilot is a research copilot for crypto builders and researchers. It runs
inside Claude Code, Codex, and OpenClaw, and gives your agent a grounded way to research
Solana startup ideas, compare them against builder projects and archives, build dossiers
on projects or markets, and keep the work current in your repo.

## Install

```bash
npx skills add ColosseumOrg/colosseum-copilot
```

You need a Personal Access Token (PAT) before first use. Setup and auth docs live at
[docs.colosseum.com/copilot](https://docs.colosseum.com/copilot).

## The Paths

```text
idea -> /vet -> /grill -> /precedents -> /wedge -> /blueprint -> /find-tools -> build
                                      \-> /validate + /radar as the ongoing loop
```

The suite has one router plus eight named workflows. The router handles short
conversational research and routes workflow-shaped requests.

Founder work sharpens `HYPOTHESIS.md` in your repo root. Researcher work builds
`dossiers/<subject>.md` for an existing project, market, category, or deal. The two
artifact families never overwrite each other, and Copilot follows your intent without
requiring you to name a mode.

## Skills

| Skill | Use it for | Example prompt |
|---|---|---|
| `colosseum-copilot` | Route conversational Solana or crypto startup Q&A, researcher questions, "what should I do next?", and workflow requests. | `Map stablecoin payments on Solana` |
| `colosseum-copilot-vet` | Vet a startup idea into `HYPOTHESIS.md`, or build/deepen a researcher dossier for a subject. | `/vet privacy-preserving payroll for global contractors on Solana` |
| `colosseum-copilot-grill` | Grill a hypothesis with evidence-backed adversarial questions. | `Grill my hypothesis and tell me what breaks first` |
| `colosseum-copilot-precedents` | Find prior art and precedent projects for an idea. | `Has this been tried before: decentralized chargebacks for stablecoin commerce?` |
| `colosseum-copilot-wedge` | Synthesize a differentiated wedge for a hypothesis. | `Find the wedge for this hypothesis` |
| `colosseum-copilot-blueprint` | Create a high-level build blueprint and design constraints. | `Blueprint the architecture for the wedge in HYPOTHESIS.md` |
| `colosseum-copilot-find-tools` | Recommend Solana tools, SDKs, APIs, wallets, RPC providers, and build resources. | `/find-tools for a private stablecoin payroll app` |
| `colosseum-copilot-validate` | Re-check `HYPOTHESIS.md` against fresh corpus queries, or append monitoring updates to a dossier. | `Refresh the dossier for stablecoin payments` |
| `colosseum-copilot-radar` | Watch a thesis, category, or space for new entrants and momentum shifts. | `/radar privacy stablecoin payments` |

If you ask for multiple workflows, the router runs them in this order:

```text
vet -> grill -> precedents -> wedge -> blueprint -> find-tools -> validate/radar
```

## Artifact Model

`HYPOTHESIS.md` is the founder state file. Founder workflows read it and update the
section they are responsible for.

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
Researcher dossiers live at `dossiers/<subject>.md` with their own subject summary,
thesis, competitive position, status signals, risks, evidence log, and append-only watch
log.

## What It Can Query

- 8,286 Colosseum hackathon projects with tags, facets, clusters, prize data,
  accelerator data, project details, and media-informed search where source material is
  available.
- 86,000+ curated archive documents across 95+ sources: protocol docs, research, founder
  craft, security writing, policy analysis, and historical crypto sources.
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
