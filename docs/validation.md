# Validation record - 8 September 2026

The published maintenance release is **0.2.3**, source/tag `0aa55d8` / `v0.2.3`.
GitHub Release succeeded and npm reports SLSA provenance. Tag `v0.2.2` remains
unpublished: the new runtime gate caught fixture file ownership differences on
GitHub runners. Verification was moved into the fixture container; no test was
removed or skipped to publish 0.2.3.

The 0.3.0 expansion adds 97 operations to the existing six and a signed event
trigger. Its catalogue follows Ironfang main `2230209`; authenticated customer
routes and scopes were compared with the endpoint handlers (all 97 additional routes matched), and all three
production OpenAPI YAML URLs returned HTTP 200. No live authenticated customer
operation or paid render was used for these connector checks.

## Automated coverage

- Real n8n lint rules, TypeScript and package entry-point/icon/version checks.
- 149 unit/execution tests: every action dispatch, legacy formats, product
  routing, explicit public access, no anonymous fallback, traversal rejection,
  decimal strings, exact XML/hash checks, multipart files, pagination/repeated
  cursors, destination credentials, structured problems and item linking.
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
There is a documented, targeted exception to the lint rule requiring automatic
webhook registration/deletion. Other targeted exceptions cover the shared
legacy implementation filename and a catalogue-selected operation default that
the static rule cannot infer. These are not claims of manual Cloud verification.

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
