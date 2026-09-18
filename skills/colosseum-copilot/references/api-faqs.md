# Colosseum FAQs

Use the canonical FAQ registry for questions about Colosseum programs. These authenticated read endpoints are available in V2. If an older service returns an endpoint 404, read the current official program page and disclose that fallback.

## List and search

`GET /api/v1/faqs?program=accelerator&q=funding`

`program` optionally selects `hackathon`, `eternal`, `accelerator`, or `stamp`. `q` is optional, trimmed, and 2–200 characters. Omit it to browse every FAQ, or use a short phrase to narrow results. Search ranks matching question terms ahead of answer terms; it is keyword retrieval, not semantic search. A search with no matches returns an empty `faqs` array, not a negative policy answer.

```text
source: { kind: "bundled-registry"; revision: string [sha256 digest] }
programs: Array<{ program: string; count: number }>
faqs: Array<faq>
query: { program: string [optional]; q: string [optional]; matched: number }
faq: { program: string; id: string; question: string; answer: string; answerFormat: "markdown"; sourceUrl: string; contentRevision: string [sha256 digest]; links: Array<{ label: string; url: string }> }
```

`GET /api/v1/faqs/:program/:id` returns `{ source, faq }` for a stable FAQ identity. Unknown identities return 404; invalid query/path values return 400. The endpoints share the search rate limit of 30 requests/minute per user.

## Answer with the current source

Cite `sourceUrl` beside the answer and preserve useful links in the Markdown. The registry is shared with the marketing site and platform, bundled when the API is built. Revisions identify content; they do not assert a live check or publication date. Different deployment times can temporarily put the API behind the site. For consequential deadlines, eligibility, funding terms, or a suspected conflict, verify the linked live program page. Prefer its current policy over historical archive statements and name any unresolved conflict. Do not invent eligibility guarantees or expose private application information.
