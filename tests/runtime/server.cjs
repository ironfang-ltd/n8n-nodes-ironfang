const http = require('node:http');
const fs = require('node:fs');
const crypto = require('node:crypto');
const png = Buffer.from('89504e470d0a1a0a0000000049454e44', 'hex');
const xml = Buffer.from('<?xml version="1.0"?><Invoice>£12.50</Invoice>');
http.createServer(async (req, res) => {
 const chunks = []; for await (const chunk of req) chunks.push(chunk); const raw = Buffer.concat(chunks);
 const url = new URL(req.url, 'http://fixture-api');
 const publicRoute = url.pathname.startsWith('/tools/') || url.pathname.startsWith('/renderwolf/v1/results/');
 if ((publicRoute && req.headers.authorization) || (!publicRoute && req.headers.authorization !== 'Bearer synthetic-runtime-key')) { res.writeHead(401, { 'content-type': 'application/json' }); res.end(JSON.stringify({ error: { code: 'invalid_api_key' } })); return; }
 let body = {};
 if (req.headers['content-type']?.includes('application/json')) { try { body = JSON.parse(raw.toString() || '{}'); } catch { res.writeHead(400); res.end(); return; } }
 fs.appendFileSync('/output/requests.jsonl', JSON.stringify({ url: req.url, method: req.method, authenticated: !!req.headers.authorization, contentType: req.headers['content-type'], body, raw: raw.toString('base64') }) + '\n');
 const headers = { 'x-ironfang-request-id': 'runtime-request', 'x-renderwolf-credits': '1', 'x-renderwolf-cache': 'miss' };
 const json = (body, status = 200) => { res.writeHead(status, { ...headers, 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
 const binary = (body = png, type = 'image/png') => { res.writeHead(200, { ...headers, 'content-type': type }); res.end(body); };
 if (url.pathname === '/financewolf/v1/einvoices/generate') return json({ artifact: { data_base64: xml.toString('base64'), bytes: xml.length, sha256: crypto.createHash('sha256').update(xml).digest('hex'), content_type: 'application/xml' }, validation: { outcome: 'valid' } });
 if (url.pathname === '/financewolf/v1/einvoices/validate') return json({ outcome: 'invalid', findings: [] });
 if (url.pathname === '/financewolf/v1/einvoices/results') return json({ results: [{ operation_id: url.searchParams.has('before') ? 'second' : 'first' }], ...(!url.searchParams.has('before') ? { next_cursor: 'first' } : {}), retention_days: 30 });
 if (url.pathname === '/financewolf/v1/einvoices/rulesets') return json({ rulesets: [] });
 if (url.pathname === '/renderwolf/v1/jobs/fixture-job/result') { res.writeHead(302, { ...headers, location: '/renderwolf/v1/results/123/signature' }); res.end(); return; }
 if (url.pathname === '/renderwolf/v1/site-preview') return binary(Buffer.concat([Buffer.from('--fixture\r\nContent-Disposition: form-data; name="poster"; filename="poster.jpg"\r\nContent-Type: image/jpeg\r\n\r\n'), png, Buffer.from('\r\n--fixture\r\nContent-Disposition: form-data; name="video"; filename="preview.mp4"\r\nContent-Type: video/mp4\r\n\r\n'), png, Buffer.from('\r\n--fixture--\r\n')]), 'multipart/form-data; boundary=fixture');
 if (url.pathname === '/renderwolf/v1/jobs' || url.pathname === '/renderwolf/v1/batches') return json({ id: 'queued', status: 'queued' }, 202);
 if (url.pathname === '/renderwolf/v1/destinations') return json({ id: 'destination' }, 201);
 if (url.pathname === '/tools/v1/qr/verify') return json({ decoded: true, payload: 'https://example.com' });
 if (url.pathname === '/tools/v1/uuid') return json({ values: ['01900000-0000-7000-8000-000000000000'] });
 if (url.pathname === '/auditwolf/v1/findings') return json({ findings: [{ id: 'finding' }] });
 if (url.pathname === '/auditwolf/v1/sites') return json({ sites: [] });
 if (url.pathname === '/auditwolf/v1/sites/fixture-site/audits') return json({ id: 'audit', status: 'queued' }, 202);
 if (url.pathname.endsWith('/usage') || url.pathname.endsWith('/sign')) return json({ limit: 250, url: 'https://example.com/signed' });
 binary();
}).listen(8080, '0.0.0.0');
