import type { INodeProperties } from 'n8n-workflow';
import { operations } from './catalog';
import type { Operation, QueryField } from './types';

const show = (op: Operation) => ({ show: { resource: [op.product], operation: [op.id] } });
function queryField(field: QueryField): INodeProperties {
    const base = { displayName: field.label, name: field.name, default: field.default ?? '', description: field.description?.slice(0, 500) || `API query parameter: ${field.name}` };
    if (field.enum?.length) return { ...base, type: 'options', default: field.default || field.enum[0], options: field.enum.map(value => ({ name: value, value })) };
    if (field.type === 'boolean') return { ...base, type: 'boolean', default: field.default === true };
    if (['integer', 'number'].includes(field.type)) return { ...base, type: 'number', default: typeof field.default === 'number' ? field.default : 0 };
    if (field.type === 'array') return { ...base, type: 'json', default: '[]', description: 'JSON array; each value is sent as a repeated query parameter' };
    return { ...base, type: 'string' };
}

export const productParameters: INodeProperties[] = [
    { displayName: 'Authentication', name: 'authentication', type: 'options', noDataExpression: true, default: 'apiKey', displayOptions: { show: { resource: ['financewolf'] } }, options: [{ name: 'API Key', value: 'apiKey' }, { name: 'Public (No Saved Results)', value: 'public' }], description: 'Public validation, generation and ruleset reads only. An invalid key never falls back to public access.' },
    { displayName: 'Public API Base URL', name: 'publicBaseUrl', type: 'string', default: 'https://api.ironfang.uk', displayOptions: { show: { resource: ['tools', 'financewolf'] } }, description: 'Used by public requests only; authenticated requests use the credential base URL' },
    { displayName: 'Public tools share per-address limits. Screenshot is limited to 20/hour/address and a shared daily ceiling. Renderwolf Screenshot is the account-based automation service.', name: 'toolsNotice', type: 'notice', default: '', displayOptions: { show: { resource: ['tools'] } } },
    ...operations.flatMap((op): INodeProperties[] => {
        const fields: INodeProperties[] = [{ displayName: `Permission: ${op.scope}. ${op.description}.`, name: 'operationNotice', type: 'notice', default: '', displayOptions: show(op) }];
        for (const match of op.path.matchAll(/\{(\w+)\}/g)) {
            const name = match[1];
            fields.push({ displayName: name === 'id' ? 'ID' : name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/Id$/, 'ID').replace(/^./, s => s.toUpperCase()), name, type: 'string', default: '', required: true, displayOptions: show(op), description: 'Identifier from an earlier operation or the Ironfang portal' });
        }
        if (op.id === 'createDestination') fields.push({ displayName: 'Destination Type', name: 'destinationType', type: 'options', default: 'webhook', displayOptions: show(op), options: [{ name: 'S3 Storage', value: 's3' }, { name: 'Webhook', value: 'webhook' }], description: 'S3 credentials are stored in an n8n credential, separate from the request body' });
        const required = op.query.filter(q => q.required);
        for (const q of required) fields.push({ ...queryField(q), required: true, displayOptions: show(op) });
        const optional = op.query.filter(q => !q.required && !['cursor', 'before', 'offset', 'limit'].includes(q.name));
        if (optional.length) fields.push({ displayName: 'Query Options', name: 'query', type: 'collection', placeholder: 'Add Query Option', default: {}, displayOptions: show(op), options: optional.map(queryField).sort((a, b) => a.displayName.localeCompare(b.displayName)) });
        if (op.input === 'json' || op.input === 'upload') fields.push({ displayName: op.input === 'upload' ? 'Form Options (JSON)' : 'Request Body (JSON)', name: 'requestBody', type: 'json', default: JSON.stringify(op.example ?? {}, null, 2), required: op.input === 'json', displayOptions: show(op), description: 'API request object. Replace example values. Nested objects and decimal strings are preserved. See the operation reference for the request schema.' });
        if (op.input === 'xml') fields.push(
            { displayName: 'XML Source', name: 'xmlSource', type: 'options', default: 'binary', displayOptions: show(op), options: [{ name: 'Binary Field', value: 'binary' }, { name: 'XML Text', value: 'text' }] },
            { displayName: 'XML', name: 'xml', type: 'string', typeOptions: { rows: 8 }, default: '', required: true, displayOptions: { show: { ...show(op).show, xmlSource: ['text'] } } },
        );
        if (['xml', 'upload'].includes(op.input)) fields.push({ displayName: 'Input Binary Field', name: 'inputBinaryField', type: 'string', default: 'data', displayOptions: op.input === 'xml' ? { show: { ...show(op).show, xmlSource: ['binary'] } } : show(op), description: 'Binary field containing the XML or image file; works with filesystem and external binary storage' });
        if (op.response !== 'json' || ['generateEInvoice', 'getValidationResult'].includes(op.id)) fields.push({ displayName: 'Output Binary Field', name: 'outputBinaryField', type: 'string', default: 'data', displayOptions: show(op), description: 'Field for the returned file. Site Preview uses this field for MP4 and adds a poster field.' });
        if (op.idempotency) fields.push({ displayName: 'Idempotency Key', name: 'idempotencyKey', type: 'string', default: '', required: ['submitJob', 'submitBatch'].includes(op.id), displayOptions: show(op), description: 'Stable reference for this business operation. Reuse it only when retrying identical input. Public Financewolf calls cannot use a key.' });
        if (op.pagination) fields.push(
            { displayName: 'Return All', name: 'returnAll', type: 'boolean', default: false, displayOptions: show(op), description: 'Whether to return all results or only up to a given limit' },
            { displayName: 'Limit', name: 'limit', type: 'number', default: 50, typeOptions: { minValue: 1 }, displayOptions: { show: { ...show(op).show, returnAll: [false] } }, description: 'Max number of results to return' },
            { displayName: op.pagination.parameter === 'offset' ? 'Start Offset' : 'Start Cursor', name: 'pageStart', type: op.pagination.parameter === 'offset' ? 'number' : 'string', default: op.pagination.parameter === 'offset' ? 0 : '', displayOptions: show(op) },
        );
        return fields;
    }),
];
