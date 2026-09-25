# Technology analysis

V2 sign-in provides four `POST` routes under `/technologies`: `/counts`, `/co-usage`, `/trends`, and `/top`. They use recorded technology tags from public project repositories. They require `evidence:read` (or `copilot:retrieval`); a v1 personal token receives `403 INSUFFICIENT_SCOPE`. The four routes share the analysis limit of 10 requests per minute and the per-user limit of two concurrent requests.

## Requests

A technology is `{ "category": "frameworks", "name": "Anchor" }`. The seven categories are `languages`, `frameworks`, `chains`, `protocols`, `services`, `tooling`, and `standards`. Names are trimmed and matched without case, but there is no alias or substring matching. The same name in different categories identifies different technologies. Find recorded names in project details.

Each route accepts an optional `cohort`:

```json
{
  "hackathonSlugs": ["radar", "breakout"],
  "winnersOnly": true,
  "includeHonorableMentions": false,
  "categoryKeys": ["stablecoin-rails"]
}
```

Omitting `cohort` selects all permitted projects in launched V2 hackathons. `hackathonSlugs` accepts one to 20 slugs; `categoryKeys` accepts one to ten keys. Read `GET /categories` for the current keys. `winnersOnly` defaults to `false`. When it is `true`, honorable mentions are excluded unless `includeHonorableMentions: true`. Using `includeHonorableMentions: true` without `winnersOnly: true` is invalid. Without a winner filter, honorable mentions remain ordinary projects. The category filter selects any listed key.

Requests reject unknown fields. Unknown technologies or hackathons return empty or zero results. For `/co-usage` and `/top`, `topK` defaults to 10 and accepts integers from 1 to 50. All shares use the full selected cohort as their denominator, including projects without usable repository tags.

### Counts

`POST /technologies/counts`:

```json
{
  "technology": { "category": "frameworks", "name": "Anchor" },
  "cohort": { "winnersOnly": true }
}
```

The response has `technology`, `totals`, and `hackathons`. `totals` contains `projects` (permitted projects in the cohort), `projectsWithRepositoryTags` (projects with usable tags), `count` (distinct projects tagged with the technology), and `share` (`count / projects`, or zero for an empty cohort). Each `hackathons` entry has the same four numbers and `hackathon: { slug, name, startDate }`. `startDate` can be null. Entries run in hackathon date order, then slug; a selected hackathon with no matching projects has zero counts.

### Technologies used together

`POST /technologies/co-usage` accepts `technology`, optional `cohort`, and optional `topK`. It returns `technology`, `totals` as above, and `results`. Each result has `technology`, `count` (projects tagged with both technologies), `share` (`count / input technology count`), `cohortCount` (projects tagged with the other technology in the full cohort), and `lift` (`share / (cohortCount / projects)`). Lift compares co-usage with that other technology's cohort frequency. Results are ordered by co-usage count, then category and name. The input technology is omitted; no input matches gives an empty list.

### Trends

`POST /technologies/trends` accepts `technology` and optional `cohort`. It returns `technology` and the same ordered `hackathons` entries as `/counts`. Compare `projectsWithRepositoryTags` as well as `count` before interpreting a change in `share` as a change in adoption.

### Top technologies

`POST /technologies/top` accepts optional `cohort`, `technologyCategory`, and `topK`:

```json
{
  "cohort": { "hackathonSlugs": ["breakout"] },
  "technologyCategory": "services",
  "topK": 5
}
```

Omit `technologyCategory` to rank across all seven technology categories. The response has `totals: { projects, projectsWithRepositoryTags }` and `results: [{ technology: { category, name }, count, share }]`. Counts are per project; shares use all cohort projects. Results are ordered by count, then category and name. Multiple hackathons are combined; request each separately for separate rankings.

## Reading the results

These are counts of recorded repository tags among permitted projects, not proof of current deployment or use. Missing tags do not establish that a project uses none. Compare tag coverage across cohorts before interpreting shares or trends. For project names and source evidence, use `POST /search/projects` with an empty query and `filters.builtWith`, then open project details. A temporary `503 EVIDENCE_UNAVAILABLE` means the repository checks are not current; retry later. Project permission changes can return retryable `503 PROJECT_PERMISSIONS_UNAVAILABLE`.
