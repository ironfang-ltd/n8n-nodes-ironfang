# Operation reference

Generated from Ironfang main `2230209`. Runtime endpoint selection is fixed by this catalogue.
Complex request bodies use JSON so all supported schema fields remain available. Replace placeholders with your own values.

## auditwolf / Archive Monitor

`POST /auditwolf/v1/monitors/{monitorId}/archive`. Scope: `auditwolf:manage`.

Archive a monitor (one-way; its audits and evidence remain)

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Bulk Update Findings

`POST /auditwolf/v1/findings/bulk`. Scope: `auditwolf:manage`.

Apply one decision to several findings

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

```json
{
  "ids": [
    ""
  ]
}
```

## auditwolf / Compare Page Observation

`GET /auditwolf/v1/page-observations/{observationId}/comparison`. Scope: `auditwolf:read`.

What changed against the observation before it

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Create Export Destination

`POST /auditwolf/v1/export-destinations`. Scope: `auditwolf:integrations`.

Create an encrypted S3/S3-compatible destination

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

```json
{
  "region": "eu-west-2",
  "bucket": "your-bucket",
  "prefix": "auditwolf",
  "export_mode": "manual_only"
}
```

## auditwolf / Create Monitor

`POST /auditwolf/v1/sites/{siteId}/monitors`. Scope: `auditwolf:manage`.

Create a monitor

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Create Rule

`POST /auditwolf/v1/sites/{siteId}/rules`. Scope: `auditwolf:manage`.

Create a deterministic rule

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

```json
{
  "name": "",
  "rule_type": "",
  "configuration": {}
}
```

## auditwolf / Create Site

`POST /auditwolf/v1/sites`. Scope: `auditwolf:manage`.

Create a site

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

```json
{
  "name": "Example site",
  "url": "https://example.com"
}
```

## auditwolf / Create Webhook

`POST /auditwolf/v1/webhooks`. Scope: `auditwolf:integrations`.

Create a signed webhook endpoint

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

```json
{
  "url": "https://example.com/webhook",
  "events": [
    "audit.completed"
  ]
}
```

## auditwolf / Delete Webhook

`DELETE /auditwolf/v1/webhooks/{endpointId}`. Scope: `auditwolf:integrations`.

Retire an endpoint (soft; its delivery history is kept)

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Disable Rule

`POST /auditwolf/v1/rules/{lineageId}/disable`. Scope: `auditwolf:manage`.

Disable a rule for future audits

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Download Artifact

`GET /auditwolf/v1/artifacts/{artifactId}`. Scope: `auditwolf:evidence`.

Stream an authenticated raw artifact

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Download Audit Evidence

`GET /auditwolf/v1/audits/{auditId}/evidence`. Scope: `auditwolf:evidence`.

Download the independently verifiable evidence ZIP

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Enable Rule

`POST /auditwolf/v1/rules/{lineageId}/enable`. Scope: `auditwolf:manage`.

Enable a rule for future audits

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Export Audit

`POST /auditwolf/v1/audits/{auditId}/exports`. Scope: `auditwolf:integrations`.

Queue a manual S3 export

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

```json
{
  "destination_id": ""
}
```

## auditwolf / Get Audit

`GET /auditwolf/v1/audits/{auditId}`. Scope: `auditwolf:read`.

Get audit lifecycle, compliance and integrity state

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Get Finding

`GET /auditwolf/v1/findings/{findingId}`. Scope: `auditwolf:read`.

Get one finding

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Get Findings Summary

`GET /auditwolf/v1/findings/summary`. Scope: `auditwolf:read`.

The numbers at the top of the finding inbox

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Get Monitor

`GET /auditwolf/v1/monitors/{monitorId}`. Scope: `auditwolf:read`.

Get a monitor with its URL set

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Get Page Observation

`GET /auditwolf/v1/page-observations/{observationId}`. Scope: `auditwolf:read`.

One observation with its artifacts and rule results

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Get Rule

`GET /auditwolf/v1/rules/{lineageId}`. Scope: `auditwolf:read`.

Get the active revision of a rule

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Get Site

`GET /auditwolf/v1/sites/{siteId}`. Scope: `auditwolf:read`.

Get a site

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Home

`GET /auditwolf/v1/home`. Scope: `auditwolf:read`.

Tenant-scoped setup facts and recent activity for the portal

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Install Rule Pack

`POST /auditwolf/v1/sites/{siteId}/rule-packs`. Scope: `auditwolf:manage`.

Install a rule pack

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

```json
{
  "pack_key": "",
  "variables": {}
}
```

## auditwolf / List Audit Pages

`GET /auditwolf/v1/audits/{auditId}/pages`. Scope: `auditwolf:read`.

Page observations of an audit

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

Query fields: `change`, `compliance`, `capture`, `q`.

## auditwolf / List Audits

`GET /auditwolf/v1/audits`. Scope: `auditwolf:read`.

List organisation audits

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

Query fields: `site_id`.

## auditwolf / List Events

`GET /auditwolf/v1/events`. Scope: `auditwolf:read`.

The organisation's recent product events, newest first

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / List Export Destinations

`GET /auditwolf/v1/export-destinations`. Scope: `auditwolf:integrations`.

List S3 destinations

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / List Exports

`GET /auditwolf/v1/exports`. Scope: `auditwolf:integrations`.

List export jobs

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / List Finding Events

`GET /auditwolf/v1/findings/{findingId}/events`. Scope: `auditwolf:read`.

The append-only history of a finding

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / List Findings

`GET /auditwolf/v1/findings`. Scope: `auditwolf:read`.

The finding inbox

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

Query fields: `site_id`, `page_id`, `rule_id`, `state`, `severity`, `assignee`, `open_longer_than_days`, `limit`, `offset`.

## auditwolf / List Installed Rule Packs

`GET /auditwolf/v1/sites/{siteId}/rule-packs`. Scope: `auditwolf:read`.

Packs installed on this site

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / List Monitor Runs

`GET /auditwolf/v1/monitors/{monitorId}/runs`. Scope: `auditwolf:read`.

The monitor's audits, newest first

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / List Page Observations

`GET /auditwolf/v1/pages/{pageId}/observations`. Scope: `auditwolf:read`.

A page's observation history, newest first

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

Query fields: `cursor`, `limit`.

## auditwolf / List Rule Packs

`GET /auditwolf/v1/rule-packs`. Scope: `auditwolf:read`.

The rule pack catalogue

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / List Rule Revisions

`GET /auditwolf/v1/rules/{lineageId}/revisions`. Scope: `auditwolf:read`.

List every revision of a rule, newest first

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / List Site Audits

`GET /auditwolf/v1/sites/{siteId}/audits`. Scope: `auditwolf:read`.

List site audits

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / List Site Monitors

`GET /auditwolf/v1/sites/{siteId}/monitors`. Scope: `auditwolf:read`.

List the site's monitors

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / List Site Rules

`GET /auditwolf/v1/sites/{siteId}/rules`. Scope: `auditwolf:read`.

List the site's versioned deterministic rules

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / List Sites

`GET /auditwolf/v1/sites`. Scope: `auditwolf:read`.

List sites

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / List Webhook Deliveries

`GET /auditwolf/v1/webhooks/{endpointId}/deliveries`. Scope: `auditwolf:integrations`.

List delivery attempts

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / List Webhooks

`GET /auditwolf/v1/webhooks`. Scope: `auditwolf:integrations`.

List lifecycle webhook endpoints

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Pause Monitor

`POST /auditwolf/v1/monitors/{monitorId}/pause`. Scope: `auditwolf:manage`.

Pause scheduling

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Replace Monitor URLs

`PUT /auditwolf/v1/monitors/{monitorId}/urls`. Scope: `auditwolf:manage`.

Replace a url_set monitor's URL list

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Resume Monitor

`POST /auditwolf/v1/monitors/{monitorId}/resume`. Scope: `auditwolf:manage`.

Resume scheduling

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Retire Rule

`DELETE /auditwolf/v1/rules/{lineageId}`. Scope: `auditwolf:manage`.

Retire a rule

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Retry Webhook Delivery

`POST /auditwolf/v1/webhooks/{endpointId}/deliveries/{deliveryId}/retry`. Scope: `auditwolf:integrations`.

Re-queue a failed delivery

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Rotate Webhook Secret

`POST /auditwolf/v1/webhooks/{endpointId}/rotate-secret`. Scope: `auditwolf:integrations`.

Replace the endpoint's signing secret

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Run Monitor

`POST /auditwolf/v1/monitors/{monitorId}/run`. Scope: `auditwolf:run`.

Queue an audit now with the monitor's scope frozen as the scheduler would freeze it

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Run Site Audit

`POST /auditwolf/v1/sites/{siteId}/audits`. Scope: `auditwolf:run`.

Trigger an asynchronous audit

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

```json
{
  "reason": "Scheduled n8n check",
  "trigger_type": "api"
}
```

## auditwolf / Test Export Destination

`POST /auditwolf/v1/export-destinations/{destinationId}/test`. Scope: `auditwolf:integrations`.

Upload and verify a connection-test object

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Test Webhook

`POST /auditwolf/v1/webhooks/{endpointId}/test`. Scope: `auditwolf:integrations`.

Send a signed endpoint.test event

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Uninstall Rule Pack

`DELETE /auditwolf/v1/rule-packs/installed/{installationId}`. Scope: `auditwolf:manage`.

Uninstall a pack

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Update Finding

`PATCH /auditwolf/v1/findings/{findingId}`. Scope: `auditwolf:manage`.

Assign, schedule, acknowledge, accept the risk, or close a finding

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

```json
{}
```

## auditwolf / Update Monitor

`PATCH /auditwolf/v1/monitors/{monitorId}`. Scope: `auditwolf:manage`.

Change a monitor's name, cadence, anchor, timezone, capture profile or change policy

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Update Rule

`PATCH /auditwolf/v1/rules/{lineageId}`. Scope: `auditwolf:manage`.

Revise a rule

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

```json
{}
```

## auditwolf / Update Webhook

`PATCH /auditwolf/v1/webhooks/{endpointId}`. Scope: `auditwolf:integrations`.

Enable or disable an endpoint, or change its subscribed events

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## auditwolf / Upgrade Rule Pack

`POST /auditwolf/v1/rule-packs/installed/{installationId}/upgrade`. Scope: `auditwolf:manage`.

Upgrade an installed pack, or change its values

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

```json
{}
```

## auditwolf / Usage

`GET /auditwolf/v1/usage`. Scope: `auditwolf:read`.

Credits, quota position, projection and hosted evidence

Full request contract: https://api.ironfang.uk/auditwolf/openapi.yaml

## financewolf / Delete Result

`DELETE /financewolf/v1/einvoices/results/{id}`. Scope: `financewolf:einvoices:write`.

Delete saved result bytes and findings

Full request contract: https://api.ironfang.uk/financewolf/openapi.yaml

## financewolf / Generate E-Invoice

`POST /financewolf/v1/einvoices/generate`. Scope: `financewolf:einvoices:write`.

Generate and validate one UBL e-invoice

Full request contract: https://api.ironfang.uk/financewolf/openapi.yaml

```json
{
  "input_schema_version": "financewolf/einvoice/generation-input/v1",
  "document_type": "invoice",
  "id": "EXAMPLE-INV-001",
  "issue_date": "2026-09-08",
  "due_date": "2026-10-08",
  "currency": "GBP",
  "buyer_reference": "BUYER-REF-001",
  "seller": {
    "name": "Example Supplier Ltd",
    "endpoint": {
      "scheme": "0088",
      "value": "7300010000001"
    },
    "legal_identifier": {
      "value": "12345678"
    },
    "vat_identifier": "GB123456789",
    "address": {
      "street": "1 Example Street",
      "city": "London",
      "postal_code": "SW1A 1AA",
      "country": "GB"
    }
  },
  "buyer": {
    "name": "Example Buyer Ltd",
    "endpoint": {
      "scheme": "0088",
      "value": "7300010000001"
    },
    "legal_identifier": {
      "value": "87654321"
    },
    "address": {
      "street": "2 Example Street",
      "city": "London",
      "postal_code": "SW1A 2AA",
      "country": "GB"
    }
  },
  "lines": [
    {
      "id": "1",
      "quantity": "2",
      "unit": "C62",
      "price_amount": "12.50",
      "item": {
        "name": "Example service"
      },
      "tax": {
        "category": "S",
        "rate": "20"
      }
    }
  ]
}
```

Query fields: `ruleset` (required), `profile` (required).

## financewolf / Get Result

`GET /financewolf/v1/einvoices/results/{id}`. Scope: `financewolf:einvoices:read`.

Read a saved validation or generation result

Full request contract: https://api.ironfang.uk/financewolf/openapi.yaml

## financewolf / Get Ruleset

`GET /financewolf/v1/einvoices/rulesets/{id}`. Scope: `financewolf:einvoices:rulesets:read`.

Fetch one ruleset by its immutable id

Full request contract: https://api.ironfang.uk/financewolf/openapi.yaml

## financewolf / List Results

`GET /financewolf/v1/einvoices/results`. Scope: `financewolf:einvoices:read`.

List saved validation results

Full request contract: https://api.ironfang.uk/financewolf/openapi.yaml

Query fields: `before`.

## financewolf / List Rulesets

`GET /financewolf/v1/einvoices/rulesets`. Scope: `financewolf:einvoices:rulesets:read`.

List rulesets available for selection and reproduction

Full request contract: https://api.ironfang.uk/financewolf/openapi.yaml

Query fields: `document_type`, `profile`, `state`.

## financewolf / Validate E-Invoice

`POST /financewolf/v1/einvoices/validate`. Scope: `financewolf:einvoices:write`.

Validate one e-invoice XML document

Full request contract: https://api.ironfang.uk/financewolf/openapi.yaml

Query fields: `ruleset`, `profile`, `document_type`.

## renderwolf / Cancel Job

`DELETE /renderwolf/v1/jobs/{id}`. Scope: `renderwolf:render`.

Cancel a job

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

## renderwolf / Capabilities

`GET /renderwolf/v1/capabilities`. Scope: `none`.

What Renderwolf does, is building and does not offer

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

## renderwolf / Create Destination

`POST /renderwolf/v1/destinations`. Scope: `renderwolf:destinations`.

Register a delivery destination

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

```json
{
  "name": "n8n delivery",
  "url": "https://example.com/webhook"
}
```

## renderwolf / Create Template

`POST /renderwolf/v1/templates`. Scope: `renderwolf:templates:write`.

Create a template

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

```json
{
  "name": "example-card",
  "html": "<h1>{{title}}</h1>",
  "width": 1200,
  "height": 630
}
```

## renderwolf / Delete Destination

`DELETE /renderwolf/v1/destinations/{id}`. Scope: `renderwolf:destinations`.

Remove a destination

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

## renderwolf / Delete Template

`DELETE /renderwolf/v1/templates/{id}`. Scope: `renderwolf:templates:write`.

Delete a template

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

## renderwolf / Download Job Result

`GET /renderwolf/v1/jobs/{id}/result`. Scope: `renderwolf:render`.

Collect a job's result

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

## renderwolf / Get Batch

`GET /renderwolf/v1/batches/{id}`. Scope: `renderwolf:render`.

Poll a batch

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

## renderwolf / Get Delivery

`GET /renderwolf/v1/deliveries/{id}`. Scope: `renderwolf:render`.

One delivery, with the body it posted

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

## renderwolf / Get Destination

`GET /renderwolf/v1/destinations/{id}`. Scope: `renderwolf:destinations`.

Get a destination

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

## renderwolf / Get Job

`GET /renderwolf/v1/jobs/{id}`. Scope: `renderwolf:render`.

Poll a job

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

## renderwolf / Get Template

`GET /renderwolf/v1/templates/{id}`. Scope: `renderwolf:templates:read`.

Fetch a template

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

## renderwolf / List Deliveries

`GET /renderwolf/v1/deliveries`. Scope: `renderwolf:render`.

List deliveries

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

Query fields: `destination`, `limit`, `cursor`.

## renderwolf / List Destinations

`GET /renderwolf/v1/destinations`. Scope: `renderwolf:destinations`.

List destinations

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

## renderwolf / List Jobs

`GET /renderwolf/v1/jobs`. Scope: `renderwolf:render`.

List jobs

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

Query fields: `status`, `limit`, `cursor`.

## renderwolf / List Requests

`GET /renderwolf/v1/requests`. Scope: `renderwolf:usage:read`.

Request history

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

Query fields: `since`, `until`, `outcome`, `kind`, `cache`, `key`, `error`, `id`, `limit`, `offset`.

## renderwolf / List Templates

`GET /renderwolf/v1/templates`. Scope: `renderwolf:templates:read`.

List templates

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

Query fields: `cursor`, `limit`, `summary`.

## renderwolf / QR Code

`POST /renderwolf/v1/qr`. Scope: `renderwolf:render`.

Render a QR code

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

```json
{
  "data": "https://example.com/menu"
}
```

## renderwolf / Redeliver Delivery

`POST /renderwolf/v1/deliveries/{id}/redeliver`. Scope: `renderwolf:destinations`.

Send a delivery again

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

## renderwolf / Site Preview

`POST /renderwolf/v1/site-preview`. Scope: `renderwolf:render`.

Render a scrolling website preview

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

```json
{
  "url": "https://example.com",
  "width": 672,
  "height": 494,
  "motion": "per_page"
}
```

## renderwolf / Submit Batch

`POST /renderwolf/v1/batches`. Scope: `renderwolf:render`.

Submit up to 100 jobs together

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

```json
{
  "items": [
    {
      "kind": "screenshot",
      "request": {
        "url": "https://example.com"
      }
    }
  ]
}
```

## renderwolf / Submit Job

`POST /renderwolf/v1/jobs`. Scope: `renderwolf:render`.

Submit a durable render job

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

```json
{
  "kind": "screenshot",
  "request": {
    "url": "https://example.com"
  }
}
```

## renderwolf / Test Destination

`POST /renderwolf/v1/destinations/{id}/test`. Scope: `renderwolf:destinations`.

Test a destination now

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

## renderwolf / Update Destination

`PATCH /renderwolf/v1/destinations/{id}`. Scope: `renderwolf:destinations`.

Rename or enable a destination

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

```json
{}
```

## renderwolf / Update Template

`PUT /renderwolf/v1/templates/{id}`. Scope: `renderwolf:templates:write`.

Replace a template

Full request contract: https://api.ironfang.uk/renderwolf/openapi.yaml

```json
{
  "name": "example-card",
  "html": "<h1>{{title}}</h1>",
  "width": 1200,
  "height": 630
}
```

## tools / Convert Image

`POST /tools/v1/convert`. Scope: `none`.

Convert Image

Public tool input: use the form options and binary image field, or the JSON example below.

```json
{
  "format": "png"
}
```

## tools / Create Favicon ZIP

`POST /tools/v1/favicon`. Scope: `none`.

Create Favicon ZIP

Public tool input: use the form options and binary image field, or the JSON example below.

```json
{
  "fit": "pad",
  "bg": "transparent"
}
```

## tools / Free Screenshot

`POST /tools/v1/screenshot`. Scope: `none`.

Free Screenshot

Public tool input: use the form options and binary image field, or the JSON example below.

```json
{
  "url": "https://example.com",
  "width": 1280
}
```

## tools / Generate QR Code

`POST /tools/v1/qr`. Scope: `none`.

Generate QR Code

Public tool input: use the form options and binary image field, or the JSON example below.

```json
{
  "data": "https://example.com"
}
```

## tools / Generate UUID

`POST /tools/v1/uuid`. Scope: `none`.

Generate UUID

Public tool input: use the form options and binary image field, or the JSON example below.

```json
{
  "version": "v7",
  "count": 1
}
```

## tools / Inspect UUID

`POST /tools/v1/uuid/inspect`. Scope: `none`.

Inspect UUID

Public tool input: use the form options and binary image field, or the JSON example below.

```json
{
  "value": "01900000-0000-7000-8000-000000000000"
}
```

## tools / Verify QR Code

`POST /tools/v1/qr/verify`. Scope: `none`.

Verify QR Code

Public tool input: use the form options and binary image field, or the JSON example below.

```json
{}
```
