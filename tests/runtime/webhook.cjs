const fs = require('node:fs');
const http = require('node:http');
const { createHmac } = require('node:crypto');
const path = require('node:path');
const assert = require('node:assert/strict');
const secret = 'awsec_' + 'a'.repeat(43);
const mode = process.argv[2], dir = process.argv[3] || '/output';
if (mode === 'generate') {
 fs.writeFileSync(path.join(dir, 'credentials.json'), JSON.stringify([{ id: 'trigger-key', name: 'Fixture signing key', type: 'ironfangWebhookApi', data: { product: 'auditwolf', signingSecret: secret } }]));
 fs.writeFileSync(path.join(dir, 'workflow.json'), JSON.stringify({ id: 'trigger-fixture', name: 'Signed webhook fixture', active: false, settings: { executionOrder: 'v1' }, nodes: [
  { id: 'trigger', webhookId: 'runtime-trigger', name: 'Trigger', type: 'CUSTOM.ironfangTrigger', typeVersion: 1, position: [0, 0], parameters: {}, credentials: { ironfangWebhookApi: { id: 'trigger-key', name: 'Fixture signing key' } } },
  { id: 'sink', name: 'Record verified event', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [250, 0], parameters: { method: 'POST', url: 'http://fixture-api:8080/output', sendBody: true, specifyBody: 'json', jsonBody: '={{$json}}', options: {} } },
 ], connections: { Trigger: { main: [[{ node: 'Record verified event', type: 'main', index: 0 }]] } } }));
} else if (mode === 'server') {
 http.createServer(async (req, res) => { let body = ''; for await (const chunk of req) body += chunk; fs.appendFileSync(path.join(dir, 'events.jsonl'), body + '\n'); res.writeHead(200, { 'content-type': 'application/json' }); res.end('{}'); }).listen(8080, '0.0.0.0');
} else {
 const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
 const url = 'http://n8n-runtime:5678/webhook/runtime-trigger/events';
 const events = () => fs.existsSync(path.join(dir, 'events.jsonl')) ? fs.readFileSync(path.join(dir, 'events.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];
 async function send(id, kind = 'valid') {
  const timestamp = String(Math.floor(Date.now() / 1000) - (kind === 'stale' ? 400 : 0));
  const body = JSON.stringify({ id, type: 'audit.completed', data: { text: '£ café' } }, null, 2);
  const signature = 'v1=' + createHmac('sha256', secret).update(timestamp + '.').update(body).digest('hex');
  return fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'auditwolf-timestamp': timestamp, 'auditwolf-signature': kind === 'forged' ? 'v1=' + '0'.repeat(64) : signature, 'auditwolf-event-id': 'unsigned-header-' + Math.random() }, body: kind === 'mutated' ? body.replace('café', 'coffee') : body });
 }
 (async () => {
  let response;
  for (let i = 0; i < 60; i++) { try { response = await send('ready-probe', 'forged'); if (response.status === 401) break; } catch {} await delay(1000); }
  assert.equal(response?.status, 401, 'Trigger not ready: ' + (response ? await response.text() : 'no response'));
  if (mode === 'restart') {
   response = await send('event-1'); assert.equal(response.status, 200); assert.equal((await response.json()).duplicate, true); await delay(500); assert.equal(events().length, 2);
   console.log('Real n8n webhook: deduplication survives a container restart'); return;
  }
  response = await send('event-1'); assert.equal(response.status, 200);
  for (let i = 0; i < 50 && events().length !== 1; i++) await delay(100);
  assert.equal(events().length, 1); assert.equal(events()[0]._ironfang.verified, true); assert.equal(events()[0].data.text, '£ café');
  response = await send('event-1'); assert.equal((await response.json()).duplicate, true);
  for (const kind of ['forged', 'stale', 'mutated']) assert.equal((await send('event-2', kind)).status, 401);
  assert.equal((await send('event-2')).status, 200);
  for (let i = 0; i < 50 && events().length !== 2; i++) await delay(100);
  assert.equal(events().length, 2); await delay(500);
  console.log('Real n8n webhook: signatures, raw UTF-8 bytes, timestamps, forgery rejection and duplicate delivery passed');
 })().catch(error => { console.error(error); process.exit(1); });
}
