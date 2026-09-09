# n8n re-review request — 0.3.1

Draft for the existing submission after npm publication is confirmed:

Please re-review `@ironfang/n8n-nodes-ironfang` version **0.3.1**
([source tag](https://github.com/ironfang-ltd/n8n-nodes-ironfang/tree/v0.3.1)).
It addresses all three findings:

1. `IronfangTrigger.node.ts` implements
   `webhookMethods.default.checkExists`, `create` and `delete`. Endpoints are
   explicitly registered through Auditwolf Create Webhooks or Renderwolf Create
   Destination. The hooks acknowledge external management; they do not claim to
   verify registration or delete customer-owned endpoints. Setup and testing
   remain documented in the node and README.
2. `Ironfang.node.ts` defines a separate operation parameter for each product,
   each with a literal string default. Existing defaults and operation IDs are
   preserved.
3. The shared implementation moved from `nodes/Ironfang/renderwolf.ts` to
   `lib/renderwolf.ts`. The two public node entry points retain their `.node.ts`
   names and existing registration paths.

All three suppression comments have been removed. `npm run check` runs lint
with `--no-inline-config`, TypeScript, 151 regression tests and package checks.
The release workflow also requires real n8n 2.38.1 action and signed webhook
checks before publishing through npm trusted publishing with provenance.
