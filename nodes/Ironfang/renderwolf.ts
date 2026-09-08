/* eslint n8n-nodes-base/node-filename-against-convention: "off" -- Shared legacy implementation; Ironfang.node.ts is the public entry point. */
import type {
    IExecuteFunctions,
    IDataObject,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { request, binaryOutput, apiError, errorOutput, identifier, renderwolfBase } from './transport';
import { credentialTest } from './credentialTest';

/**
 * Ironfang node. One node per vendor: pick a product with Resource, then an
 * operation within it. Renderwolf (https://ironfang.uk/renderwolf/docs) is the
 * first product; later ones are added as further resources rather than as
 * separate nodes.
 *
 * Render operations return binary data; sign and usage return JSON.
 */
export const renderwolf = {
    description: {
        displayName: 'Ironfang',
        name: 'ironfang',
        icon: { light: 'file:ironfang.svg', dark: 'file:ironfang.dark.svg' },
        usableAsTool: true,
        group: ['transform'],
        version: [1, 1.1],
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Rendering and developer APIs from Ironfang',
        defaults: { name: 'Ironfang' },
        inputs: [NodeConnectionTypes.Main],
        outputs: [NodeConnectionTypes.Main],
        credentials: [{ name: 'ironfangApi', required: true, testedBy: 'ironfangApiTest' }],
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                default: 'renderwolf',
                options: [
                    {
                        name: 'Renderwolf',
                        value: 'renderwolf',
                        description: 'Screenshots, PDFs and templated images',
                    },
                ],
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                default: 'screenshot',
                displayOptions: { show: { resource: ['renderwolf'] } },
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
                    },                    {
                        name: 'Video Clip',
                        value: 'video',
                        description: 'Render a short captioned MP4 from a background and caption cards',
                        action: 'Create a video clip',
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
                        displayName: 'Device',
                        name: 'device',
                        type: 'options',
                        default: 'desktop',
                        description:
                            'Applies a viewport, pixel density, mobile flag and user agent together. Width and height still win if you set them.',
                        options: [
                            { name: 'Desktop', value: 'desktop' },
                            { name: 'Mobile', value: 'mobile' },
                            { name: 'Tablet', value: 'tablet' },
                        ],
                    },
                    {
                        displayName: 'Format',
                        name: 'format',
                        type: 'options',
                        default: 'png',
                        options: [
                            { name: 'JPEG', value: 'jpeg' },
                            { name: 'PNG', value: 'png' },
                            { name: 'WebP', value: 'webp' },
                        ],
                    },
                    { displayName: 'Full Page', name: 'full_page', type: 'boolean', default: false },
                    { displayName: 'Height', name: 'height', type: 'number', default: 800 },
                    {
                        displayName: 'No Cache',
                        name: 'no_cache',
                        type: 'boolean',
                        default: false,
                        description:
                            'Whether to force a live capture instead of reusing an identical recent render. Use when the page must be captured exactly as it is right now, such as evidence or change detection. Counts against your quota.',
                    },
                    {
                        displayName: 'Quality',
                        name: 'quality',
                        type: 'number',
                        default: 85,
                        description: 'For JPEG and WebP. Ignored for PNG, which is lossless.',
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
                        displayName: 'No Cache',
                        name: 'no_cache',
                        type: 'boolean',
                        default: false,
                        description:
                            'Whether to force a live capture instead of reusing an identical recent render. Use when the page must be captured exactly as it is right now, such as evidence or change detection. Counts against your quota.',
                    },
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
                    { name: 'JPEG', value: 'jpeg' },
                    { name: 'PNG', value: 'png' },
                    { name: 'WebP', value: 'webp' },
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

            /* ------------------------- video clip ------------------------------- */
            {
                displayName: 'Size',
                name: 'clipSize',
                type: 'options',
                default: 'vertical',
                displayOptions: { show: { operation: ['video'] } },
                description:
                    'Credits scale with pixels and seconds, so the smaller sizes cost less per second',
                options: [
                    { name: '720p 1280x720', value: '720p' },
                    { name: 'Landscape 1920x1080', value: 'landscape' },
                    { name: 'Square 1080x1080', value: 'square' },
                    { name: 'Vertical 1080x1920', value: 'vertical' },
                ],
            },
            {
                displayName: 'Duration (Seconds)',
                name: 'clipDuration',
                type: 'number',
                default: 15,
                typeOptions: { minValue: 1, maxValue: 60 },
                displayOptions: { show: { operation: ['video'] } },
            },
            {
                displayName: 'Captions',
                name: 'captions',
                type: 'fixedCollection',
                typeOptions: { multipleValues: true },
                default: {},
                placeholder: 'Add caption',
                description: 'Cards that appear and disappear on a schedule',
                displayOptions: { show: { operation: ['video'] } },
                options: [
                    {
                        name: 'values',
                        displayName: 'Caption',
                        values: [
                            { displayName: 'Text', name: 'text', type: 'string', default: '' },
                            {
                                displayName: 'From (Seconds)',
                                name: 'from',
                                type: 'number',
                                default: 0,
                            },
                            { displayName: 'To (Seconds)', name: 'to', type: 'number', default: 3 },
                        ],
                    },
                ],
            },
            {
                displayName: 'Options',
                name: 'clipOptions',
                type: 'collection',
                placeholder: 'Add option',
                default: {},
                displayOptions: { show: { operation: ['video'] } },
                options: [
                    {
                        displayName: 'Audio URL',
                        name: 'audio',
                        type: 'string',
                        default: '',
                        description: 'An audio track, trimmed to the clip length',
                    },
                    {
                        displayName: 'Background URL',
                        name: 'background',
                        type: 'string',
                        default: '',
                        description: 'An image or video to fill the frame. Leave blank for a solid colour.',
                    },
                    {
                        displayName: 'Colour',
                        name: 'colour',
                        type: 'color',
                        default: '',
                        description: 'Used when there is no background URL',
                    },
                    {
                        displayName: 'Font Size',
                        name: 'font_size',
                        type: 'number',
                        default: 0,
                        description: 'Caption size. 0 scales it with the canvas.',
                    },
                    {
                        displayName: 'Watermark URL',
                        name: 'watermark',
                        type: 'string',
                        default: '',
                        description: 'A PNG of your own, placed bottom right',
                    },
                ],
            },

            /* ------------------------- binary output ---------------------------- */
            {
                displayName: 'Put Output in Field',
                name: 'binaryProperty',
                type: 'string',
                default: 'data',
                description: 'Name of the binary field to write the rendered file to',
                displayOptions: { show: { operation: ['screenshot', 'pdf', 'image', 'video'] } },
            },
        ],
    } as INodeTypeDescription,

    methods: { credentialTest: { ironfangApiTest: credentialTest } },

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
            const credentials = await this.getCredentials('ironfangApi');
            const baseUrl = renderwolfBase(credentials.baseUrl);

            try {
                const rawAdvanced = this.getNodeParameter('advancedRenderOptions', i, '{}');
                const advanced = (typeof rawAdvanced === 'string' ? JSON.parse(rawAdvanced) : rawAdvanced) as IDataObject;
                if (!advanced || typeof advanced !== 'object' || Array.isArray(advanced)) throw new NodeOperationError(this.getNode(), 'Advanced render options must be a JSON object', { itemIndex: i });
                if (['url', 'html', 'vars'].some(key => key in advanced)) throw new NodeOperationError(this.getNode(), 'Use the source and template variable fields outside advanced options', { itemIndex: i });
                if (operation === 'screenshot' || operation === 'pdf') {
                    const source = this.getNodeParameter('source', i) as string;
                    const body: IDataObject =
                        operation === 'screenshot'
                            ? { ...(this.getNodeParameter('screenshotOptions', i) as IDataObject) }
                            : { ...(this.getNodeParameter('pdfOptions', i) as IDataObject) };
                    Object.assign(body, advanced);
                    if (source === 'url') {
                        body.url = this.getNodeParameter('url', i);
                    } else {
                        body.html = this.getNodeParameter('html', i);
                    }
                    const data = await request.call(this, {
                            method: 'POST',
                            url: `${baseUrl}/v1/${operation}`,
                            body,
                            encoding: 'arraybuffer',
                        });
                    const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
                    const isPdf = operation === 'pdf';
                    const format = isPdf ? 'pdf' : ((body.format as string) || 'png');
                    const binary = await this.helpers.prepareBinaryData(
                        data.body as Buffer,
                        `render.${format}`,
                        isPdf ? 'application/pdf' : `image/${format}`,
                    );
                    out.push(binaryOutput(this, i, binaryProperty, binary, data, { operation }));
                } else if (operation === 'image') {
                    const selected = this.getNodeParameter('selectedTemplate', i, {}) as IDataObject;
                    const templateId = identifier(this, this.getNodeParameter('templateSelection', i, 'id') === 'list' ? selected.value : this.getNodeParameter('templateId', i), i);
                    const format = this.getNodeParameter('imageFormat', i) as string;
                    const vars = collectVars(this.getNodeParameter('vars', i) as IDataObject);
                    const data = await request.call(this, {
                            method: 'POST',
                            url: `${baseUrl}/v1/image/${templateId}`,
                            body: { ...advanced, vars, format },
                            encoding: 'arraybuffer',
                        });
                    const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
                    const binary = await this.helpers.prepareBinaryData(
                        data.body as Buffer,
                        `render.${format}`,
                        `image/${format}`,
                    );
                    out.push(binaryOutput(this, i, binaryProperty, binary, data, { operation, template: templateId }));
                } else if (operation === 'video') {
                    const captions = (
                        (this.getNodeParameter('captions', i) as IDataObject)
                            .values as IDataObject[] | undefined
                    )?.map((c) => ({
                        text: String(c.text),
                        from: Number(c.from),
                        to: Number(c.to),
                    }));
                    const body: IDataObject = {
                        ...(this.getNodeParameter('clipOptions', i) as IDataObject),
                        size: this.getNodeParameter('clipSize', i),
                        duration: this.getNodeParameter('clipDuration', i),
                    };
                    if (captions?.length) {
                        body.captions = captions;
                    }
                    // A blank font size means "scale it with the canvas", which
                    // is what the API does when the field is absent - sending 0
                    // would be a request for a zero-point font.
                    if (!body.font_size) {
                        delete body.font_size;
                    }
                    const data = await request.call(this, {
                            method: 'POST',
                            url: `${baseUrl}/v1/video`,
                            body,
                            encoding: 'arraybuffer',
                        });
                    const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
                    const binary = await this.helpers.prepareBinaryData(
                        data.body as Buffer,
                        'clip.mp4',
                        'video/mp4',
                    );
                    out.push(binaryOutput(this, i, binaryProperty, binary, data, { operation }));
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
                        body.template = identifier(this, this.getNodeParameter('signTemplateId', i), i);
                        body.vars = collectVars(this.getNodeParameter('signVars', i) as IDataObject);
                    }
                    const resp = await request.call(this, { method: 'POST', url: `${baseUrl}/v1/sign`, body, json: true });
                    out.push({ json: { ...(resp.body as IDataObject), _ironfang: resp.metadata }, pairedItem: { item: i } });
                } else if (operation === 'usage') {
                    const resp = await request.call(this, { method: 'GET', url: `${baseUrl}/v1/usage`, json: true });
                    out.push({ json: { ...(resp.body as IDataObject), _ironfang: resp.metadata }, pairedItem: { item: i } });
                } else {
                    throw new NodeOperationError(this.getNode(), `Unknown operation ${operation}`, {
                        itemIndex: i,
                    });
                }
            } catch (error) {
                if (this.continueOnFail()) {
                    out.push(errorOutput(this, error, i));
                    continue;
                }
                throw apiError(this, error, i);
            }
        }
        return [out];
    }
} satisfies INodeType;
