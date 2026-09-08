const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { Ironfang } = require('../dist/nodes/Ironfang/Ironfang.node.js');
const { operations } = require('../dist/nodes/Ironfang/catalog.js');
const { productBase } = require('../dist/nodes/Ironfang/transport.js');
const { credentialTest } = require('../dist/nodes/Ironfang/credentialTest.js');
const { searchTemplates } = require('../dist/nodes/Ironfang/templates.js');
const { payload } = require('./context.cjs');
const xml = Buffer.from('<?xml version="1.0"?><Invoice>£12.50</Invoice>');
const generation = { artifact: { data_base64: xml.toString('base64'), bytes: xml.length, sha256: createHash('sha256').update(xml).digest('hex'), content_type: 'application/xml' }, validation: { outcome: 'valid' } };
const preview = Buffer.concat([Buffer.from('--fixture\r\nContent-Disposition: form-data; name="poster"; filename="poster.jpg"\r\nContent-Type: image/jpeg\r\n\r\n'), payload, Buffer.from('\r\n--fixture\r\nContent-Disposition: form-data; name="video"; filename="preview.mp4"\r\nContent-Type: video/mp4\r\n\r\n'), payload, Buffer.from('\r\n--fixture--\r\n')]);
function setup(params, reply, settings = {}) {
  const requests = [], credentials = [], binaryReads = [];
  const rows = Array.isArray(params) ? params : [params];
  const base = settings.base || 'https://api.ironfang.uk/renderwolf';
  const receive = async (authenticated, options) => { requests.push({ authenticated, ...options }); return reply ? reply(options, requests.length - 1, authenticated) : { statusCode: 200, headers: {}, body: {} }; };
  const context = {
    getInputData: () => rows.map(() => ({ json: {}, binary: { data: { data: 'filesystem-v2', id: 'stored-binary' } } })),
    getNodeParameter: (name, i, fallback) => rows[i][name] ?? fallback,
    getNode: () => ({ name: 'Ironfang', type: 'ironfang', typeVersion: 1.1, parameters: {}, position: [0, 0] }),
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
  for (const query of op.query) if (query.required) result[query.name] = query.default;
  return result;
}
// Exercise every operation's dispatch and output family. Independent tests below
// assert the API-specific contracts and failure boundaries rather than just routes.
for (const op of operations) test(`${op.product}: ${op.name} executes`, async () => {
  const ctx = setup(parameters(op), (_, index) => {
    let body = op.pagination ? { [op.pagination.key]: [{ id: 'row' }] } : op.id === 'generateEInvoice' ? generation : {};
    const headers = { 'x-ironfang-request-id': 'fixture-request' }; let statusCode = 200;
    if (op.response === 'binary' || op.response === 'redirect') { body = payload; headers['content-type'] = 'image/png'; }
    if (op.response === 'redirect' && index === 0) { statusCode = 302; headers.location = '/renderwolf/v1/results/123/signature'; }
    if (op.response === 'multipart') { body = preview; headers['content-type'] = 'multipart/form-data; boundary=fixture'; }
    return { body, headers, statusCode };
  });
  const output = await ctx.execute(); assert.equal(output.length, 1); assert.deepEqual(output[0].pairedItem, { item: 0 });
  assert(ctx.requests[0].url.includes(`/${op.product}/v1/`)); assert.equal(ctx.requests[0].authenticated, op.product !== 'tools');
});
test('routing accepts origin, product and custom gateway prefix bases', () => {
  for (const base of ['https://api.ironfang.uk', 'https://api.ironfang.uk/renderwolf/', 'https://api.ironfang.uk/auditwolf']) assert.equal(productBase(base, 'financewolf'), 'https://api.ironfang.uk/financewolf');
  assert.equal(productBase('https://local.example/gateway/renderwolf', 'tools'), 'https://local.example/gateway/tools');
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
  for (const location of ['https://evil.example/renderwolf/v1/results/1/sig', '/warden/v1/me', '/renderwolf/v1/results/../../destinations']) {
    const ctx = setup(params, () => ({ statusCode: 302, headers: { location }, body: '' })); await assert.rejects(ctx.execute(), /outside/); assert.equal(ctx.requests.length, 1);
  }
  const ctx = setup(params, (_, i) => i === 0 ? { statusCode: 302, headers: { location: '/renderwolf/v1/results/123/sig' }, body: '' } : { statusCode: 200, headers: { 'content-type': 'image/png' }, body: payload }); await ctx.execute(); assert.equal(ctx.requests[1].authenticated, false); assert.equal(ctx.requests[1].headers, undefined);
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
  const result = await credentialTest.call({ helpers: { request: async options => { requests.push(options); return options.uri.includes('/auditwolf/') ? { statusCode: 200, body: { sites: [] } } : { statusCode: 401 }; } } }, { data: { apiKey: 'fixture-key', baseUrl: 'https://api.ironfang.uk/renderwolf' } });
  assert.equal(result.status, 'OK'); assert.equal(requests.length, 3); assert(requests.every(r => r.method === 'GET')); assert.match(requests[1].uri, /financewolf\/v1\/einvoices\/results$/);
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
