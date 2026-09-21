const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { Ironfang } = require('../dist/nodes/Ironfang/Ironfang.node.js');
const { operations } = require('../dist/nodes/Ironfang/catalog.js');
const { productBase, productPrefix } = require('../dist/nodes/Ironfang/transport.js');
const { credentialTest } = require('../dist/nodes/Ironfang/credentialTest.js');
const { searchTemplates } = require('../dist/nodes/Ironfang/templates.js');
const { NodeHelpers } = require('n8n-workflow');
const { payload } = require('./context.cjs');
const xml = Buffer.from('<?xml version="1.0"?><Invoice>£12.50</Invoice>');
const generation = { artifact: { data_base64: xml.toString('base64'), bytes: xml.length, sha256: createHash('sha256').update(xml).digest('hex'), content_type: 'application/xml' }, validation: { outcome: 'valid' } };
const preview = Buffer.concat([Buffer.from('--fixture\r\nContent-Disposition: form-data; name="poster"; filename="poster.jpg"\r\nContent-Type: image/jpeg\r\n\r\n'), payload, Buffer.from('\r\n--fixture\r\nContent-Disposition: form-data; name="video"; filename="preview.mp4"\r\nContent-Type: video/mp4\r\n\r\n'), payload, Buffer.from('\r\n--fixture--\r\n')]);
test('each product exposes one operation selector with its existing default and complete options', () => {
  const description = new Ironfang().description;
  const defaults = { auditwolf: 'archiveMonitorsByMonitorId', financewolf: 'deleteValidationResult', renderwolf: 'screenshot', rig: 'listRuns', tools: 'convertImage' };
  const legacy = ['pdf', 'screenshot', 'sign', 'image', 'usage', 'video'];
  for (const [resource, expectedDefault] of Object.entries(defaults)) {
    const selectors = description.properties.filter(p => p.name === 'operation' && NodeHelpers.displayParameter({ resource }, p, undefined, description));
    assert.equal(selectors.length, 1, resource);
    const [selector] = selectors;
    assert.equal(selector.default, expectedDefault, resource);
    const values = selector.options.map(o => o.value);
    assert(values.includes(selector.default), resource);
    const expected = operations.filter(o => o.product === resource).map(o => o.id).concat(resource === 'renderwolf' ? legacy : []);
    assert.deepEqual(values.toSorted(), expected.toSorted(), resource);
  }
});
function setup(params, reply, settings = {}) {
  const requests = [], credentials = [], binaryReads = [];
  const rows = Array.isArray(params) ? params : [params];
  const base = settings.base || 'https://api.ironfang.uk/renderwolf';
  const receive = async (authenticated, options) => { requests.push({ authenticated, ...options }); return reply ? reply(options, requests.length - 1, authenticated) : { statusCode: 200, headers: {}, body: {} }; };
  const context = {
    getInputData: () => rows.map(() => ({ json: {}, binary: { data: { data: 'filesystem-v2', id: 'stored-binary' } } })),
    getNodeParameter: (name, i, fallback) => rows[i][name] ?? fallback,
    getNode: () => ({ name: 'Ironfang', type: 'ironfang', typeVersion: settings.version ?? 1.1, parameters: {}, position: [0, 0] }),
    getCredentials: async name => { credentials.push(name); if (settings.noCredentials) throw new Error('Credentials must not be accessed'); return name === 'ironfangS3' ? { accessKey: 'fixture-access', secretKey: 'fixture-secret' } : { baseUrl: base, apiKey: 'fixture-key' }; },
    continueOnFail: () => !!settings.continueOnFail,
    helpers: {
      httpRequestWithAuthentication: async (_, options) => receive(true, options),
      httpRequest: async options => receive(false, options),
      getBinaryDataBuffer: async (item, field) => { binaryReads.push({ item, field }); return settings.input || payload; },
      prepareBinaryData: async (data, fileName, mimeType) => ({ data: data.toString('base64'), fileSize: data.length + ' B', fileName, mimeType }),
    },
  };
  return { context, requests, credentials, binaryReads, execute: async () => (await new Ironfang().execute.call(context))[0] };
}
function parameters(op) {
  const result = { resource: op.product, operation: op.id, requestBody: op.example || {}, xmlSource: 'text', xml: xml.toString(), idempotencyKey: 'fixture-operation-key', destinationType: 'webhook' };
  for (const id of op.path.matchAll(/\{(\w+)\}/g)) result[id[1]] = 'fixture-id';
  for (const query of op.query) if (query.required) result[query.name] = query.default || '2026-01-01T00:00:00Z';
  return result;
}
// Exercise every operation's dispatch and output family. Independent tests below
// assert the API-specific contracts and failure boundaries rather than just routes.
for (const op of operations) test(`${op.product}: ${op.name} executes`, async () => {
  const ctx = setup(parameters(op), (_, index) => {
    let body = op.pagination ? { [op.pagination.key]: [{ id: 'row' }] } : op.id === 'generateEInvoice' ? generation : {};
    const headers = { 'x-ironfang-request-id': 'fixture-request' }; let statusCode = 200;
    if (op.response === 'binary' || op.response === 'redirect') { body = payload; headers['content-type'] = 'image/png'; }
    if (op.response === 'redirect' && index === 0) { statusCode = 302; headers.location = '/render/v1/results/123/signature'; }
    if (op.response === 'multipart') { body = preview; headers['content-type'] = 'multipart/form-data; boundary=fixture'; }
    return { body, headers, statusCode };
  });
  const output = await ctx.execute(); assert.equal(output.length, 1); assert.deepEqual(output[0].pairedItem, { item: 0 });
  assert(ctx.requests[0].url.startsWith(`https://api.ironfang.uk/${productPrefix(op.product)}/v1/`)); assert.equal(ctx.requests[0].authenticated, op.product !== 'tools');
});
test('routing accepts origin, product and custom gateway prefix bases', () => {
  for (const base of ['https://api.ironfang.uk', 'https://api.ironfang.uk/renderwolf/', 'https://api.ironfang.uk/auditwolf', 'https://api.ironfang.uk/render', 'https://api.ironfang.uk/rig/']) assert.equal(productBase(base, 'financewolf'), 'https://api.ironfang.uk/finance');
  assert.equal(productBase('https://local.example/gateway/renderwolf', 'tools'), 'https://local.example/gateway/tools');
  for (const [product, prefix] of [['renderwolf', 'render'], ['auditwolf', 'audit'], ['financewolf', 'finance'], ['rig', 'rig'], ['tools', 'tools']]) assert.equal(productBase('https://api.ironfang.uk/renderwolf', product), 'https://api.ironfang.uk/' + prefix);
  assert.throws(() => productBase('https://user:secret@local.example', 'tools'));
});
test('public tools and explicit public Financewolf calls never read credentials', async () => {
  for (const p of [{ resource: 'tools', operation: 'generateUuid', requestBody: { version: 'v7', count: 1 } }, { resource: 'financewolf', operation: 'validateEInvoice', authentication: 'public', xmlSource: 'text', xml: '<Invoice/>' }]) {
    const ctx = setup(p, () => ({ body: { outcome: 'invalid' }, headers: {}, statusCode: 200 }), { noCredentials: true });
    const [item] = await ctx.execute(); assert.equal(item.json.outcome, 'invalid'); assert.equal(ctx.requests[0].authenticated, false); assert.deepEqual(ctx.credentials, []);
  }
});
test('public mode cannot access retained results or send idempotency keys', async () => {
  for (const params of [{ operation: 'listValidationResults' }, { operation: 'validateEInvoice', idempotencyKey: 'business-key' }]) {
    const ctx = setup({ resource: 'financewolf', authentication: 'public', ...params });
    await assert.rejects(ctx.execute()); assert.equal(ctx.requests.length, 0);
  }
});
test('invalid authenticated key never retries anonymously', async () => {
  const ctx = setup({ resource: 'financewolf', operation: 'listEInvoiceRulesets' }, () => { const e = new Error('HTTP 401'); e.response = { status: 401, data: { code: 'unauthenticated' } }; throw e; });
  await assert.rejects(ctx.execute()); assert.equal(ctx.requests.length, 1); assert(ctx.requests[0].authenticated);
});
test('identifiers cannot cross paths and operation names cannot cross products', async () => {
  for (const params of [{ resource: 'financewolf', operation: 'getValidationResult', id: '../rulesets' }, { resource: 'tools', operation: 'submitJob' }]) {
    const ctx = setup(params); await assert.rejects(ctx.execute()); assert.equal(ctx.requests.length, 0);
  }
});
test('XML binary input is sent byte for byte; invalid invoices remain ordinary results', async () => {
  const ctx = setup({ resource: 'financewolf', operation: 'validateEInvoice', inputBinaryField: 'invoice' }, () => ({ body: { outcome: 'invalid', findings: [{ rule_id: 'fixture-rule' }] }, headers: {}, statusCode: 200 }), { input: xml });
  const [out] = await ctx.execute(); assert.deepEqual(ctx.requests[0].body, xml); assert.equal(ctx.requests[0].headers['Content-Type'], 'application/xml'); assert.equal(out.json.outcome, 'invalid'); assert.deepEqual(ctx.binaryReads, [{ item: 0, field: 'invoice' }]);
});
test('generation preserves decimal strings and verifies the returned XML hash', async () => {
  const params = { resource: 'financewolf', operation: 'generateEInvoice', requestBody: '{"amount":"12.50"}', ruleset: 'latest', profile: 'peppol-bis-billing-3', outputBinaryField: 'invoice', idempotencyKey: 'business-invoice' };
  const ctx = setup(params, () => ({ body: generation, headers: {}, statusCode: 200 })); const [out] = await ctx.execute();
  assert.equal(ctx.requests[0].body.amount, '12.50'); assert.equal(ctx.requests[0].headers['Idempotency-Key'], 'business-invoice'); assert.deepEqual(Buffer.from(out.binary.invoice.data, 'base64'), xml);
  const bad = setup(params, () => ({ body: { ...generation, artifact: { ...generation.artifact, sha256: '0'.repeat(64) } }, headers: {}, statusCode: 200 })); await assert.rejects(bad.execute(), /SHA-256/);
});
test('Financewolf uses next_cursor as before and does not send unsupported limit', async () => {
  const ctx = setup({ resource: 'financewolf', operation: 'listValidationResults', returnAll: true }, (_, i) => ({ body: { results: [{ operation_id: 'operation-' + i }], ...(i === 0 ? { next_cursor: 'cursor-1' } : {}), retention_days: 30 }, headers: {}, statusCode: 200 }));
  const out = await ctx.execute(); assert.equal(out.length, 2); assert.equal(ctx.requests[1].qs.before, 'cursor-1'); assert(!('limit' in ctx.requests[0].qs)); assert.equal(out[0].json._ironfang.retentionDays, 30);
});
test('pagination refuses a repeated cursor and offset pagination advances by actual rows', async () => {
  const repeated = setup({ resource: 'renderwolf', operation: 'listTemplates', returnAll: true }, () => ({ body: { templates: [{ id: 'x' }], next_cursor: 'repeat' }, headers: {}, statusCode: 200 })); await assert.rejects(repeated.execute(), /repeated/); assert.equal(repeated.requests.length, 2);
  const ctx = setup({ resource: 'auditwolf', operation: 'listFindings', limit: 3, pageStart: 4 }, () => ({ body: { findings: [{ id: 'x' }, { id: 'y' }, { id: 'z' }] }, headers: {}, statusCode: 200 })); assert.equal((await ctx.execute()).length, 3); assert.deepEqual(ctx.requests[0].qs, { offset: 4, limit: 3 });
});
test('image multipart uses stored binary bytes and sends ordinary form fields', async () => {
  const ctx = setup({ resource: 'tools', operation: 'convertImage', requestBody: { format: 'jpeg', quality: 82 } }, () => ({ body: payload, headers: { 'content-type': 'image/jpeg' }, statusCode: 200 })); const [out] = await ctx.execute();
  const sent = ctx.requests[0]; assert(sent.body.includes(payload)); assert(sent.body.includes(Buffer.from('name="format"\r\n\r\njpeg'))); assert.match(sent.headers['Content-Type'], /boundary=ironfang-/); assert.equal(out.binary.data.fileName, 'result.jpg');
});
test('signed downloads validate destination and omit credentials on the second request', async () => {
  const params = { resource: 'renderwolf', operation: 'getJobResult', id: 'job-1' };
  for (const location of ['https://evil.example/render/v1/results/1/sig', '/warden/v1/me', '/render/v1/results/../../destinations']) {
    const ctx = setup(params, () => ({ statusCode: 302, headers: { location }, body: '' })); await assert.rejects(ctx.execute(), /outside/); assert.equal(ctx.requests.length, 1);
  }
  const ctx = setup(params, (_, i) => i === 0 ? { statusCode: 302, headers: { location: '/render/v1/results/123/sig' }, body: '' } : { statusCode: 200, headers: { 'content-type': 'image/png' }, body: payload }); await ctx.execute(); assert.equal(ctx.requests[1].authenticated, false); assert.equal(ctx.requests[1].headers, undefined);
});
test('site preview separates exact poster and video bytes', async () => {
  const ctx = setup({ resource: 'renderwolf', operation: 'createSitePreview', requestBody: { url: 'https://example.com' }, outputBinaryField: 'clip' }, () => ({ body: preview, headers: { 'content-type': 'multipart/form-data; boundary="fixture"' }, statusCode: 200 })); const [out] = await ctx.execute();
  assert.deepEqual(Buffer.from(out.binary.clip.data, 'base64'), payload); assert.deepEqual(Buffer.from(out.binary.poster.data, 'base64'), payload);
});
test('destination secrets come from the n8n credential and never from JSON fields', async () => {
  const p = { resource: 'auditwolf', operation: 'createExportDestinations', requestBody: { bucket: 'fixture', region: 'eu-west-2' } };
  const ctx = setup(p); await ctx.execute(); assert.equal(ctx.requests[0].body.secret_key, 'fixture-secret'); assert.deepEqual(ctx.credentials, ['ironfangApi', 'ironfangS3']);
  const bad = setup({ ...p, requestBody: { secret_key: 'do-not-store-in-workflow' } }); await assert.rejects(bad.execute(), /credential/); assert.equal(bad.requests.length, 0);
});
test('multi-item continued errors keep problem metadata and item linking', async () => {
  const p = { resource: 'financewolf', operation: 'getValidationResult', id: 'fixture' };
  const ctx = setup([p, p], (_, i) => { if (!i) { const e = new Error('HTTP 429'); e.response = { status: 429, headers: { 'retry-after': '60', 'x-ironfang-request-id': 'request-failed' }, data: { code: 'rate_limited', detail: 'Try later' } }; throw e; } return { body: { available: false }, headers: {}, statusCode: 200 }; }, { continueOnFail: true });
  const out = await ctx.execute(); assert.equal(out[0].json.error.code, 'rate_limited'); assert.equal(out[0].json.error.retryAfterSeconds, 60); assert.deepEqual(out[1].pairedItem, { item: 1 });
});
test('credential auto-discovery checks each product without durable calls', async () => {
  const requests = [];
  const result = await credentialTest.call({ helpers: { request: async options => { requests.push(options); return options.uri.includes('/audit/') ? { statusCode: 200, body: { sites: [] } } : { statusCode: 401 }; } } }, { data: { apiKey: 'fixture-key', baseUrl: 'https://api.ironfang.uk/renderwolf' } });
  assert.equal(result.status, 'OK'); assert.equal(requests.length, 3); assert(requests.every(r => r.method === 'GET')); assert.match(requests[1].uri, /\.uk\/finance\/v1\/einvoices\/results$/); assert.match(result.message, /Ironfang audit/);
});
test('template picker requests HTML-free pages and returns the next cursor', async () => {
  let options; const result = await searchTemplates.call({ getCredentials: async () => ({ baseUrl: 'https://api.ironfang.uk' }), helpers: { httpRequestWithAuthentication: async (_, request) => { options = request; return { templates: [{ id: 'template', name: 'Card' }], next_cursor: 'next' }; } } }, undefined, 'previous');
  assert.deepEqual(options.qs, { summary: true, limit: 50, cursor: 'previous' }); assert.equal(result.paginationToken, 'next'); assert.deepEqual(result.results, [{ name: 'Card', value: 'template' }]);
});
test('examples import inactive, contain no credentials, and reference existing nodes/actions', () => {
 const fs = require('node:fs');
 for (const file of fs.readdirSync('examples').filter(x => x.endsWith('.json'))) {
  const workflow = JSON.parse(fs.readFileSync('examples/' + file)); assert.equal(workflow.active, false, file);
  const names = new Set(workflow.nodes.map(node => node.name)); assert.equal(names.size, workflow.nodes.length);
  for (const node of workflow.nodes) { assert(!node.credentials, file); if (node.type.endsWith('.ironfang')) assert(operations.some(op => op.product === node.parameters.resource && op.id === node.parameters.operation) || ['image', 'screenshot', 'pdf', 'video', 'sign', 'usage'].includes(node.parameters.operation), file); }
  for (const [source, outputs] of Object.entries(workflow.connections)) { assert(names.has(source)); for (const edges of outputs.main) for (const edge of edges) assert(names.has(edge.node)); }
 }
});
test('legacy advanced render options remain body fields with unchanged binary output', async () => {
 const { run } = require('./context.cjs');
 const { ctx, output } = await run([{ operation: 'pdf', advancedRenderOptions: '{"paper_format":"a4","margin":{"top":0.4},"headers":{"X-Capture":"fixture"}}' }]);
 assert.equal(ctx.requests[0].body.paper_format, 'a4'); assert.equal(ctx.requests[0].body.margin.top, 0.4); assert.equal(ctx.requests[0].body.headers['X-Capture'], 'fixture'); assert.equal(ctx.requests[0].headers, undefined); assert(output[0].binary.data);
});
test('missing identifiers never become literal undefined or null path segments', () => {
 const { identifier } = require('../dist/nodes/Ironfang/transport.js');
 const context = setup({}).context;
 for (const value of [undefined, null, {}, false]) assert.throws(() => identifier(context, value, 0));
});
test('legacy Renderwolf operations accept credentials based at another product', async () => {
 const { run } = require('./context.cjs');
 for (const product of ['financewolf', 'auditwolf', 'tools']) {
  const { ctx } = await run([{}], { baseUrl: `https://gateway.example/prefix/${product}/` });
  assert.equal(ctx.requests[0].url, 'https://gateway.example/prefix/render/v1/screenshot');
 }
});
test('invalid array filters are rejected before they can silently broaden a query', async () => {
 for (const state of ['{"open":true}', '[1]', '"open"']) {
  const ctx = setup({ resource: 'auditwolf', operation: 'listFindings', query: { state } });
  await assert.rejects(ctx.execute(), /array of strings/); assert.equal(ctx.requests.length, 0);
 }
});
test('a network failure without an HTTP response does not invent a status code', () => {
 const { errorDetails } = require('../dist/nodes/Ironfang/transport.js');
 const error = new Error('Connection failed'); error.httpCode = null;
 assert.equal(Object.hasOwn(errorDetails(error, 0), 'statusCode'), false);
});
test('lists that gained paging keep their single response before node version 1.2', async () => {
 const p = { resource: 'auditwolf', operation: 'listAudits', returnAll: true };
 const reply = (_, i) => ({ body: { audits: [{ id: 'audit-' + i }], ...(i === 0 ? { next_cursor: 'next' } : {}) }, headers: {}, statusCode: 200 });
 const saved = setup(p, reply, { version: 1.1 }); const [envelope] = await saved.execute();
 assert.equal(saved.requests.length, 1); assert.equal(envelope.json.next_cursor, 'next'); assert(!('limit' in saved.requests[0].qs));
 const current = setup(p, reply, { version: 1.2 }); const rows = await current.execute();
 assert.deepEqual(rows.map(row => row.json.id), ['audit-0', 'audit-1']); assert.equal(current.requests[1].qs.cursor, 'next');
 const description = new Ironfang().description;
 const field = description.properties.find(f => f.name === 'returnAll' && f.displayOptions.show.operation.includes('listAudits'));
 assert.equal(NodeHelpers.displayParameter({ resource: 'auditwolf', operation: 'listAudits' }, field, { typeVersion: 1.1 }, description), false);
 assert.equal(NodeHelpers.displayParameter({ resource: 'auditwolf', operation: 'listAudits' }, field, { typeVersion: 1.2 }, description), true);
});
test('Rig timeline pages by sequence and stops on a short page', async () => {
 const ctx = setup({ resource: 'rig', operation: 'listEvents', runId: 'run-1', returnAll: true, pageStart: 4 }, (options, i) => ({ body: { events: Array.from({ length: i === 0 ? options.qs.limit : 2 }, (_, n) => ({ seq: n })), next_since: i === 0 ? 504 : 506 }, headers: {}, statusCode: 200 }));
 const out = await ctx.execute(); assert.equal(out.length, 502); assert.equal(ctx.requests.length, 2);
 assert.equal(ctx.requests[0].qs.since, 4); assert.equal(ctx.requests[1].qs.since, 504); assert.equal(out[0].json._ironfang.nextCursor, 504);
});
test('Rig waits outlast the API maximum and evidence asks for the bundle', async () => {
 const wait = setup({ resource: 'rig', operation: 'waitForEvent', runId: 'run-1', requestBody: { type: 'callback.received', timeout: '90s' } }, () => ({ body: { matched: false, next_since: 3 }, headers: {}, statusCode: 200 }));
 const [result] = await wait.execute(); assert.equal(result.json.matched, false); assert(wait.requests[0].timeout > 90_000);
 const evidence = setup({ resource: 'rig', operation: 'exportEvidence', runId: 'run-1' }, () => ({ body: payload, headers: { 'content-type': 'application/zip' }, statusCode: 200 }));
 const [bundle] = await evidence.execute(); assert.equal(evidence.requests[0].headers.Accept, 'application/zip'); assert.equal(bundle.binary.data.fileName, 'result.zip');
});
test('Finance S3 destinations take nested keys from the n8n credential only', async () => {
 const create = setup({ resource: 'financewolf', operation: 'createEinvoiceDestination', destinationType: 's3', requestBody: { name: 'archive', config: { bucket: 'fixture', region: 'eu-west-2' } } }); await create.execute();
 assert.equal(create.requests[0].body.type, 's3'); assert.deepEqual(create.requests[0].body.credentials, { access_key: 'fixture-access', secret_key: 'fixture-secret' }); assert(!('secret_key' in create.requests[0].body));
 const webhook = setup({ resource: 'financewolf', operation: 'createEinvoiceDestination', destinationType: 'webhook', requestBody: { name: 'hook', config: { url: 'https://example.com/webhook' } } }); await webhook.execute();
 assert.equal(webhook.requests[0].body.type, 'webhook'); assert(!('credentials' in webhook.requests[0].body)); assert.deepEqual(webhook.credentials, ['ironfangApi']);
 const rotate = setup({ resource: 'financewolf', operation: 'updateEinvoiceDestination', id: 'destination-1', destinationType: 's3', requestBody: {} }); await rotate.execute();
 assert.equal(rotate.requests[0].method, 'PATCH'); assert.equal(rotate.requests[0].body.credentials.secret_key, 'fixture-secret'); assert(!('type' in rotate.requests[0].body));
 const bad = setup({ resource: 'financewolf', operation: 'updateEinvoiceDestination', id: 'destination-1', requestBody: { credentials: { secret_key: 'do-not-store-in-workflow' } } }); await assert.rejects(bad.execute(), /credential/); assert.equal(bad.requests.length, 0);
});
test('signed report verification sends the ZIP bytes and needs no key', async () => {
 const ctx = setup({ resource: 'financewolf', operation: 'verifyEinvoiceReport', authentication: 'public', inputBinaryField: 'report' }, () => ({ body: { verified: true }, headers: {}, statusCode: 200 }), { noCredentials: true });
 const [out] = await ctx.execute(); assert.equal(out.json.verified, true); assert.deepEqual(ctx.requests[0].body, payload); assert.equal(ctx.requests[0].headers['Content-Type'], 'application/zip'); assert.equal(ctx.requests[0].url, 'https://api.ironfang.uk/finance/v1/einvoices/reports/verify'); assert.deepEqual(ctx.binaryReads, [{ item: 0, field: 'report' }]);
});
test('catalogue scopes and visible names use the current product names', () => {
 for (const op of operations) assert.doesNotMatch(op.scope, /wolf/, op.id);
 const description = new Ironfang().description;
 for (const option of description.properties.find(p => p.name === 'resource').options) assert.doesNotMatch(option.name, /wolf/i);
 assert.deepEqual(description.properties.find(p => p.name === 'resource').options.map(o => o.value), ['auditwolf', 'financewolf', 'tools', 'renderwolf', 'rig']);
 assert.deepEqual(description.version, [1, 1.1, 1.2, 2]);
});
test('each node\'s newest version is a whole number, which n8n before 2.33 requires to install on PostgreSQL', () => {
 const { IronfangTrigger } = require('../dist/nodes/Ironfang/IronfangTrigger.node.js');
 for (const node of [new Ironfang(), new IronfangTrigger()]) {
  // n8n records description.version.slice(-1)[0] for an installed community node.
  const recorded = Array.isArray(node.description.version) ? node.description.version.slice(-1)[0] : node.description.version;
  assert(Number.isInteger(recorded), `${node.description.name} records ${recorded}`);
  assert.equal(recorded, Math.max(...[node.description.version].flat()));
 }
});
test('version 2 pages the same lists as version 1.2', async () => {
 const ctx = setup({ resource: 'auditwolf', operation: 'listAudits', returnAll: true }, (_, i) => ({ body: { audits: [{ id: 'audit-' + i }], ...(i === 0 ? { next_cursor: 'next' } : {}) }, headers: {}, statusCode: 200 }), { version: 2 });
 assert.equal((await ctx.execute()).length, 2);
});
