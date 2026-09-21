# Validation record - 9 September 2026

Maintenance release **0.2.3** was published from source/tag `0aa55d8` / `v0.2.3`.
GitHub Release succeeded and npm reports SLSA provenance. Tag `v0.2.2` remains
unpublished: the new runtime gate caught fixture file ownership differences on
GitHub runners. Verification was moved into the fixture container; no test was
removed or skipped to publish 0.2.3.

The 0.3.0 expansion adds 97 operations to the existing six and a signed event
trigger. Its catalogue follows Ironfang main `2230209`; authenticated customer
routes and scopes were compared with the endpoint handlers (all 97 additional routes matched), and all three
production OpenAPI YAML URLs returned HTTP 200. No live authenticated customer
operation or paid render was used for these connector checks.

The 0.3.1 submission patch passed `npm run check` (151 tests), both real n8n
2.38.1 Docker checks and `npm audit` (zero reported vulnerabilities) locally on
9 September. CI repeats the Node 22/24 and Docker gates before publication.
n8n automatically detects the new npm version for review; no manual re-review
request is required. The [feedback resolution record](n8n-re-review-0.3.1.md)
documents the three fixes. Review approval is still pending.

The 0.4.0 product-name and feature release follows Ironfang main `de1547b`
(21 September 2026). Its 156 catalogue operations were each matched to a route
registered by the API, and every permission shown was compared with the scope or
tenant permission that route's handler requires (no mismatches). Every JSON
request example was validated against its request schema; the only differences
are the destination `type` and S3 keys that the node supplies itself. The four
production OpenAPI YAML URLs and the documentation links the credentials point
to returned HTTP 200. The Download Job Result fault in 0.3.1 was established
from the API source (the signed location is issued under `/render`), not from a
live paid job. No live authenticated customer operation was used. `npm run check`
(220 tests), both real n8n 2.38.1 Docker checks and `npm audit` (zero reported
vulnerabilities) passed locally on 21 September.

The 0.4.1 patch answers an install failure reported from an n8n dashboard:
`Failed to save installed package`, `invalid input syntax for type integer:
"1.1"`. n8n before 2.33.0 stores an installed community node's newest version
in an integer column on PostgreSQL (n8n-io/n8n#34717 changed it), and 0.2.3 to
0.4.0 declared a fractional newest version. It was reproduced on n8n 2.32.4
with PostgreSQL 16 against the published 0.4.0 (the same error, with `"1.2"`),
and the 0.4.1 build then installed on the same n8n from a local registry, with
newest versions 2 and 1 recorded; it also installs on 2.38.1. The earlier
Docker checks could not see this: they load `dist/` as a custom extension on
SQLite, which records nothing. `scripts/check-postgres-install.sh` now runs in
CI before release. 224 tests and all three Docker checks passed locally on
21 September.

## Automated coverage

- 0.4.0 adds cases for routing saved `/renderwolf` and origin bases to the
  current prefixes, version-gated Audit paging, Rig sequence paging, the long
  Rig wait and evidence content negotiation, nested Finance S3 credentials,
  keyless report verification, Finance webhook signatures and the absence of
  launch-era names from scopes and labels. The Docker workflow adds three
  version 1.2 cases (Audit paging, Rig, report upload) and asserts that no
  request used a launch-era prefix from a credential saved as `/renderwolf`.

- Real n8n lint rules with inline configuration disabled, TypeScript and package
  entry-point/icon/version checks, including the helper's location outside `nodes/`.
- 151 unit/execution tests: every action dispatch, legacy formats, product
  routing, explicit public access, no anonymous fallback, traversal rejection,
  decimal strings, exact XML/hash checks, multipart files, pagination/repeated
  cursors, destination credentials, structured problems and item linking. The
  0.3.1 regression cases cover operation-selector defaults/options and lifecycle
  activation/deletion/reactivation with retained duplicate state.
- n8n 2.38.1 Docker workflow: seven original-operation/version cases plus 18
  expansion cases. It exercises authenticated and public helpers, XML/binary
  input, generation, multipart uploads/outputs, pagination, signed downloads,
  repeated query fields and filesystem binary storage with exact byte checks.
- A real active n8n webhook workflow: raw UTF-8 signature verification, stale and
  forged requests rejected before execution, duplicate delivery suppression,
  and duplicate state surviving a container restart.
- CI compiles/lints/tests with Node 22 and 24 and runs both Docker checks before
  publishing. npm audit is recorded separately at the release candidate check.

## Deliberate boundaries

Old workflow node identifiers and version 1/1.1 output shapes are preserved.
The runtime matrix does not certify older n8n host versions. API tenancy and
permissions are enforced by the product servers; tests here check that the
connector selects the right product and never supplies a tenant override or
attaches an API key to a public/signed download request.

Webhook endpoints are registered explicitly and their secrets are stored in
n8n credentials. The receiver does not own or delete those remote endpoints.
Version 0.3.1 implements `webhookMethods.default.checkExists`, `create` and
`delete` as acknowledgements of external management. Returning true from
`checkExists` skips automatic remote creation; it does not prove registration.
The hooks perform no management API calls and preserve duplicate state.
Each operation selector now has a literal default, and the shared Renderwolf
implementation lives in `lib/`. All three submission-related lint suppressions
have been removed. These checks do not establish manual Cloud verification.

S3 and webhook credential connection checks validate supplied fields/format.
Actual access/signing is checked through the product's destination/webhook test
action. These setup checks do not claim to authenticate to S3 or prove that a
signing secret belongs to an endpoint.

Trigger duplicate detection uses n8n workflow static data (seven days/10,000
IDs), not an atomic multi-worker database. Downstream consequential writes need
durable idempotency keyed by the signed event ID. The trigger validates the
signature before consulting duplicate state.

Manual n8n verification remains a separate external review. No submission or
review-status message was sent as part of this work.
