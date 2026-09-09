# Changelog

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
