# Changelog

## 0.4.1 — 2026-09-21

- Make the package installable on n8n releases before 2.33 that use PostgreSQL.
  Those releases store an installed community node's newest version in an
  integer column, and refuse 1.1 or 1.2 with `Failed to save installed package`
  (`invalid input syntax for type integer`). n8n 2.33 changed the column. The
  action node's newest version is now 2, which behaves as 1.2 does; versions 1,
  1.1 and 1.2 remain for saved workflows. A test keeps each node's newest
  version a whole number. 0.2.3 to 0.4.0 are affected.

## 0.4.0 — 2026-09-21

- Follow the product names: Ironfang Render, Finance and Audit. Requests go to
  the `/render`, `/finance` and `/audit` API prefixes, permissions are shown as
  `render:*`, `finance:*` and `audit:*`, and labels, messages and documentation
  links use the current names. Saved resource values (`renderwolf`,
  `financewolf`, `auditwolf`), operation IDs, defaults, webhook credential
  products and base URLs saved as an origin or `/renderwolf` are unchanged.
- Fix Download Job Result. The API now returns the signed download location
  under `/render`, which earlier versions refused as outside the expected
  endpoint because they called `/renderwolf`.
- Add Ironfang Rig: 34 actions for projects, suites, runs, resources, mock rules,
  faults, connectors, the event timeline, waits, callback replay, receipts,
  holds and evidence bundles. The credential test can check a Rig key.
- Add 21 Finance actions: async jobs and ordered batches, webhook and S3
  destinations, deliveries and retries, signed reports and keyless report
  verification, readable PDFs and usage. Ironfang Trigger verifies signed
  Finance deliveries.
- Add Audit List Monitors, List All Webhook Deliveries and Get Webhook Delivery,
  and Render List Batches. Create and Update Monitor, Replace Monitor URLs and
  Update Webhook now send the request body the API requires.
- Add node version 1.2: Audit lists released without paging return one item per
  row with Return All and Limit. Versions 1 and 1.1 keep the single response.
- Expose newer filters (audit status and site, export audit, delivery status,
  Finance result search) and document Render `css`, `script` and `actions`.
- Take operation permissions from the Finance contract and the Audit and Rig
  route tables, and label the operation reference with its source commit.

## 0.3.1 — 2026-09-09

- Implement all three trigger webhook lifecycle hooks while preserving external
  endpoint management, signing credentials and duplicate detection state.
- Give each product's operation selector a literal default, preserving the
  existing defaults, operation IDs and available actions.
- Move the shared Renderwolf implementation outside `nodes/` into `lib/` and
  verify that the compiled helper is included in the npm package.
- Remove the three scanner suppressions and run lint with inline configuration
  disabled. Add operation-selector and webhook reactivation regression coverage.

## 0.3.0 — 2026-09-09

- Add 97 actions across Renderwolf, Financewolf, Auditwolf and public tools,
  preserving the existing six operations and saved workflow identifiers.
- Add product-aware credential testing, explicit public access, exact XML
  artifact verification, filesystem binary uploads, pagination, validated signed
  downloads, multipart previews and separate S3 destination credentials.
- Add advanced render options and a paginated template picker.
- Add a signed-event trigger with timestamp checks and bounded duplicate state;
  endpoint registration and cleanup remain explicit customer actions.
- Add invoice, storage and bounded audit-polling examples, an operation reference,
  and execution/real-n8n checks covering the expanded flows and trigger restarts.
- Clean compiled output before building so renamed modules cannot enter a package.

## 0.2.3 — 2026-09-08

Includes the 0.2.2 maintenance changes below. The 0.2.2 tag was not published:
the runtime release gate found that GitHub runner and container user IDs differ.
Binary verification now runs inside the fixture container, and runtime failure
logs are retained in the CI summary. Main CI passed on Node 22 and 24, including
the real n8n workflow check, before this replacement maintenance tag.

## 0.2.2

- Publish the 250-credit Renderwolf free-plan correction, Video Clip, device
  presets and WebP support already present in source.
- Explain platform keys and operation scopes. Test authentication separately
  from usage permission; a scope refusal no longer labels a valid key invalid.
- New node version 1.1 returns numeric `bytes`, exact `byteLength`, request ID,
  charged credits, cache state and structured continued errors. Existing version
  1 nodes preserve their `bytes` string and `error` string, with additive metadata.
- Preserve binary data and item linking; include the failing item index, parse
  bounded API problems, bound requests and disable credential-bearing redirects.
- Validate template IDs, ship light/dark icons, refresh development dependencies
  and add real n8n lint, execution tests and release/package checks.
