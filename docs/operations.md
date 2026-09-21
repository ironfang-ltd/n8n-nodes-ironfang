# Operation reference

Generated from Ironfang main `de1547b`. Runtime endpoint selection is fixed by this catalogue.
Complex request bodies use JSON so all supported schema fields remain available. Replace placeholders with your own values.

## audit / Archive Monitor

`POST /audit/v1/monitors/{monitorId}/archive`. Scope: `audit:manage`.

Archive a monitor (one-way; its audits and evidence remain)

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Bulk Update Findings

`POST /audit/v1/findings/bulk`. Scope: `audit:manage`.

Apply one decision to several findings

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

```json
{
  "ids": [
    ""
  ]
}
```

## audit / Compare Page Observation

`GET /audit/v1/page-observations/{observationId}/comparison`. Scope: `audit:read`.

What changed against the observation before it

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Create Export Destination

`POST /audit/v1/export-destinations`. Scope: `audit:integrations`.

Create an encrypted S3/S3-compatible destination

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

```json
{
  "region": "eu-west-2",
  "bucket": "your-bucket",
  "prefix": "auditwolf",
  "export_mode": "manual_only"
}
```

## audit / Create Monitor

`POST /audit/v1/sites/{siteId}/monitors`. Scope: `audit:manage`.

Create a monitor

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

```json
{
  "mode": "full_site"
}
```

## audit / Create Rule

`POST /audit/v1/sites/{siteId}/rules`. Scope: `audit:manage`.

Create a deterministic rule

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

```json
{
  "name": "",
  "rule_type": "",
  "configuration": {}
}
```

## audit / Create Site

`POST /audit/v1/sites`. Scope: `audit:manage`.

Create a site

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

```json
{
  "name": "Example site",
  "url": "https://example.com"
}
```

## audit / Create Webhook

`POST /audit/v1/webhooks`. Scope: `audit:integrations`.

Create a signed webhook endpoint

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

```json
{
  "url": "https://example.com/webhook",
  "events": [
    "audit.completed"
  ]
}
```

## audit / Delete Webhook

`DELETE /audit/v1/webhooks/{endpointId}`. Scope: `audit:integrations`.

Retire an endpoint (soft; its delivery history is kept)

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Disable Rule

`POST /audit/v1/rules/{lineageId}/disable`. Scope: `audit:manage`.

Disable a rule for future audits

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Download Artifact

`GET /audit/v1/artifacts/{artifactId}`. Scope: `audit:evidence`.

Stream an authenticated raw artifact

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Download Audit Evidence

`GET /audit/v1/audits/{auditId}/evidence`. Scope: `audit:evidence`.

Download the independently verifiable evidence ZIP

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Enable Rule

`POST /audit/v1/rules/{lineageId}/enable`. Scope: `audit:manage`.

Enable a rule for future audits

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Export Audit

`POST /audit/v1/audits/{auditId}/exports`. Scope: `audit:integrations`.

Queue a manual S3 export

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

```json
{
  "destination_id": ""
}
```

## audit / Get Audit

`GET /audit/v1/audits/{auditId}`. Scope: `audit:read`.

Get audit lifecycle, compliance and integrity state

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Get Finding

`GET /audit/v1/findings/{findingId}`. Scope: `audit:read`.

Get one finding

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Get Findings Summary

`GET /audit/v1/findings/summary`. Scope: `audit:read`.

The numbers at the top of the finding inbox

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Get Monitor

`GET /audit/v1/monitors/{monitorId}`. Scope: `audit:read`.

Get a monitor with its URL set

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Get Page Observation

`GET /audit/v1/page-observations/{observationId}`. Scope: `audit:read`.

One observation with its artifacts and rule results

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Get Rule

`GET /audit/v1/rules/{lineageId}`. Scope: `audit:read`.

Get the active revision of a rule

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Get Site

`GET /audit/v1/sites/{siteId}`. Scope: `audit:read`.

Get a site

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Get Webhook Delivery

`GET /audit/v1/webhook-deliveries/{deliveryId}`. Scope: `audit:integrations`.

Read one organisation-owned delivery

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Home

`GET /audit/v1/home`. Scope: `audit:read`.

Tenant-scoped setup facts and recent activity for the portal

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Install Rule Pack

`POST /audit/v1/sites/{siteId}/rule-packs`. Scope: `audit:manage`.

Install a rule pack

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

```json
{
  "pack_key": "",
  "variables": {}
}
```

## audit / List All Webhook Deliveries

`GET /audit/v1/webhook-deliveries`. Scope: `audit:integrations`.

Page organisation webhook deliveries

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

Query fields: `cursor`, `limit`, `status`, `destination`.

## audit / List Audit Pages

`GET /audit/v1/audits/{auditId}/pages`. Scope: `audit:read`.

Page observations of an audit

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

Query fields: `change`, `compliance`, `capture`, `q`, `limit`, `cursor`.

## audit / List Audits

`GET /audit/v1/audits`. Scope: `audit:read`.

List organisation audits

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

Query fields: `limit`, `cursor`, `status`, `site_id`.

## audit / List Events

`GET /audit/v1/events`. Scope: `audit:read`.

The organisation's recent product events, newest first

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / List Export Destinations

`GET /audit/v1/export-destinations`. Scope: `audit:integrations`.

List S3 destinations

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / List Exports

`GET /audit/v1/exports`. Scope: `audit:integrations`.

List export jobs

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

Query fields: `limit`, `cursor`, `audit_id`.

## audit / List Finding Events

`GET /audit/v1/findings/{findingId}/events`. Scope: `audit:read`.

The append-only history of a finding

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

Query fields: `limit`, `cursor`.

## audit / List Findings

`GET /audit/v1/findings`. Scope: `audit:read`.

The finding inbox

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

Query fields: `site_id`, `page_id`, `rule_id`, `state`, `severity`, `assignee`, `open_longer_than_days`, `limit`, `sort`, `cursor`, `offset`.

## audit / List Installed Rule Packs

`GET /audit/v1/sites/{siteId}/rule-packs`. Scope: `audit:read`.

Packs installed on this site

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / List Monitor Runs

`GET /audit/v1/monitors/{monitorId}/runs`. Scope: `audit:read`.

The monitor's audits, newest first

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

Query fields: `limit`, `cursor`, `status`.

## audit / List Monitors

`GET /audit/v1/monitors`. Scope: `audit:read`.

List monitors

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

Query fields: `limit`, `cursor`, `site_id`.

## audit / List Page Observations

`GET /audit/v1/pages/{pageId}/observations`. Scope: `audit:read`.

A page's observation history, newest first

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

Query fields: `limit`, `cursor`.

## audit / List Rule Packs

`GET /audit/v1/rule-packs`. Scope: `audit:read`.

The rule pack catalogue

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / List Rule Revisions

`GET /audit/v1/rules/{lineageId}/revisions`. Scope: `audit:read`.

List every revision of a rule, newest first

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

Query fields: `limit`, `cursor`.

## audit / List Site Audits

`GET /audit/v1/sites/{siteId}/audits`. Scope: `audit:read`.

List site audits

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

Query fields: `limit`, `cursor`, `status`.

## audit / List Site Monitors

`GET /audit/v1/sites/{siteId}/monitors`. Scope: `audit:read`.

List the site's monitors

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / List Site Rules

`GET /audit/v1/sites/{siteId}/rules`. Scope: `audit:read`.

List the site's versioned deterministic rules

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / List Sites

`GET /audit/v1/sites`. Scope: `audit:read`.

List sites

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / List Webhook Deliveries

`GET /audit/v1/webhooks/{endpointId}/deliveries`. Scope: `audit:integrations`.

List endpoint deliveries

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

Query fields: `cursor`, `limit`, `status`.

## audit / List Webhooks

`GET /audit/v1/webhooks`. Scope: `audit:integrations`.

List lifecycle webhook endpoints

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Pause Monitor

`POST /audit/v1/monitors/{monitorId}/pause`. Scope: `audit:manage`.

Pause scheduling

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Replace Monitor URLs

`PUT /audit/v1/monitors/{monitorId}/urls`. Scope: `audit:manage`.

Replace a url_set monitor's URL list

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

```json
{
  "urls": [
    "https://example.com"
  ]
}
```

## audit / Resume Monitor

`POST /audit/v1/monitors/{monitorId}/resume`. Scope: `audit:manage`.

Resume scheduling

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Retire Rule

`DELETE /audit/v1/rules/{lineageId}`. Scope: `audit:manage`.

Retire a rule

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Retry Webhook Delivery

`POST /audit/v1/webhooks/{endpointId}/deliveries/{deliveryId}/retry`. Scope: `audit:integrations`.

Re-queue a failed delivery

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Rotate Webhook Secret

`POST /audit/v1/webhooks/{endpointId}/rotate-secret`. Scope: `audit:integrations`.

Replace the endpoint's signing secret

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Run Monitor

`POST /audit/v1/monitors/{monitorId}/run`. Scope: `audit:run`.

Queue an audit now with the monitor's scope frozen as the scheduler would freeze it

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Run Site Audit

`POST /audit/v1/sites/{siteId}/audits`. Scope: `audit:run`.

Trigger an asynchronous audit

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

```json
{
  "reason": "Scheduled n8n check",
  "trigger_type": "api"
}
```

## audit / Test Export Destination

`POST /audit/v1/export-destinations/{destinationId}/test`. Scope: `audit:integrations`.

Upload and verify a connection-test object

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Test Webhook

`POST /audit/v1/webhooks/{endpointId}/test`. Scope: `audit:integrations`.

Send a signed endpoint.test event

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Uninstall Rule Pack

`DELETE /audit/v1/rule-packs/installed/{installationId}`. Scope: `audit:manage`.

Uninstall a pack

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## audit / Update Finding

`PATCH /audit/v1/findings/{findingId}`. Scope: `audit:manage`.

Assign, schedule, acknowledge, accept the risk, or close a finding

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

```json
{}
```

## audit / Update Monitor

`PATCH /audit/v1/monitors/{monitorId}`. Scope: `audit:manage`.

Change a monitor's name, cadence, anchor, timezone, capture profile or change policy

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

```json
{
  "mode": "full_site"
}
```

## audit / Update Rule

`PATCH /audit/v1/rules/{lineageId}`. Scope: `audit:manage`.

Revise a rule

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

```json
{}
```

## audit / Update Webhook

`PATCH /audit/v1/webhooks/{endpointId}`. Scope: `audit:integrations`.

Enable or disable an endpoint, or change its subscribed events

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

```json
{}
```

## audit / Upgrade Rule Pack

`POST /audit/v1/rule-packs/installed/{installationId}/upgrade`. Scope: `audit:manage`.

Upgrade an installed pack, or change its values

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

```json
{}
```

## audit / Usage

`GET /audit/v1/usage`. Scope: `audit:read`.

Credits, quota position, projection and hosted evidence

Full request contract: https://api.ironfang.uk/audit/openapi.yaml

## finance / Cancel Batch

`POST /finance/v1/einvoices/batches/{id}/cancel`. Scope: `finance:einvoices:write`.

Cancel an ordered batch

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

## finance / Cancel Job

`POST /finance/v1/einvoices/jobs/{id}/cancel`. Scope: `finance:einvoices:write`.

Cancel an async job

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

## finance / Create Batch

`POST /finance/v1/einvoices/batches`. Scope: `finance:einvoices:write`.

Create an ordered batch

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

```json
{
  "jobs": [
    {
      "operation": "validate",
      "document_base64": "PEludm9pY2UvPg==",
      "options": {
        "ruleset": "latest",
        "profile": "peppol-bis-billing-3"
      }
    }
  ]
}
```

## finance / Create Destination

`POST /finance/v1/einvoices/destinations`. Scope: `finance:einvoices:destinations:manage`.

Create a webhook or S3 destination

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

```json
{
  "name": "n8n delivery",
  "config": {
    "url": "https://example.com/webhook"
  }
}
```

## finance / Create Job

`POST /finance/v1/einvoices/jobs`. Scope: `finance:einvoices:write`.

Create an async job

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

```json
{
  "operation": "validate",
  "document_base64": "PEludm9pY2UvPg==",
  "options": {
    "ruleset": "latest",
    "profile": "peppol-bis-billing-3"
  }
}
```

## finance / Delete Destination

`DELETE /finance/v1/einvoices/destinations/{id}`. Scope: `finance:einvoices:destinations:manage`.

Retire a destination and erase its stored credentials

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

## finance / Delete Result

`DELETE /finance/v1/einvoices/results/{id}`. Scope: `finance:einvoices:write`.

Delete saved result bytes and findings

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

## finance / Download Signed Report

`POST /finance/v1/einvoices/reports`. Scope: `finance:einvoices:read`.

Download a signed report for a retained result

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

```json
{
  "operation_id": "00000000-0000-0000-0000-000000000000"
}
```

## finance / Generate E-Invoice

`POST /finance/v1/einvoices/generate`. Scope: `finance:einvoices:write`.

Generate and validate one UBL e-invoice

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

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

## finance / Get Batch

`GET /finance/v1/einvoices/batches/{id}`. Scope: `finance:einvoices:read`.

Get an ordered batch

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

## finance / Get Delivery

`GET /finance/v1/einvoices/deliveries/{id}`. Scope: `finance:einvoices:read`.

Read a delivery and its immutable attempt history

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

## finance / Get Destination

`GET /finance/v1/einvoices/destinations/{id}`. Scope: `finance:einvoices:destinations:manage`.

Read a destination without its credentials

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

## finance / Get Job

`GET /finance/v1/einvoices/jobs/{id}`. Scope: `finance:einvoices:read`.

Get an async job

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

## finance / Get Report Signing Keys

`GET /finance/v1/einvoices/reports/keys`. Scope: `none`.

Read Ironfang Finance report signing public keys

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

## finance / Get Result

`GET /finance/v1/einvoices/results/{id}`. Scope: `finance:einvoices:read`.

Read a saved validation or generation result

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

## finance / Get Ruleset

`GET /finance/v1/einvoices/rulesets/{id}`. Scope: `finance:einvoices:rulesets:read`.

Fetch one ruleset by its immutable id

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

## finance / List Batches

`GET /finance/v1/einvoices/batches`. Scope: `finance:einvoices:read`.

List batches

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

Query fields: `limit`, `cursor`.

## finance / List Deliveries

`GET /finance/v1/einvoices/deliveries`. Scope: `finance:einvoices:read`.

List delivery history with keyset pagination

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

Query fields: `destination`, `operation_id`, `status`, `cursor`, `limit`.

## finance / List Destinations

`GET /finance/v1/einvoices/destinations`. Scope: `finance:einvoices:destinations:manage`.

List active destination configurations

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

## finance / List Jobs

`GET /finance/v1/einvoices/jobs`. Scope: `finance:einvoices:read`.

List jobs

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

Query fields: `limit`, `cursor`, `status`.

## finance / List Results

`GET /finance/v1/einvoices/results`. Scope: `finance:einvoices:read`.

List saved validation and generation results

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

Query fields: `before`, `cursor`, `limit`, `kind`, `outcome`, `ruleset`, `q`, `operation_id`.

## finance / List Rulesets

`GET /finance/v1/einvoices/rulesets`. Scope: `finance:einvoices:rulesets:read`.

List rulesets available for selection and reproduction

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

Query fields: `document_type`, `profile`, `state`.

## finance / Render E-Invoice PDF

`POST /finance/v1/einvoices/render`. Scope: `finance:einvoices:read`.

Render a saved generation as a readable PDF

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

```json
{
  "operation_id": "00000000-0000-0000-0000-000000000000"
}
```

## finance / Retry Delivery

`POST /finance/v1/einvoices/deliveries/{id}/retry`. Scope: `finance:einvoices:destinations:manage`.

Retry failed delivery without rerunning validation

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

## finance / Update Destination

`PATCH /finance/v1/einvoices/destinations/{id}`. Scope: `finance:einvoices:destinations:manage`.

Enable, disable or rotate destination credentials

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

```json
{
  "enabled": true
}
```

## finance / Usage

`GET /finance/v1/einvoices/usage`. Scope: `finance:billing:manage`.

Reconcile Ironfang Finance document usage

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

Query fields: `start` (required), `end` (required).

## finance / Validate E-Invoice

`POST /finance/v1/einvoices/validate`. Scope: `finance:einvoices:write`.

Validate one e-invoice XML document

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

Query fields: `ruleset`, `profile`, `document_type`.

## finance / Verify Signed Report

`POST /finance/v1/einvoices/reports/verify`. Scope: `none`.

Verify report integrity without an account

Full request contract: https://api.ironfang.uk/finance/openapi.yaml

## render / Cancel Job

`DELETE /render/v1/jobs/{id}`. Scope: `render:render`.

Cancel a job

Full request contract: https://api.ironfang.uk/render/openapi.yaml

## render / Capabilities

`GET /render/v1/capabilities`. Scope: `none`.

What Ironfang Render does, is building and does not offer

Full request contract: https://api.ironfang.uk/render/openapi.yaml

## render / Create Destination

`POST /render/v1/destinations`. Scope: `render:destinations`.

Register a delivery destination

Full request contract: https://api.ironfang.uk/render/openapi.yaml

```json
{
  "name": "n8n delivery",
  "url": "https://example.com/webhook"
}
```

## render / Create Template

`POST /render/v1/templates`. Scope: `render:templates:write`.

Create a template

Full request contract: https://api.ironfang.uk/render/openapi.yaml

```json
{
  "name": "example-card",
  "html": "<h1>{{title}}</h1>",
  "width": 1200,
  "height": 630
}
```

## render / Delete Destination

`DELETE /render/v1/destinations/{id}`. Scope: `render:destinations`.

Remove a destination

Full request contract: https://api.ironfang.uk/render/openapi.yaml

## render / Delete Template

`DELETE /render/v1/templates/{id}`. Scope: `render:templates:write`.

Delete a template

Full request contract: https://api.ironfang.uk/render/openapi.yaml

## render / Download Job Result

`GET /render/v1/jobs/{id}/result`. Scope: `render:render`.

Collect a job's result

Full request contract: https://api.ironfang.uk/render/openapi.yaml

## render / Get Batch

`GET /render/v1/batches/{id}`. Scope: `render:render`.

Poll a batch

Full request contract: https://api.ironfang.uk/render/openapi.yaml

## render / Get Delivery

`GET /render/v1/deliveries/{id}`. Scope: `render:render`.

One delivery, with the body it posted

Full request contract: https://api.ironfang.uk/render/openapi.yaml

## render / Get Destination

`GET /render/v1/destinations/{id}`. Scope: `render:destinations`.

Get a destination

Full request contract: https://api.ironfang.uk/render/openapi.yaml

## render / Get Job

`GET /render/v1/jobs/{id}`. Scope: `render:render`.

Poll a job

Full request contract: https://api.ironfang.uk/render/openapi.yaml

## render / Get Template

`GET /render/v1/templates/{id}`. Scope: `render:templates:read`.

Fetch a template

Full request contract: https://api.ironfang.uk/render/openapi.yaml

## render / List Batches

`GET /render/v1/batches`. Scope: `render:render`.

List batches

Full request contract: https://api.ironfang.uk/render/openapi.yaml

Query fields: `limit`, `cursor`.

## render / List Deliveries

`GET /render/v1/deliveries`. Scope: `render:render`.

List deliveries

Full request contract: https://api.ironfang.uk/render/openapi.yaml

Query fields: `destination`, `job_id`, `status`, `limit`, `cursor`.

## render / List Destinations

`GET /render/v1/destinations`. Scope: `render:destinations`.

List destinations

Full request contract: https://api.ironfang.uk/render/openapi.yaml

## render / List Jobs

`GET /render/v1/jobs`. Scope: `render:render`.

List jobs

Full request contract: https://api.ironfang.uk/render/openapi.yaml

Query fields: `status`, `limit`, `cursor`.

## render / List Requests

`GET /render/v1/requests`. Scope: `render:usage:read`.

Request history

Full request contract: https://api.ironfang.uk/render/openapi.yaml

Query fields: `since`, `until`, `outcome`, `kind`, `cache`, `key`, `error`, `id`, `limit`, `offset`.

## render / List Templates

`GET /render/v1/templates`. Scope: `render:templates:read`.

List templates

Full request contract: https://api.ironfang.uk/render/openapi.yaml

Query fields: `cursor`, `limit`, `summary`.

## render / QR Code

`POST /render/v1/qr`. Scope: `render:render`.

Render a QR code

Full request contract: https://api.ironfang.uk/render/openapi.yaml

```json
{
  "data": "https://example.com/menu"
}
```

## render / Redeliver Delivery

`POST /render/v1/deliveries/{id}/redeliver`. Scope: `render:destinations`.

Send a delivery again

Full request contract: https://api.ironfang.uk/render/openapi.yaml

## render / Site Preview

`POST /render/v1/site-preview`. Scope: `render:render`.

Render a scrolling website preview

Full request contract: https://api.ironfang.uk/render/openapi.yaml

```json
{
  "url": "https://example.com",
  "width": 672,
  "height": 494,
  "motion": "per_page"
}
```

## render / Submit Batch

`POST /render/v1/batches`. Scope: `render:render`.

Submit up to 100 jobs together

Full request contract: https://api.ironfang.uk/render/openapi.yaml

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

## render / Submit Job

`POST /render/v1/jobs`. Scope: `render:render`.

Submit a durable render job

Full request contract: https://api.ironfang.uk/render/openapi.yaml

```json
{
  "kind": "screenshot",
  "request": {
    "url": "https://example.com"
  }
}
```

## render / Test Destination

`POST /render/v1/destinations/{id}/test`. Scope: `render:destinations`.

Test a destination now

Full request contract: https://api.ironfang.uk/render/openapi.yaml

## render / Update Destination

`PATCH /render/v1/destinations/{id}`. Scope: `render:destinations`.

Rename or enable a destination

Full request contract: https://api.ironfang.uk/render/openapi.yaml

```json
{}
```

## render / Update Template

`PUT /render/v1/templates/{id}`. Scope: `render:templates:write`.

Replace a template

Full request contract: https://api.ironfang.uk/render/openapi.yaml

```json
{
  "name": "example-card",
  "html": "<h1>{{title}}</h1>",
  "width": 1200,
  "height": 630
}
```

## rig / Add Fault

`POST /rig/v1/runs/{runId}/faults`. Scope: `rig:run`.

Arm a fault

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

```json
{
  "type": "delay",
  "resource": "order_webhook",
  "delay": "5s"
}
```

## rig / Cancel Run

`POST /rig/v1/runs/{runId}/cancel`. Scope: `rig:run`.

Cancel a run

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

```json
{
  "reason": "Cancelled from n8n"
}
```

## rig / Create Connector

`POST /rig/v1/runs/{runId}/connectors`. Scope: `rig:connector`.

Mint a connector and its bootstrap token

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

```json
{
  "name": "n8n"
}
```

## rig / Create Project

`POST /rig/v1/projects`. Scope: `rig:write`.

Create a project

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

```json
{
  "slug": "ironfang-platform",
  "name": "Ironfang Platform"
}
```

## rig / Create Resource

`POST /rig/v1/runs/{runId}/resources`. Scope: `rig:run`.

Allocate a resource

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

```json
{
  "name": "order_webhook",
  "type": "callback"
}
```

## rig / Create Run

`POST /rig/v1/suites/{suiteId}/runs`. Scope: `rig:run`.

Start a run

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

```json
{
  "ttl": "30m",
  "reason": "n8n workflow run"
}
```

## rig / Create Run Receipt

`POST /rig/v1/runs/{runId}/receipt`. Scope: `rig:read`.

A signed receipt for the run

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / Create Suite

`POST /rig/v1/suites`. Scope: `rig:write`.

Create a suite

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

```json
{
  "project_id": "",
  "slug": "signup",
  "name": "Signup flow",
  "definition": {
    "version": 1,
    "resources": {
      "customer_email": {
        "type": "email"
      },
      "stripe_callback": {
        "type": "callback",
        "connector": {
          "route": "stripe"
        }
      },
      "shipping_api": {
        "type": "mock_http"
      }
    }
  }
}
```

## rig / Download Event Payload

`GET /rig/v1/runs/{runId}/events/{eventId}/payload`. Scope: `rig:read`.

Download an event's payload

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / Export Run Evidence

`POST /rig/v1/runs/{runId}/evidence`. Scope: `rig:read`.

Export the run's evidence bundle

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / Finish Run

`POST /rig/v1/runs/{runId}/finish`. Scope: `rig:run`.

Finish a run

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

```json
{
  "outcome": "pass"
}
```

## rig / Get Environment

`GET /rig/v1/environment`. Scope: `rig:read`.

The hosts, bounds and retention a client builds against

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / Get Event

`GET /rig/v1/runs/{runId}/events/{eventId}`. Scope: `rig:read`.

Get an event

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / Get Project

`GET /rig/v1/projects/{projectId}`. Scope: `rig:read`.

Get a project

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / Get Run

`GET /rig/v1/runs/{runId}`. Scope: `rig:read`.

Get a run

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / Get Suite

`GET /rig/v1/suites/{suiteId}`. Scope: `rig:read`.

Get a suite

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / Hold Run

`PUT /rig/v1/runs/{runId}/hold`. Scope: `rig:run`.

Keep the run from retention until a date

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

```json
{
  "until": "2027-01-01T00:00:00Z"
}
```

## rig / Home

`GET /rig/v1/home`. Scope: `rig:read`.

Tenant-scoped setup facts and recent activity for the portal

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / List Connectors

`GET /rig/v1/runs/{runId}/connectors`. Scope: `rig:read`.

List a run's connectors

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / List Events

`GET /rig/v1/runs/{runId}/events`. Scope: `rig:read`.

Read the timeline

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

Query fields: `since`, `limit`.

## rig / List Evidence Signing Keys

`GET /rig/v1/evidence/keys`. Scope: `rig:read`.

The keys evidence is signed with

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / List Faults

`GET /rig/v1/runs/{runId}/faults`. Scope: `rig:read`.

List a run's faults

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / List Projects

`GET /rig/v1/projects`. Scope: `rig:read`.

List projects

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

Query fields: `cursor`, `limit`.

## rig / List Resources

`GET /rig/v1/runs/{runId}/resources`. Scope: `rig:read`.

List a run's resources

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / List Runs

`GET /rig/v1/runs`. Scope: `rig:read`.

List runs

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

Query fields: `project`, `suite`, `status`, `cursor`, `limit`.

## rig / List Suite Versions

`GET /rig/v1/suites/{suiteId}/versions`. Scope: `rig:read`.

List a suite's versions

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / List Suites

`GET /rig/v1/suites`. Scope: `rig:read`.

List suites

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

Query fields: `project`, `cursor`, `limit`.

## rig / Release Run Hold

`DELETE /rig/v1/runs/{runId}/hold`. Scope: `rig:run`.

Lift a retention hold

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / Remove Fault

`DELETE /rig/v1/runs/{runId}/faults/{faultId}`. Scope: `rig:run`.

Disarm a fault

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / Replay Callback

`POST /rig/v1/runs/{runId}/events/{eventId}/replay`. Scope: `rig:run`.

Replay a recorded callback

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

## rig / Revise Suite

`PUT /rig/v1/suites/{suiteId}`. Scope: `rig:write`.

Revise a suite

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

```json
{
  "definition": {
    "version": 1,
    "resources": {
      "customer_email": {
        "type": "email"
      },
      "stripe_callback": {
        "type": "callback",
        "connector": {
          "route": "stripe"
        }
      },
      "shipping_api": {
        "type": "mock_http"
      }
    }
  }
}
```

## rig / Set Mock Rules

`PUT /rig/v1/runs/{runId}/resources/{resourceId}/mock`. Scope: `rig:run`.

Replace a mock's rules

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

```json
{
  "rules": [
    {
      "match": {
        "method": "POST",
        "path": "/v1/ship/{id}"
      },
      "respond": {
        "status": 200,
        "json": {
          "ok": true
        }
      }
    }
  ]
}
```

## rig / Usage

`GET /rig/v1/usage`. Scope: `rig:read`.

Runs and events in a window

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

Query fields: `since`, `until`.

## rig / Wait For Event

`POST /rig/v1/runs/{runId}/wait`. Scope: `rig:read`.

Wait for an event

Full request contract: https://api.ironfang.uk/rig/openapi.yaml

```json
{
  "type": "callback.received",
  "resource": "order_webhook",
  "timeout": "30s"
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
