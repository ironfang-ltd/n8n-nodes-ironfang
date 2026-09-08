const test = require('node:test');
const assert = require('node:assert/strict');
const { createHmac } = require('node:crypto');
const { verifyEvent, signingKey } = require('../dist/nodes/Ironfang/webhook.js');
const { IronfangTrigger } = require('../dist/nodes/Ironfang/IronfangTrigger.node.js');
const { Ironfang } = require('../dist/nodes/Ironfang/Ironfang.node.js');
const { NodeHelpers } = require('n8n-workflow');
const now = Date.now();
const secrets = { auditwolf: 'awsec_' + 'a'.repeat(43), renderwolf: '12'.repeat(32) };
function signed(product, event = { id: 'event-1', type: 'audit.completed', data: { title: '£ café' } }, time = now) {
 const raw = Buffer.from(JSON.stringify(event, null, 2));
 const timestamp = String(Math.floor(time / 1000));
 const signature = 'v1=' + createHmac('sha256', signingKey(product, secrets[product])).update(timestamp + '.').update(raw).digest('hex');
 return { raw, headers: { [`${product}-timestamp`]: timestamp, [`${product}-signature`]: signature, [`${product}-event-id`]: 'unsigned-id' } };
}
for (const product of ['auditwolf', 'renderwolf']) test(`verifies exact ${product} signed bytes and secret encoding`, () => {
 const { raw, headers } = signed(product); assert.equal(verifyEvent(raw, headers, product, secrets[product], now).id, 'event-1');
 assert.throws(() => verifyEvent(Buffer.from(raw.toString().replace('café', 'coffee')), headers, product, secrets[product], now), /signature/);
 assert.throws(() => verifyEvent(Buffer.from(JSON.stringify(JSON.parse(raw))), headers, product, secrets[product], now), /signature/);
});
test('rejects stale, future, malformed and oversized webhook requests', () => {
 for (const time of [now - 301000, now + 301000]) { const { raw, headers } = signed('auditwolf', undefined, time); assert.throws(() => verifyEvent(raw, headers, 'auditwolf', secrets.auditwolf, now), /timestamp/); }
 const { raw, headers } = signed('auditwolf');
 for (const signature of ['', 'v1=abcd', 'v2=' + 'a'.repeat(64)]) assert.throws(() => verifyEvent(raw, { ...headers, 'auditwolf-signature': signature }, 'auditwolf', secrets.auditwolf, now));
 assert.throws(() => verifyEvent(Buffer.alloc(65537), headers, 'auditwolf', secrets.auditwolf, now), /size/);
});
function triggerContext(request, state = {}) {
 const response = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
 return { state, response, getNode: () => ({ name: 'Trigger', type: 'ironfangTrigger', typeVersion: 1, position: [0, 0], parameters: {} }), getRequestObject: () => ({ rawBody: request.raw, headers: request.headers }), getResponseObject: () => response, getCredentials: async () => ({ product: 'auditwolf', signingSecret: secrets.auditwolf }), getWorkflowStaticData: () => state };
}
test('trigger rejects forgery before state changes and deduplicates signed IDs', async () => {
 const trigger = new IronfangTrigger(); const request = signed('auditwolf'); const ctx = triggerContext(request);
 const first = await trigger.webhook.call(ctx); assert.equal(first.workflowData[0][0].json._ironfang.verified, true);
 request.headers['auditwolf-event-id'] = 'another-unsigned-id'; const duplicate = await trigger.webhook.call(ctx); assert.equal(duplicate.webhookResponse.duplicate, true); assert.equal(duplicate.workflowData, undefined);
 const bad = triggerContext({ ...request, raw: Buffer.from('{}') }); const result = await trigger.webhook.call(bad); assert.equal(bad.response.code, 401); assert.equal(result.workflowData, undefined); assert.deepEqual(bad.state, {});
});
test('deduplication handles prototype-shaped IDs without prototype mutation', async () => {
 const ctx = triggerContext(signed('auditwolf', { id: '__proto__', type: 'audit.completed' })); const trigger = new IronfangTrigger(); await trigger.webhook.call(ctx); assert.equal(Object.getPrototypeOf(ctx.state.events), null); assert((await trigger.webhook.call(ctx)).webhookResponse.duplicate);
});
test('credential declarations are unique and visible for authenticated product operations', () => {
 const description = new Ironfang().description;
 assert.equal(new Set(description.credentials.map(c => c.name)).size, description.credentials.length);
 const credential = description.credentials.find(c => c.name === 'ironfangApi');
 for (const resource of ['renderwolf', 'financewolf', 'auditwolf']) assert(NodeHelpers.displayParameter({ resource, authentication: 'apiKey' }, credential, undefined, description));
 assert.equal(NodeHelpers.displayParameter({ resource: 'tools' }, credential, undefined, description), false);
 assert.equal(NodeHelpers.displayParameter({ resource: 'financewolf', authentication: 'public' }, credential, undefined, description), false);
});
