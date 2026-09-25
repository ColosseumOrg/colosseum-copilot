# Research methods

Match the investigation to the question. Use project records for submission history, archives for preserved claims and concepts, The Grid alongside web search for competitors and the broader product landscape, and current primary sources for present-day facts. No source type or call count is mandatory for every answer.

## Reconstruct a history

Resolve identity before combining records. Look for official domain links, repository transfers, team announcements, product IDs, and explicit rename statements. Shared names, logos, or similar descriptions are insufficient alone. A rename and a pivot are different claims and need different evidence.

For each consequential claim, retain its source URL or locator, the claim, relevant date, and uncertainty. Separate:

- Event time: when a launch, change, shutdown, or other event happened.
- Publication/update time: when the source made the claim.
- Capture time: when the page or artifact was collected.
- Preserved revision: the commit or snapshot actually inspected.

For an as-of question, exclude later events from the historical conclusion. Later retrospective sources may describe earlier events, but label them as retrospective and do not imply they were available then. If only a mutable current page exists, disclose the gap.

Distinguish the team's claim, an observed outcome, and your explanation. A repository demonstrates available code, not customers. A prize or funding announcement establishes an award or financing, not product success. Check the live product or official site before calling a project failed or gone; a deleted repository alone does not establish that. Lack of recent public evidence leaves the outcome unknown.

## Check winning projects first

For project discovery, recommendations, and finding comparison candidates, start with `POST /search/projects` using `filters.winnersOnly: true`. This includes prize winners and honorable mentions. Honorable mentions (`prize.type: "HONORABLE_MENTION"`) are not winners; call them honorable mentions even though `winnersOnly`, `isWinner`, `winnerCount` and `winners` include them. Preserve the question's customer, mechanism, stage, period, and other relevant constraints.

Read project details and available repository or demo evidence for the strongest matches before searching other submissions. Assess relevance and implemented functionality. Colosseum is a startup competition, so awards are a meaningful signal of relative startup promise within that event's submission pool. Favor prize winners among similarly relevant candidates; identify each prize and label honorable mentions separately. Verify demand, revenue, and current activity separately.

After that pass, broaden by removing `winnersOnly` when those projects leave gaps, lack relevant implementation evidence, or the question benefits from additional approaches or counterexamples. Explain why each additional project is useful. Include relevant discontinued attempts, pivots, and unknown outcomes when they affect the decision.

Follow explicit constraints on award status, including requests for unawarded projects or an exhaustive search across all submissions. Look up a named project directly; searches needed to resolve its name do not add an award filter. For recorded technology counts or population comparisons, use the requested population rather than carrying the discovery filter into later searches or analytics. If the same request also asks for examples, run their winner-first discovery separately from the population analysis. Identify a winner-only sample as such; it cannot establish what a typical project achieved.

For "who has tried X", run two differently worded searches. When using category keys, set `filters.includeSecondaryCategories: true` to include projects whose related second group matches, and deduplicate the results. Set `diversify: false` for exhaustive lists and paginate while `hasMore` is true. An empty-query filtered search lists every match across pages, newest first; `diversify` only affects searches with a query. Repeat with `filters.acceleratorOnly: true`, without carrying over the winner filter, and name the returned accelerator cohorts. Merge resubmissions only after establishing project identity; preserve each hackathon and date.

Explain differences in opportunity, timing, distribution, and evidence coverage. A successful similar team does not prove the proposed approach will succeed. A stalled team does not prove the market is impossible. Avoid causal conclusions from a handful of correlated histories.

Use canonical hackathon dates from the API rather than guessing chronology from names. Facets, analytics, and Grid aggregates count covered records under their filters. They do not measure market size, revenue, demand, or necessarily the semantic matches for a query. Check `filtersApplied`. Facets ignore the query. Use an empty query for exact filtered counts; with a query, `totalFound` is only a pagination value. To count prize winners, set `filters.prizeTypes` to every type from `GET /filters` except `HONORABLE_MENTION`, or report prize winners and honorable mentions separately.

## Resolve contradictions and stale facts

Keep conflicting claims visible with their dates and sources. Prefer a direct source for what it actually establishes; do not automatically prefer the newer page for a historical fact. Look for renamed products, changed definitions, differing periods, attribution mistakes, and copied reporting. Several pages repeating one announcement are not independent corroboration.

Fetch current primary sources afresh for current pricing, availability, dependencies, ownership, product activity, and other volatile facts. A search snippet or model answer is a lead. Inspect the underlying page before using it to support a consequential claim.

When retrieval fails, distinguish an evidence gap from a query/filter problem. Try exact identifiers, synonyms, a narrower concept, or fewer filters as appropriate. Report material coverage gaps, especially outside Solana. Never turn an empty search into a claim that nobody has tried something.

## Help the founder make a decision

When evaluating an idea, connect the evidence to the user's customer, problem, and constraints. Address the factors that materially affect the decision without filling a fixed report:

- Check potential blockers before recommending a plan or stack: platform and app-store rules, regulation, where users and liquidity already are, and who holds users' funds or assets. Do not set aside a factor that could decide the recommendation.
- Explain how customers solve the problem today, including non-crypto alternatives. Compare direct competitors with adjacent products and historical prototypes; project similarity alone does not establish direct competition.
- Before treating a hard part as custom development or a reason to narrow the market, investigate existing solutions. Study competitors and successful products for how they address the same user need. Explain what the builder can reuse, buy, integrate, or learn, and what remains their responsibility. Distinguish an observed product pattern from an implementation or service actually available to them. Use current primary evidence and choose references for the problem rather than relying on a fixed company list.
- Treat competition as evidence to investigate, not a verdict against building. Identify what competitors serve well and where a specific customer, workflow, distribution channel, integration, or other advantage could give a new entrant a reason to exist. Label an unverified angle as a hypothesis. Do not invent an underserved niche to make the idea sound promising.
- Connect relevant project and historical lessons to the proposed approach. Explain what the user can learn and where the comparison breaks down. Available infrastructure establishes feasibility, not demand; unfinished functionality is not automatically a business opportunity.
- Weigh reasons to pursue the idea and reasons for caution. Consider the business model, willingness to pay, distribution, switching costs, founder access, execution constraints, and the need for crypto where they matter. State missing evidence instead of inventing revenue estimates or assuming customer relationships.
- Give a proportionate recommendation and identify what would change it. When useful, propose a cheap experiment tied to the main uncertainty and the customer's actual behavior. Label suggested prices and thresholds as test assumptions. Explain what success or failure would establish, including how to distinguish weak demand from recruitment, onboarding, pricing, or workflow problems. A small assisted pilot does not establish repeatable acquisition or self-serve retention. A recommendation to stop needs reasons beyond competitor count, and a recommendation to proceed needs more than novelty or awards.

Do not force a binary verdict or redirect the user's idea just to create differentiation. Offer a promising alternative angle when the evidence supports it, while keeping the original idea and its tradeoffs clear.

## Deliver the useful result

For project recommendations, explain what each selected project built, why it matters to this user, and the lesson or limitation that affects their next decision. Distinguish a business worth studying, an implementation to adapt, and a UX pattern to learn from. Rank or group examples by usefulness rather than presenting every search result. Keep evidence detail that changes the advice; more citations, counts, or sections do not make an answer more useful by themselves.

Cite sources beside the claims they support. Link each cited project's public Colosseum page and each source's public page, checking that links resolve. Give the requested answer, explain what remains unknown, and suggest a next check only when it would improve the decision. Save private notes only if they help continuity. Do not require a saved report or upload research without permission.
