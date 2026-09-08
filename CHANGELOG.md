# Changelog

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
