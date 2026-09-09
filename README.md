<p align="center"><img src="nodes/Ironfang/ironfang.svg" width="110" alt="Ironfang"></p>

# @ironfang/n8n-nodes-ironfang

Use Renderwolf, Financewolf, Auditwolf and Ironfang's public developer tools in
n8n. The Ironfang action node has **103 operations**, grouped by product. Ironfang
Trigger receives signed Auditwolf and Renderwolf events.

**Release: 0.3.0.** This version includes the product expansion and signed event
trigger described below, plus the maintenance fixes from 0.2.3.

## Installation and credentials

On self-hosted n8n, open **Settings → Community Nodes → Install** and enter
`@ironfang/n8n-nodes-ironfang`. The old `@ironfang/n8n-nodes-renderwolf` package
is deprecated. n8n Cloud installation requires n8n's manual package verification;
npm publishing and automated checks do not establish that approval.

Create an `if_live_` platform API key at [portal.ironfang.uk](https://portal.ironfang.uk)
with the scopes your workflow needs, then select an Ironfang API credential.
Existing `rw_live_` Renderwolf keys and both origin-only and `/renderwolf` base
URLs remain supported. Other product bases and custom gateway prefixes work too.
A successful credential test confirms authentication by a product, including
an explicit scope refusal; it does not grant other operation permissions.

Public tools need no credential. Financewolf validation, generation and ruleset
reads offer an explicit **Public** mode; saved results require authentication.
An invalid API key never falls back to public access. Public Financewolf calls
cannot use idempotency keys or access an organisation's retained results.

## Products and operations

| Resource | Operations |
| --- | --- |
| Renderwolf | Screenshot, PDF, template image, video clip, signed URL, usage, QR, site preview, templates, jobs, batches, capabilities, request history, destinations and deliveries |
| Financewolf | Validate XML; generate a validated UBL invoice or credit note; list/get rulesets; list/get/delete saved results |
| Auditwolf | Sites, audits, pages, findings and decisions, rules and rule packs, monitors, changes and comparisons, evidence, artifacts, export destinations/jobs, webhooks and deliveries, events and usage |
| Public Tool | Image conversion, favicon ZIP, QR generation and verification, UUID generation and inspection, free screenshot |

The [operation reference](docs/operations.md) lists each action's endpoint,
permission, query fields and request example. Complex API bodies use a JSON
editor so nested fields remain available. Replace the example values before
running a write operation. Request definitions are available in the product
specifications: [Renderwolf](https://api.ironfang.uk/renderwolf/openapi.yaml),
[Financewolf](https://api.ironfang.uk/financewolf/openapi.yaml),
[Auditwolf](https://api.ironfang.uk/auditwolf/openapi.yaml).

Screenshots support PNG/JPEG/WebP and phone/tablet device presets. Advanced
Render Options accepts waits, blocking, selectors, request headers, cookies,
user agent and pixel density. For PDFs it also accepts `paper_format` and
`margin` (numeric inches); screenshot region capture uses `clip`. For template images it accepts
inline `qr` variables. The source and template variables have their own fields.
The template picker loads pages without HTML and requires template-read scope;
entering a template ID directly needs only render scope.

Job and batch submission require a stable idempotency key. Get the returned ID,
use n8n's Wait node between status checks, then Download Job Result. Signed result
URLs are validated against the configured Renderwolf endpoint and downloaded
without an API key. Site Preview returns the MP4 in the selected binary field
and a JPEG in `poster`. A result download can return this same two-file bundle.

Financewolf Validate accepts XML text or an n8n binary field, including filesystem
and external binary storage. A standards-invalid invoice is a normal result:
branch on `outcome`, rather than treating HTTP 200 as an invoice approval.
Generation requires explicit ruleset/profile selectors and preserves decimal
strings. It returns validation metadata and XML binary data after checking the
artifact's byte count and SHA-256. Authenticated artifacts/findings are retained
by Financewolf for 30 days; deletion does not remove n8n's own execution records.

Paginated templates, jobs, deliveries, request history, Financewolf results,
Auditwolf findings and page observations have Return All, Limit and starting
cursor/offset controls. Each row becomes an output item with its input link.
Other list actions retain the API's JSON envelope and API-imposed result caps.
Pagination stops at 1,000 pages and refuses repeated cursors.

S3 destination creation reads secret fields from an **Ironfang S3 Destination**
credential. Do not put them in Request Body JSON. Its connection check validates
that fields are present; the product's Test Destination operation verifies
actual S3 access once the bucket/region are registered. One-time webhook secrets
returned by creation/rotation need to be saved securely; n8n execution retention
also applies to these outputs.

## Permissions and usage

| Actions | API key scopes |
| --- | --- |
| Renderwolf rendering, jobs/batches, delivery reads | `renderwolf:render` |
| Signed URL | `renderwolf:sign` |
| Templates | `renderwolf:templates:read` / `renderwolf:templates:write` |
| Usage and request history | `renderwolf:usage:read` |
| Destinations and redelivery | `renderwolf:destinations` |
| Financewolf validation/generation/result deletion | `financewolf:einvoices:write` |
| Financewolf saved result reads | `financewolf:einvoices:read` |
| Financewolf authenticated ruleset reads | `financewolf:einvoices:rulesets:read` |
| Auditwolf reads / running audits / managing resources | `auditwolf:read` / `auditwolf:run` / `auditwolf:manage` |
| Auditwolf evidence and artifacts | `auditwolf:evidence` |
| Auditwolf webhooks and exports | `auditwolf:integrations` |

Renderwolf includes **250 free credits each month**, with no card required.
A screenshot or template image costs 1 credit, a PDF 2, and QR codes 0. Clip
costs depend on duration and output size. Cache hits consume no credits.
Free renders can carry a Renderwolf badge; QR codes never carry one. This
allowance belongs to Renderwolf; other products have their own usage policies.

Public tools use no account credits and share a 60/minute/address limit. The
public screenshot service also has a 20/hour/address limit and a shared daily
ceiling. Shared n8n egress addresses share these limits. Use authenticated
Renderwolf rendering for account-based automation.

Billing changes, administration, unreleased Peppol transport/registration,
Financewolf PDFs and Financial Promotions are outside this package.

## Signed event trigger

1. Add **Ironfang Trigger** and copy its production webhook URL.
2. Use Auditwolf Create Webhook or Renderwolf Create Destination to register
   that URL and the events you want.
3. Save the returned secret in an **Ironfang Webhook API** credential. Select
   its product, attach it to the trigger, and activate the workflow.
4. Run Test Webhook/Test Destination to send a signed test event.

The trigger verifies HMAC-SHA256 over the timestamp and exact body bytes using
constant-time comparison, accepts timestamps within five minutes, and rejects
invalid signatures before starting a workflow. Renderwolf secrets are decoded
from hex; Auditwolf secrets are used as returned. The signed event ID, rather
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

## Outputs, examples and compatibility

Existing Renderwolf version 1 workflows retain string `bytes` and `error`
fields. Version 1.1 uses numeric `bytes` and structured errors. Both expose exact
`byteLength`, item links and `_ironfang` response metadata when available:
request ID, HTTP status, cache status and charged credits. Continued errors
include available problem codes and retry information. New file operations use
numeric sizes; the output binary field defaults to `data`.

Requests have explicit timeouts: 30 seconds for JSON and 120 seconds for binary
rendering. The node does not automatically repeat a paid operation. Reuse the
same idempotency key only for an identical business operation and respect
returned retry information when configuring n8n retries.

Import the [template render](examples/template-image.json),
[invoice validation](examples/invoice-validation.json),
[invoice generation to storage](examples/invoice-generation-storage.json), or
[audit status polling](examples/audit-polling.json) workflow. Select credentials
and replace placeholder IDs, bucket names and example invoice data before running.
All examples are inactive on import.

The tested n8n runtime is **2.38.1**, using its filesystem binary storage.
Compilation/lint/unit checks run under Node.js 22 and 24. Saved version 1 and
1.1 workflows are exercised; older n8n host releases are not certified by this
matrix. The published node has no external runtime dependencies.

## Development and releases

Run `npm ci --ignore-scripts` and `npm run check`. With Docker, run
`bash scripts/check-runtime.sh` and `bash scripts/check-webhook-runtime.sh`.
These execute local fixtures, including multipart/file handling and signed
webhooks; they make no paid API calls. CI requires both before release.

To refresh the catalogue from an Ironfang source checkout, use
`python3 scripts/sync-contracts.py /path/to/ironfang` (development-only PyYAML).
Review endpoint handlers alongside OpenAPI changes. See [RELEASING.md](RELEASING.md)
and the [validation record](docs/validation.md) for the release procedure and
qualification of automated checks. License: MIT.
