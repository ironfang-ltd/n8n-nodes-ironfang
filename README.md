<p align="center"><img src="nodes/Ironfang/ironfang.svg" width="110" alt="Ironfang"></p>

# @ironfang/n8n-nodes-ironfang

Use Ironfang Render, Finance, Audit and Rig, and Ironfang's public developer
tools, in n8n. The Ironfang action node has **162 operations**, grouped by
product. Ironfang Trigger receives signed Audit, Finance and Render events.

**Release: 0.4.1.** This patch makes the package installable on n8n releases
before 2.33 that use PostgreSQL; see [Installation](#installation-and-credentials).
It includes 0.4.0, in which the products are named Ironfang Render, Finance and Audit
(formerly Renderwolf, Financewolf and Auditwolf), and the node follows: requests
go to the `/render`, `/finance` and `/audit` API prefixes and scopes are shown as
`render:*`, `finance:*` and `audit:*`. It adds Ironfang Rig, Finance jobs,
batches, destinations, deliveries, signed reports and PDFs, the newer Audit and
Render lists, and paging for Audit lists. Saved workflows and credentials need no
change; see [Compatibility with earlier names](#compatibility-with-earlier-names).

## Installation and credentials

On self-hosted n8n, open **Settings → Community Nodes → Install** and enter
`@ironfang/n8n-nodes-ironfang`. The old `@ironfang/n8n-nodes-renderwolf` package
is deprecated. Versions 0.2.3 to 0.4.0 cannot be installed on n8n releases
before 2.33 that use PostgreSQL: n8n reports `Failed to save installed package`
with `invalid input syntax for type integer`, because those releases store a
node's newest version as an integer and these packages' newest node version was
1.1 or 1.2. Install 0.4.1 or later, or upgrade n8n. n8n Cloud installation requires n8n's manual package verification;
npm publishing and automated checks do not establish that approval.

Create an `if_live_` platform API key at [portal.ironfang.uk](https://portal.ironfang.uk)
with the scopes your workflow needs, then select an Ironfang API credential.
Existing `rw_live_` Render keys and both origin-only and `/renderwolf` base
URLs remain supported. Other product bases and custom gateway prefixes work too.
A successful credential test confirms authentication by a product, including
an explicit scope refusal; it does not grant other operation permissions.

Public tools need no credential. Finance validation, generation, ruleset reads
and signed-report verification offer an explicit **Public** mode; saved results
require authentication. An invalid API key never falls back to public access.
Public Finance calls cannot use idempotency keys or access an organisation's
retained results.

## Products and operations

| Resource | Operations |
| --- | --- |
| Render | Screenshot, PDF, template image, video clip, signed URL, usage, QR, site preview, templates, jobs, batches and their lists, capabilities, request history, destinations and deliveries |
| Finance | Validate XML; generate a validated UBL invoice or credit note; async jobs and ordered batches; webhook and S3 destinations, deliveries and retries; signed reports and their verification; readable PDFs of saved generations; list/get rulesets; list/get/delete saved results; usage |
| Audit | Sites, audits, pages, findings and decisions, rules and rule packs, monitors across the organisation or a site, changes and comparisons, evidence, artifacts, export destinations/jobs, webhooks and deliveries across the organisation or an endpoint, events and usage |
| Rig | Projects, suites and versions; runs, holds and receipts; email, callback, mock and connector resources; mock rules; faults; the event timeline, waits, payloads and callback replay; evidence bundles; usage and environment |
| Public Tool | Image conversion, favicon ZIP, QR generation and verification, UUID generation and inspection, free screenshot |

The [operation reference](docs/operations.md) lists each action's endpoint,
permission, query fields and request example. Complex API bodies use a JSON
editor so nested fields remain available. Replace the example values before
running a write operation. Request definitions are available in the product
specifications: [Render](https://api.ironfang.uk/render/openapi.yaml),
[Finance](https://api.ironfang.uk/finance/openapi.yaml),
[Audit](https://api.ironfang.uk/audit/openapi.yaml),
[Rig](https://api.ironfang.uk/rig/openapi.yaml).

Screenshots support PNG/JPEG/WebP and phone/tablet device presets. Advanced
Render Options accepts custom `css`, a page `script`, ordered `actions` (click,
hover, wait for a selector, delay), waits, blocking, selectors, request headers,
cookies, user agent and pixel density. For PDFs it also accepts `paper_format` and
`margin` (numeric inches); screenshot region capture uses `clip`. For template images it accepts
inline `qr` variables. The source and template variables have their own fields.
The template picker loads pages without HTML and requires template-read scope;
entering a template ID directly needs only render scope.

Job and batch submission require a stable idempotency key. Get the returned ID,
use n8n's Wait node between status checks, then Download Job Result. Signed result
URLs are validated against the configured Render endpoint and downloaded
without an API key. Site Preview returns the MP4 in the selected binary field
and a JPEG in `poster`. A result download can return this same two-file bundle.

Finance Validate accepts XML text or an n8n binary field, including filesystem
and external binary storage. A standards-invalid invoice is a normal result:
branch on `outcome`, rather than treating HTTP 200 as an invoice approval.
Generation requires explicit ruleset/profile selectors and preserves decimal
strings. It returns validation metadata and XML binary data after checking the
artifact's byte count and SHA-256. Authenticated artifacts/findings are retained
by Finance for 30 days; deletion does not remove n8n's own execution records.

Finance jobs and batches run validation or generation asynchronously: create one
with a stable idempotency key, poll it with n8n's Wait node, or register a
destination and let Ironfang Trigger receive the signed result. Download Signed
Report and Render E-Invoice PDF return files for a saved result's
`operation_id`; Verify Signed Report takes the report ZIP from a binary field
and needs no key. `verified` means the report is intact, not that the invoice
is valid: read `invoice_outcome` as well.

Rig drives an integration test run from a workflow: start a run for a suite,
allocate inboxes, callback URLs and mocks, arm faults, and use Wait For Event to
hold until your system under test has called in. A wait that times out is an
ordinary result with `matched: false`; continue from `next_since`. The node
allows a wait its full 90 seconds. Export Run Evidence returns the ZIP bundle.
Create Connector returns a one-time bootstrap token in its output.

Paginated lists have Return All, Limit and a starting cursor, offset or
sequence. Each row becomes an output item with its input link. Audit lists that
were released without paging (audits, audit pages, finding events, rule
revisions, exports, monitor runs and an endpoint's deliveries) page from node
version 1.2; in workflows saved with an earlier version they keep returning the
API's single JSON response, which now carries `next_cursor`. Re-add the node to
move a saved workflow to paged output. Other list actions retain the API's JSON
envelope and API-imposed result caps. Pagination stops at 1,000 pages and
refuses repeated cursors.

S3 destination creation for Render, Finance and Audit reads secret fields from
an **Ironfang S3 Destination** credential; Finance Update Destination replaces
stored keys the same way. Do not put them in Request Body JSON. Its connection check validates
that fields are present; the product's Test Destination operation verifies
actual S3 access once the bucket/region are registered. One-time webhook secrets
returned by creation/rotation need to be saved securely; n8n execution retention
also applies to these outputs.

## Permissions and usage

| Actions | API key scopes |
| --- | --- |
| Render rendering, jobs/batches, delivery reads | `render:render` |
| Signed URL | `render:sign` |
| Templates | `render:templates:read` / `render:templates:write` |
| Usage and request history | `render:usage:read` |
| Destinations and redelivery | `render:destinations` |
| Finance validation, generation, jobs, batches, result deletion | `finance:einvoices:write` |
| Finance saved results, job/batch/delivery reads, reports and PDFs | `finance:einvoices:read` |
| Finance authenticated ruleset reads | `finance:einvoices:rulesets:read` |
| Finance destinations and delivery retries | `finance:einvoices:destinations:manage` |
| Finance usage | `finance:billing:manage` |
| Audit reads / running audits / managing resources | `audit:read` / `audit:run` / `audit:manage` |
| Audit evidence and artifacts | `audit:evidence` |
| Audit webhooks and exports | `audit:integrations` |
| Rig reads, waits and evidence / projects and suites / runs, resources and faults / connectors | `rig:read` / `rig:write` / `rig:run` / `rig:connector` |

Keys created with the earlier `renderwolf:*`, `financewolf:*` and `auditwolf:*`
scopes keep working: the platform treats them as the scopes above.

Render includes **250 free credits each month**, with no card required.
A screenshot or template image costs 1 credit, a PDF 2, and QR codes 0. Clip
costs depend on duration and output size. Cache hits consume no credits.
Free renders can carry an Ironfang Render badge; QR codes never carry one. This
allowance belongs to Render; other products have their own usage policies.

Public tools use no account credits and share a 60/minute/address limit. The
public screenshot service also has a 20/hour/address limit and a shared daily
ceiling. Shared n8n egress addresses share these limits. Use authenticated
Render rendering for account-based automation.

Billing changes, administration, unreleased Peppol transport/registration
and Financial Promotions are outside this package.

## Signed event trigger

1. Add **Ironfang Trigger** and copy its production webhook URL.
2. Use Audit Create Webhook, or Finance or Render Create Destination, to
   register that URL and the events you want.
3. Save the returned secret in an **Ironfang Webhook API** credential. Select
   its product, attach it to the trigger, and activate the workflow.
4. Run Test Webhook/Test Destination to send a signed test event.

The trigger verifies HMAC-SHA256 over the timestamp and exact body bytes using
constant-time comparison, accepts timestamps within five minutes, and rejects
invalid signatures before starting a workflow. Render and Finance secrets are
decoded from hex; Audit secrets are used as returned. Deliveries are signed in
the `Renderwolf-`, `Financewolf-` and `Auditwolf-` headers the products launched
with; the trigger reads the ones for the credential's product. The signed event ID, rather
than the unsigned header ID, is used for duplicate detection.

Duplicate state covers seven days/up to 10,000 IDs in n8n workflow static data.
It persists for active workflows and is tested across a restart. Static data
is not an atomic shared store across workers: use the event ID as a durable
idempotency key for consequential downstream writes. Failed workflow execution
and n8n's retry/retention settings also affect delivery processing.

Endpoints are registered explicitly and remain customer-owned. Deactivating or
deleting the n8n workflow removes its local listener; disable/delete the product
endpoint separately to stop deliveries. Rotating an endpoint secret requires
updating the n8n credential.

The required `checkExists`, `create` and `delete` lifecycle hooks acknowledge
this external setup. They do not call the product management API or verify
remote registration. Use Test Webhook/Test Destination to check delivery.

## Compatibility with earlier names

Nothing saved needs editing. Workflows store the resource as `renderwolf`,
`financewolf` or `auditwolf`, and webhook credentials store the same product
values; these identifiers are unchanged and only their labels are new. A
credential whose base URL is an origin, `/renderwolf` or any other product path
is routed to the current prefix for the operation. The API still answers the
earlier prefixes, but its own links (for example a job result's signed download
location) use the current ones, which is why 0.3.1 and earlier fail Download Job
Result against the current API: upgrade to fix it.

## Outputs, examples and compatibility

Existing version 1 workflows retain string `bytes` and `error`
fields. Version 1.1 uses numeric `bytes` and structured errors; version 1.2 adds
paging to the Audit lists named above and is otherwise identical. Version 2,
which new nodes use, behaves as 1.2 does. All expose exact
`byteLength`, item links and `_ironfang` response metadata when available:
request ID, HTTP status, cache status and charged credits. Continued errors
include available problem codes and retry information. New file operations use
numeric sizes; the output binary field defaults to `data`.

Requests have explicit timeouts: 30 seconds for JSON (100 for a Rig wait) and
120 seconds for binary rendering. The node does not automatically repeat a paid operation. Reuse the
same idempotency key only for an identical business operation and respect
returned retry information when configuring n8n retries.

Import the [template render](examples/template-image.json),
[invoice validation](examples/invoice-validation.json),
[invoice generation to storage](examples/invoice-generation-storage.json),
[invoice job and signed report](examples/invoice-job-report.json) (one pause
before reading the job; loop as the audit example does for larger documents),
[audit status polling](examples/audit-polling.json), or
[Rig run with a callback wait](examples/rig-callback-wait.json) workflow. Select credentials
and replace placeholder IDs, bucket names and example invoice data before running.
All examples are inactive on import.

The tested n8n runtime is **2.38.1**, using its filesystem binary storage.
Compilation/lint/unit checks run under Node.js 22 and 24. Saved version 1, 1.1,
1.2 and 2 workflows are exercised; older n8n host releases are not certified by this
matrix. The published node has no external runtime dependencies.

## Development and releases

Run `npm ci --ignore-scripts` and `npm run check`. With Docker, run
`bash scripts/check-runtime.sh`, `bash scripts/check-webhook-runtime.sh` and
`bash scripts/check-postgres-install.sh`. The last installs the build through
n8n's community-package API on PostgreSQL, against n8n 2.32.4, from a throwaway
local registry. The first two execute local fixtures, including multipart/file handling and signed
webhooks; they make no paid API calls. CI requires both before release.
Lint runs with inline configuration disabled, matching the submission scanner's
handling of suppression comments. Shared code in `lib/` is also linted and packaged.

To refresh the catalogue from an Ironfang source checkout, use
`python3 scripts/sync-contracts.py /path/to/ironfang` (development-only PyYAML).
Catalogue `product` values are the saved resource identifiers; the script maps
each to its API prefix and scope family.
Review endpoint handlers alongside OpenAPI changes. See [RELEASING.md](RELEASING.md)
and the [validation record](docs/validation.md) for the release procedure and
qualification of automated checks. License: MIT.
