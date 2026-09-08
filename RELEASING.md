# Releasing

1. Update `package.json` and `package-lock.json` together, plus the changelog,
   README operations/scopes and examples. Preserve saved node identifiers and
   version old output contracts when changing their shape.
2. Run `npm ci --ignore-scripts`, `npm run check` and the documented n8n runtime
   action and webhook smoke tests. Run `npm audit` and review any development/runtime distinction.
3. Update the README release status and commit to main, tag that exact commit `v<package version>` and push the tag.
   The Release workflow requires the Node 22/24 checks, verifies the tag matches
   package/lockfile versions, then publishes through npm trusted publishing with
   provenance. Never overwrite a published version or move its tag.
4. Check the npm version, packaged README, entry points and provenance after
   publishing. Update the platform's channel/distribution record at the same time.

The trusted publisher is `ironfang-ltd/n8n-nodes-ironfang`, workflow `release.yml`.
No publishing token belongs in this repository. The old Renderwolf-named package
is already deprecated; leave its migration notice in place.

n8n manual verification is separate from npm publishing and automated scanning.
Record the reviewed package/version and actual result; a scanner pass alone
is not permission to advertise availability in the n8n Cloud picker.
