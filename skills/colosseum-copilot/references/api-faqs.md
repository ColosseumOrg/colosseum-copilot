# Colosseum FAQs

Use the canonical FAQ registry for questions about Colosseum programs. If `/faqs` fails, read the official program page instead and say so.

## List and search

`GET /faqs?program=accelerator&q=funding`

`program` optionally selects `hackathon`, `eternal`, `accelerator`, or `stamp` (the Colosseum STAMP, its agreement for private investment before a MetaDAO token launch). `q` is optional, trimmed, and 2–200 characters. Omit it to browse every FAQ, or use a short phrase to narrow results. Search ranks matching question terms ahead of answer terms; it is keyword retrieval, not semantic search. A search with no matches returns an empty `faqs` array, not a negative policy answer.

```text
eventDates: { hackathonSlug: string; startDate: string [datetime]; submissionDeadline: string [datetime]; winnerAnnouncementDate: string [datetime] | null } | null
source: { kind: "bundled-registry"; revision: string [sha256 digest] }
programs: Array<{ program: string; count: number }>
faqs: Array<faq>
query: { program: string [optional]; q: string [optional]; matched: number }
faq: { program: string; id: string; question: string; answer: string; answerFormat: "markdown"; sourceUrl: string; contentRevision: string [sha256 digest]; links: Array<{ label: string; url: string }> }
```

`GET /faqs/:program/:id` returns `{ eventDates, source, faq }` for a stable FAQ identity. Unknown identities return 404; invalid query/path values return 400. The endpoints share the search rate limit of 30 requests/minute per user.

## Answer with the current source

Cite `sourceUrl` beside the answer and preserve useful links in the Markdown. The FAQ text can briefly lag the live program page. Revisions identify content, not a publication date. For consequential deadlines, eligibility, funding terms, or a suspected conflict, verify the linked live program page. Prefer its current policy over historical archive statements and name any unresolved conflict. Do not invent eligibility guarantees or expose private application information.
