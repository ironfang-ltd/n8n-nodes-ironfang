import type { IBinaryData, IDataObject, IExecuteFunctions, IHttpRequestOptions, INodeExecutionData, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

export interface Response {
    body: unknown;
    metadata: IDataObject;
    headers: Record<string, string>;
    statusCode: number;
}

export function apiBase(value: unknown): string {
    const url = new URL(String(value || 'https://api.ironfang.uk/renderwolf'));
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
        throw new Error('Base URL must be an HTTP(S) URL without credentials, a query or fragment');
    }
    return url.toString().replace(/\/+$/, '');
}

export function identifier(context: IExecuteFunctions, value: unknown, itemIndex: number): string {
    const id = String(value);
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,199}$/.test(id)) {
        throw new NodeOperationError(context.getNode(), 'Enter an identifier, without path separators or query parameters', { itemIndex });
    }
    return encodeURIComponent(id);
}

export function responseMetadata(headers: Record<string, string>, statusCode: number): IDataObject {
    const result: IDataObject = { statusCode };
    if (headers['x-ironfang-request-id']) result.requestId = headers['x-ironfang-request-id'];
    if (headers['x-renderwolf-cache']) result.cacheStatus = headers['x-renderwolf-cache'];
    const credits = headers['x-renderwolf-credits'];
    if (credits !== undefined && credits !== '' && Number.isFinite(Number(credits))) result.creditsCharged = Number(credits);
    return result;
}

export async function request(this: IExecuteFunctions, options: IHttpRequestOptions): Promise<Response> {
    const response = await this.helpers.httpRequestWithAuthentication.call(this, 'ironfangApi', {
        timeout: options.encoding === 'arraybuffer' ? 120_000 : 30_000,
        ...options,
        returnFullResponse: true,
        disableFollowRedirect: true,
    }) as { body: unknown; headers: Record<string, string>; statusCode: number };
    const headers = Object.fromEntries(Object.entries(response.headers || {}).map(([key, value]) => [key.toLowerCase(), String(value)]));
    return { ...response, headers, metadata: responseMetadata(headers, response.statusCode) };
}

export function binaryOutput(context: IExecuteFunctions, item: number, field: string, binary: IBinaryData, response: Response, json: IDataObject): INodeExecutionData {
    if (!field.trim()) throw new NodeOperationError(context.getNode(), 'Output binary field must not be empty', { itemIndex: item });
    const byteLength = (response.body as Buffer).length;
    return {
        json: { ...json, bytes: context.getNode().typeVersion >= 1.1 ? byteLength : binary.fileSize, byteLength, _ironfang: response.metadata },
        binary: { [field]: binary },
        pairedItem: { item },
    };
}

function object(value: unknown): Record<string, unknown> {
    return value !== null && typeof value === 'object' ? value as Record<string, unknown> : {};
}

export function errorDetails(error: unknown, itemIndex: number): IDataObject {
    const err = object(error);
    // n8n's authenticated helper wraps transport failures in NodeApiError.
    const cause = object(err.cause);
    const response = object(err.response ?? cause.response);
    let body = response.data ?? response.body;
    if (Buffer.isBuffer(body)) body = body.length <= 65_536 ? body.toString('utf8') : undefined;
    if (typeof body === 'string' && body.length <= 65_536) {
        try { body = JSON.parse(body); } catch { body = undefined; }
    }
    const raw = object(body);
    const problem = Object.keys(object(raw.error)).length ? object(raw.error) : raw;
    const headers = object(response.headers);
    const details: IDataObject = { message: String(problem.message ?? problem.detail ?? (error instanceof Error ? error.message : 'Request failed')).slice(0, 2048), itemIndex };
    const code = problem.code;
    if (typeof code === 'string') details.code = code;
    const status = response.status ?? response.statusCode ?? err.statusCode ?? err.httpCode;
    if (Number.isFinite(Number(status))) details.statusCode = Number(status);
    if (typeof headers['x-ironfang-request-id'] === 'string') details.requestId = headers['x-ironfang-request-id'];
    const retry = headers['retry-after'];
    if (typeof retry === 'string' && /^\d+$/.test(retry)) details.retryAfterSeconds = Number(retry);
    return details;
}

export function apiError(context: IExecuteFunctions, error: unknown, itemIndex: number): NodeApiError | NodeOperationError {
    if (error instanceof NodeOperationError || error instanceof NodeApiError) {
        error.context.itemIndex = itemIndex;
        return error;
    }
    const details = errorDetails(error, itemIndex);
    const result = new NodeApiError(context.getNode(), error as JsonObject, { itemIndex, description: String(details.message) });
    result.context.ironfang = details;
    return result;
}

export function errorOutput(context: IExecuteFunctions, error: unknown, itemIndex: number): INodeExecutionData {
    const details = errorDetails(error, itemIndex);
    return {
        json: {
            error: context.getNode().typeVersion >= 1.1 ? details : (error instanceof Error ? error.message : String(error)),
            _ironfang: details,
        },
        pairedItem: { item: itemIndex },
    };
}
