# Releasing

Normal releases are automatic: push a tag like `v0.2.1` and the Release
workflow publishes to npm through trusted publishing, with provenance
attached. Provenance is what n8n's verified-community-node scanner looks for.

## First publish of a new package name

npm will only let you configure a trusted publisher on a package that already
exists, so the very first publish of a new name has to use a token. That
applies to `@ironfang/n8n-nodes-ironfang`, which is a new package rather than a
rename of the old one.

1. Build and publish once from a machine you're logged into:

   ```
   npm run build
   npm publish --access public
   ```

   This puts 0.2.0 on npm without provenance, which is expected.

2. On npmjs.com, open the package settings and add a trusted publisher:

   - Repository: `ironfang-ltd/n8n-nodes-ironfang`
   - Workflow: `release.yml`

3. Bump to 0.2.1, tag it and push the tag. That release goes out through the
   workflow and carries provenance.

4. Point the old package at the new one:

   ```
   npm deprecate @ironfang/n8n-nodes-renderwolf "Renamed to @ironfang/n8n-nodes-ironfang"
   ```

Submit for verification only after a provenance-backed release exists; a
token publish alone won't pass the scanner.
