import type {
    IExecuteFunctions,
    IDataObject,
    JsonObject,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

/**
 * Renderwolf node: screenshots, PDFs and templated images from the
 * Renderwolf rendering API (https://ironfang.uk/renderwolf/docs).
 * Render operations return binary data; sign/usage return JSON.
 */
export class Renderwolf implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Renderwolf',
        name: 'renderwolf',
        icon: { light: 'file:renderwolf.svg', dark: 'file:renderwolf.dark.svg' },
        usableAsTool: true,
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Render screenshots, PDFs and templated images',
        defaults: { name: 'Renderwolf' },
        inputs: [NodeConnectionTypes.Main],
        outputs: [NodeConnectionTypes.Main],
        credentials: [{ name: 'renderwolfApi', required: true }],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                default: 'screenshot',
                options: [
                    {
                        name: 'PDF',
                        value: 'pdf',
                        description: 'Print a URL or raw HTML to PDF',
                        action: 'Render a PDF',
                    },
                    {
                        name: 'Screenshot',
                        value: 'screenshot',
                        description: 'Capture a URL or raw HTML as an image',
                        action: 'Take a screenshot',
                    },
                    {
                        name: 'Signed URL',
                        value: 'sign',
                        description: 'Mint a stable render URL for &lt;img&gt; tags',
                        action: 'Create a signed URL',
                    },
                    {
                        name: 'Template Image',
                        value: 'image',
                        description: 'Render a stored template with variables (OG images)',
                        action: 'Render a template image',
                    },
                    {
                        name: 'Usage',
                        value: 'usage',
                        description: 'Current period usage against your plan cap',
                        action: 'Get usage',
                    },
                ],
            },

            /* ------------------------- source (screenshot/pdf) ------------------ */
            {
                displayName: 'Source',
                name: 'source',
                type: 'options',
                default: 'url',
                displayOptions: { show: { operation: ['screenshot', 'pdf'] } },
                options: [
                    { name: 'URL', value: 'url' },
                    { name: 'HTML', value: 'html' },
                ],
            },
            {
                displayName: 'URL',
                name: 'url',
                type: 'string',
                default: '',
                required: true,
                placeholder: 'https://example.com',
                displayOptions: { show: { operation: ['screenshot', 'pdf'], source: ['url'] } },
            },
            {
                displayName: 'HTML',
                name: 'html',
                type: 'string',
                typeOptions: { rows: 6 },
                default: '',
                required: true,
                displayOptions: { show: { operation: ['screenshot', 'pdf'], source: ['html'] } },
            },

            /* ------------------------- screenshot options ----------------------- */
            {
                displayName: 'Options',
                name: 'screenshotOptions',
                type: 'collection',
                placeholder: 'Add option',
                default: {},
                displayOptions: { show: { operation: ['screenshot'] } },
                options: [
                    { displayName: 'Dark Mode', name: 'dark_mode', type: 'boolean', default: false },
                    {
                        displayName: 'Delay (Ms)',
                        name: 'delay_ms',
                        type: 'number',
                        default: 0,
                        description: 'Extra settle time after load for late-painting pages',
                    },
                    {
                        displayName: 'Format',
                        name: 'format',
                        type: 'options',
                        default: 'png',
                        options: [
                            { name: 'PNG', value: 'png' },
                            { name: 'JPEG', value: 'jpeg' },
                        ],
                    },
                    { displayName: 'Full Page', name: 'full_page', type: 'boolean', default: false },
                    { displayName: 'Height', name: 'height', type: 'number', default: 800 },
                    {
                        displayName: 'JPEG Quality',
                        name: 'quality',
                        type: 'number',
                        default: 85,
                        typeOptions: { minValue: 1, maxValue: 100 },
                    },
                    {
                        displayName: 'Selector',
                        name: 'selector',
                        type: 'string',
                        default: '',
                        description: 'CSS selector - capture just that element',
                    },
                    { displayName: 'Width', name: 'width', type: 'number', default: 1280 },
                ],
            },

            /* ------------------------- pdf options ------------------------------ */
            {
                displayName: 'Options',
                name: 'pdfOptions',
                type: 'collection',
                placeholder: 'Add option',
                default: {},
                displayOptions: { show: { operation: ['pdf'] } },
                options: [
                    { displayName: 'Footer HTML', name: 'footer_html', type: 'string', default: '' },
                    { displayName: 'Header HTML', name: 'header_html', type: 'string', default: '' },
                    { displayName: 'Landscape', name: 'landscape', type: 'boolean', default: false },
                    {
                        displayName: 'Print Background',
                        name: 'print_background',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        displayName: 'Scale',
                        name: 'scale',
                        type: 'number',
                        default: 1,
                        typeOptions: { minValue: 0.1, maxValue: 2, numberPrecision: 2 },
                    },
                ],
            },

            /* ------------------------- template image --------------------------- */
            {
                displayName: 'Template ID',
                name: 'templateId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: { show: { operation: ['image'] } },
            },
            {
                displayName: 'Variables',
                name: 'vars',
                type: 'fixedCollection',
                typeOptions: { multipleValues: true },
                default: {},
                placeholder: 'Add variable',
                displayOptions: { show: { operation: ['image'] } },
                options: [
                    {
                        name: 'values',
                        displayName: 'Variable',
                        values: [
                            { displayName: 'Name', name: 'name', type: 'string', default: '' },
                            { displayName: 'Value', name: 'value', type: 'string', default: '' },
                        ],
                    },
                ],
            },
            {
                displayName: 'Format',
                name: 'imageFormat',
                type: 'options',
                default: 'png',
                displayOptions: { show: { operation: ['image'] } },
                options: [
                    { name: 'PNG', value: 'png' },
                    { name: 'JPEG', value: 'jpeg' },
                ],
            },

            /* ------------------------- signed url ------------------------------- */
            {
                displayName: 'Kind',
                name: 'signKind',
                type: 'options',
                default: 'screenshot',
                displayOptions: { show: { operation: ['sign'] } },
                options: [
                    { name: 'Screenshot', value: 'screenshot' },
                    { name: 'Template Image', value: 'image' },
                ],
            },
            {
                displayName: 'URL',
                name: 'signUrl',
                type: 'string',
                default: '',
                required: true,
                displayOptions: { show: { operation: ['sign'], signKind: ['screenshot'] } },
            },
            {
                displayName: 'Full Page',
                name: 'signFullPage',
                type: 'boolean',
                default: false,
                displayOptions: { show: { operation: ['sign'], signKind: ['screenshot'] } },
            },
            {
                displayName: 'Template ID',
                name: 'signTemplateId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: { show: { operation: ['sign'], signKind: ['image'] } },
            },
            {
                displayName: 'Variables',
                name: 'signVars',
                type: 'fixedCollection',
                typeOptions: { multipleValues: true },
                default: {},
                placeholder: 'Add variable',
                displayOptions: { show: { operation: ['sign'], signKind: ['image'] } },
                options: [
                    {
                        name: 'values',
                        displayName: 'Variable',
                        values: [
                            { displayName: 'Name', name: 'name', type: 'string', default: '' },
                            { displayName: 'Value', name: 'value', type: 'string', default: '' },
                        ],
                    },
                ],
            },
            {
                displayName: 'TTL (Hours)',
                name: 'ttlHours',
                type: 'number',
                default: 0,
                description: '0 means the URL never expires',
                displayOptions: { show: { operation: ['sign'] } },
            },

            /* ------------------------- binary output ---------------------------- */
            {
                displayName: 'Put Output in Field',
                name: 'binaryProperty',
                type: 'string',
                default: 'data',
                description: 'Name of the binary field to write the rendered file to',
                displayOptions: { show: { operation: ['screenshot', 'pdf', 'image'] } },
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const out: INodeExecutionData[] = [];

        const collectVars = (raw: IDataObject): Record<string, string> => {
            const vars: Record<string, string> = {};
            for (const v of (raw.values as IDataObject[] | undefined) ?? []) {
                vars[String(v.name)] = String(v.value);
            }
            return vars;
        };

        for (let i = 0; i < items.length; i++) {
            const operation = this.getNodeParameter('operation', i) as string;
            const credentials = await this.getCredentials('renderwolfApi');
            const baseUrl = String(credentials.baseUrl || 'https://api.ironfang.uk').replace(/\/+$/, '');

            try {
                if (operation === 'screenshot' || operation === 'pdf') {
                    const source = this.getNodeParameter('source', i) as string;
                    const body: IDataObject =
                        operation === 'screenshot'
                            ? { ...(this.getNodeParameter('screenshotOptions', i) as IDataObject) }
                            : { ...(this.getNodeParameter('pdfOptions', i) as IDataObject) };
                    if (source === 'url') {
                        body.url = this.getNodeParameter('url', i);
                    } else {
                        body.html = this.getNodeParameter('html', i);
                    }
                    const data = (await this.helpers.httpRequestWithAuthentication.call(
                        this,
                        'renderwolfApi',
                        {
                            method: 'POST',
                            url: `${baseUrl}/v1/${operation}`,
                            body,
                            encoding: 'arraybuffer',
                        },
                    )) as Buffer;
                    const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
                    const isPdf = operation === 'pdf';
                    const format = isPdf ? 'pdf' : ((body.format as string) || 'png');
                    const binary = await this.helpers.prepareBinaryData(
                        Buffer.from(data),
                        `render.${format}`,
                        isPdf ? 'application/pdf' : `image/${format}`,
                    );
                    out.push({
                        json: { operation, bytes: binary.fileSize },
                        binary: { [binaryProperty]: binary },
                        pairedItem: { item: i },
                    });
                } else if (operation === 'image') {
                    const templateId = this.getNodeParameter('templateId', i) as string;
                    const format = this.getNodeParameter('imageFormat', i) as string;
                    const vars = collectVars(this.getNodeParameter('vars', i) as IDataObject);
                    const data = (await this.helpers.httpRequestWithAuthentication.call(
                        this,
                        'renderwolfApi',
                        {
                            method: 'POST',
                            url: `${baseUrl}/v1/image/${templateId}`,
                            body: { vars, format },
                            encoding: 'arraybuffer',
                        },
                    )) as Buffer;
                    const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
                    const binary = await this.helpers.prepareBinaryData(
                        Buffer.from(data),
                        `render.${format}`,
                        `image/${format}`,
                    );
                    out.push({
                        json: { operation, template: templateId, bytes: binary.fileSize },
                        binary: { [binaryProperty]: binary },
                        pairedItem: { item: i },
                    });
                } else if (operation === 'sign') {
                    const kind = this.getNodeParameter('signKind', i) as string;
                    const body: IDataObject = {
                        kind,
                        ttl_hours: this.getNodeParameter('ttlHours', i),
                    };
                    if (kind === 'screenshot') {
                        body.url = this.getNodeParameter('signUrl', i);
                        body.full_page = this.getNodeParameter('signFullPage', i);
                    } else {
                        body.template = this.getNodeParameter('signTemplateId', i);
                        body.vars = collectVars(this.getNodeParameter('signVars', i) as IDataObject);
                    }
                    const resp = (await this.helpers.httpRequestWithAuthentication.call(
                        this,
                        'renderwolfApi',
                        { method: 'POST', url: `${baseUrl}/v1/sign`, body, json: true },
                    )) as IDataObject;
                    out.push({ json: resp, pairedItem: { item: i } });
                } else if (operation === 'usage') {
                    const resp = (await this.helpers.httpRequestWithAuthentication.call(
                        this,
                        'renderwolfApi',
                        { method: 'GET', url: `${baseUrl}/v1/usage`, json: true },
                    )) as IDataObject;
                    out.push({ json: resp, pairedItem: { item: i } });
                } else {
                    throw new NodeOperationError(this.getNode(), `Unknown operation ${operation}`, {
                        itemIndex: i,
                    });
                }
            } catch (error) {
                if (this.continueOnFail()) {
                    out.push({
                        json: { error: error instanceof Error ? error.message : String(error) },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw new NodeApiError(this.getNode(), error as JsonObject);
            }
        }
        return [out];
    }
}
