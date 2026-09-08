import { createHash } from 'crypto';
import type { IDataObject, IExecuteFunctions, IHttpRequestOptions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { operations } from './catalog';
import type { Operation } from './types';
import { apiError, errorOutput, identifier, productBase, request, type Response } from './transport';
import { filename, multipartUpload, previewParts } from './files';

function jsonObject(value: unknown): IDataObject {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Request body must be a JSON object');
    return parsed as IDataObject;
}
function parameter(context: IExecuteFunctions, name: string, item: number, fallback: unknown = ''): unknown {
    return context.getNodeParameter(name, item, fallback);
}
async function outputFile(context: IExecuteFunctions, item: number, response: Response, field: string, fallback: string, json: IDataObject = {}): Promise<INodeExecutionData> {
    if (!field.trim()) throw new Error('Output binary field must not be empty');
    if (!Buffer.isBuffer(response.body)) throw new Error('Expected a binary API response');
    const binary = await context.helpers.prepareBinaryData(response.body, filename(response.headers, fallback === 'result.bin' ? 'result.' + ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'application/pdf': 'pdf', 'application/zip': 'zip', 'video/mp4': 'mp4' }[response.headers['content-type']?.split(';')[0]] || 'bin') : fallback), response.headers['content-type']?.split(';')[0] || 'application/octet-stream');
    return { json: { ...json, bytes: response.body.length, byteLength: response.body.length, _ironfang: response.metadata }, binary: { [field]: binary }, pairedItem: { item } };
}
async function jsonOutput(context: IExecuteFunctions, item: number, op: Operation, response: Response): Promise<INodeExecutionData> {
    const json: IDataObject = response.body && typeof response.body === 'object' && !Array.isArray(response.body) ? response.body as IDataObject : { result: response.body ?? null };
    if (op.id === 'generateEInvoice' && !json.artifact) throw new Error('Financewolf generation response is missing the validated XML artifact');
    if (op.product === 'financewolf' && ['generateEInvoice', 'getValidationResult'].includes(op.id) && json.artifact) {
        const artifact = json.artifact as IDataObject;
        if (typeof artifact.data_base64 !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(artifact.data_base64)) throw new Error('Financewolf returned an invalid XML artifact');
        const xml = Buffer.from(artifact.data_base64, 'base64');
        if (!xml.length || xml.length > 5_242_880 || xml.length !== artifact.bytes || createHash('sha256').update(xml).digest('hex') !== artifact.sha256) throw new Error('Financewolf XML artifact size or SHA-256 does not match its metadata');
        return outputFile(context, item, { ...response, body: xml, headers: { 'content-type': 'application/xml' } }, String(parameter(context, 'outputBinaryField', item, 'data')), 'invoice.xml', json);
    }
    return { json: { ...json, _ironfang: response.metadata }, pairedItem: { item } };
}
async function runOperation(context: IExecuteFunctions, item: number, op: Operation): Promise<INodeExecutionData[]> {
    const publicMode = op.product === 'tools' || (op.product === 'financewolf' && parameter(context, 'authentication', item, 'apiKey') === 'public');
    if (publicMode && !op.public) throw new Error('This operation requires an API key; public mode cannot access saved results');
    const base = publicMode ? parameter(context, 'publicBaseUrl', item, 'https://api.ironfang.uk') : (await context.getCredentials('ironfangApi')).baseUrl;
    const path = op.path.replace(/\{(\w+)\}/g, (_, name: string) => identifier(context, parameter(context, name, item), item));
    const url = productBase(base, op.product) + path;
    const qs: IDataObject = { ...parameter(context, 'query', item, {}) as IDataObject };
    const allowed = new Set(op.query.map(q => q.name));
    for (const key of Object.keys(qs)) {
        if (!allowed.has(key)) throw new Error(`Unknown query field: ${key}`);
        if (qs[key] === '' || qs[key] === undefined) delete qs[key];
    }
    for (const q of op.query) {
        if (q.required) {
            qs[q.name] = parameter(context, q.name, item) as string;
            if (qs[q.name] === '') throw new Error(`${q.label} is required`);
        }
        if (q.type === 'array' && qs[q.name] !== undefined) {
            if (typeof qs[q.name] === 'string') qs[q.name] = JSON.parse(qs[q.name] as string);
            if (!Array.isArray(qs[q.name]) || !(qs[q.name] as unknown[]).every(value => typeof value === 'string')) throw new Error(`${q.label} must be a JSON array of strings`);
        }
    }
    const headers: Record<string, string> = {};
    if (op.idempotency) {
        const key = String(parameter(context, 'idempotencyKey', item));
        if (key && publicMode) throw new Error('Public Financewolf calls cannot use an idempotency key');
        if (['submitJob', 'submitBatch'].includes(op.id) && !key.trim()) throw new Error('Use a stable idempotency key for job or batch submission');
        if (key) headers['Idempotency-Key'] = key;
    }
    let body: IHttpRequestOptions['body'];
    if (op.input === 'json') { body = jsonObject(parameter(context, 'requestBody', item, op.example ?? {})); headers['Content-Type'] = 'application/json'; }
    if (op.id === 'createDestination' || op.id === 'createExportDestinations') {
        const destination = body as IDataObject;
        if (['access_key', 'secret_key', 'session_token'].some(key => key in destination)) throw new Error('Store destination secrets in the Ironfang S3 Destination credential');
        const s3 = op.id === 'createExportDestinations' || parameter(context, 'destinationType', item, 'webhook') === 's3';
        if (op.product === 'renderwolf') destination.type = s3 ? 's3' : 'webhook';
        if (s3) {
            const credential = await context.getCredentials('ironfangS3');
            destination.access_key = String(credential.accessKey || ''); destination.secret_key = String(credential.secretKey || '');
            if (credential.sessionToken) destination.session_token = String(credential.sessionToken);
        }
    }
    if (op.input === 'xml') {
        body = parameter(context, 'xmlSource', item, 'binary') === 'text' ? Buffer.from(String(parameter(context, 'xml', item)), 'utf8') : await context.helpers.getBinaryDataBuffer(item, String(parameter(context, 'inputBinaryField', item, 'data')));
        if (!Buffer.isBuffer(body) || !body.length || body.length > 5_242_880) throw new Error('XML input must contain between 1 byte and 5 MiB');
        headers['Content-Type'] = 'application/xml';
    }
    if (op.input === 'upload') {
        const input = await context.helpers.getBinaryDataBuffer(item, String(parameter(context, 'inputBinaryField', item, 'data')));
        if (!input.length || input.length > 8 * 1024 * 1024 - 8192) throw new Error('Image input must fit within the 8 MiB multipart request limit');
        const multipart = multipartUpload(input, jsonObject(parameter(context, 'requestBody', item, op.example ?? {})));
        body = multipart.body; headers['Content-Type'] = multipart.contentType;
    }
    const options: IHttpRequestOptions = { method: op.method, url, qs, headers, body, arrayFormat: 'repeat', ...(op.response === 'json' ? { json: true } : { encoding: 'arraybuffer' }) };
    if (op.response === 'redirect') options.ignoreHttpStatusErrors = { ignore: true, except: Array.from({ length: 300 }, (_, i) => i + 300).filter(code => code !== 302) };
    let response: Response;
    if (op.pagination) return paginated(context, item, op, options, !publicMode);
    response = await request.call(context, options, !publicMode);
    if (op.response === 'redirect') {
        const location = response.headers.location;
        if (response.statusCode !== 302 || !location) throw new Error('Job result did not return a signed download location');
        const target = new URL(location, url);
        const baseURL = new URL(productBase(base, op.product));
        if (target.origin !== baseURL.origin || !target.pathname.startsWith(`${baseURL.pathname}/v1/results/`) || target.username || target.password || target.hash) throw new Error('Job result download location is outside the expected signed-result endpoint');
        response = await request.call(context, { method: 'GET', url: target.toString(), encoding: 'arraybuffer' }, false);
    }
    const field = String(parameter(context, 'outputBinaryField', item, 'data'));
    if (op.response === 'multipart' || (op.response === 'redirect' && response.headers['content-type']?.startsWith('multipart/'))) {
        if (field === 'poster') throw new Error('Use an output field other than poster for the preview video');
        const parts = previewParts(response.body as Buffer, response.headers['content-type']);
        const out = await outputFile(context, item, { ...response, body: parts.video, headers: { 'content-type': 'video/mp4' } }, field, 'preview.mp4');
        out.binary!.poster = await context.helpers.prepareBinaryData(parts.poster, 'poster.jpg', 'image/jpeg');
        out.json.posterBytes = parts.poster.length;
        return [out];
    }
    if (op.response !== 'json') return [await outputFile(context, item, response, field, 'result.bin')];
    return [await jsonOutput(context, item, op, response)];
}
async function paginated(context: IExecuteFunctions, item: number, op: Operation, options: IHttpRequestOptions, authenticated: boolean): Promise<INodeExecutionData[]> {
    const paging = op.pagination!;
    const all = parameter(context, 'returnAll', item, false) === true;
    const limit = all ? Infinity : Number(parameter(context, 'limit', item, 50));
    if (!all && (!Number.isSafeInteger(limit) || limit < 1)) throw new Error('Limit must be a positive integer');
    let cursor = parameter(context, 'pageStart', item, paging.parameter === 'offset' ? 0 : '') as string | number;
    if (paging.parameter === 'offset' && (!Number.isSafeInteger(Number(cursor)) || Number(cursor) < 0)) throw new Error('Start offset must be a non-negative integer');
    const output: INodeExecutionData[] = [];
    const seen = new Set<string>();
    for (let page = 0; page < 1000; page++) {
        const qs: IDataObject = { ...options.qs };
        if (cursor !== '') qs[paging.parameter] = cursor;
        if (paging.parameter !== 'before') qs.limit = Math.min(paging.size, limit - output.length);
        const response = await request.call(context, { ...options, qs }, authenticated);
        const data = jsonObject(response.body);
        const rows = data[paging.key];
        if (!Array.isArray(rows)) throw new Error(`API list response is missing ${paging.key}`);
        for (const row of rows.slice(0, limit - output.length)) output.push({ json: { ...row as IDataObject, _ironfang: { ...response.metadata, nextCursor: data.next_cursor ?? '', ...(data.retention_days ? { retentionDays: data.retention_days } : {}) } }, pairedItem: { item } });
        if (output.length >= limit || !rows.length) return output;
        if (paging.parameter === 'offset') {
            if (rows.length < Number(qs.limit)) return output;
            cursor = Number(cursor) + rows.length;
        } else {
            const next = data.next_cursor;
            if (!next) return output;
            if (typeof next !== 'string' || next === cursor || seen.has(next)) throw new Error('API repeated a pagination cursor');
            seen.add(next); cursor = next;
        }
    }
    throw new Error('Pagination exceeded 1,000 pages; narrow the query or continue from a cursor');
}
export async function executeProducts(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const output: INodeExecutionData[] = [];
    for (let item = 0; item < this.getInputData().length; item++) {
        try {
            const product = parameter(this, 'resource', item);
            const id = parameter(this, 'operation', item);
            const op = operations.find(candidate => candidate.product === product && candidate.id === id);
            if (!op) throw new NodeOperationError(this.getNode(), 'Unknown product operation', { itemIndex: item });
            output.push(...await runOperation(this, item, op));
        } catch (error) {
            if (!this.continueOnFail()) throw apiError(this, error, item);
            output.push(errorOutput(this, error, item));
        }
    }
    return [output];
}
