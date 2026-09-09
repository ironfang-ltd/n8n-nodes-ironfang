import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, INodeProperties } from 'n8n-workflow';
import { renderwolf } from '../../lib/renderwolf';
import { operations } from './catalog';
import { productParameters } from './parameters';
import { executeProducts } from './execute';
import { renderOptions } from './renderOptions';
import { searchTemplates } from './templates';
import { destinationCredentialTest } from './destinationCredentialTest';
import type { Product } from './types';

const legacy = renderwolf;
const legacyOperations = (legacy.description.properties[1].options ?? []) as Array<{ name: string; value: string; description: string; action: string }>;
function operationOptions(product: Product) {
    return [...(product === 'renderwolf' ? legacyOperations : []), ...operations.filter(op => op.product === product).map(op => ({ name: op.name, value: op.id, description: op.description, action: op.description }))].sort((a, b) => a.name.localeCompare(b.name));
}
const operationParameters: INodeProperties[] = [
    {
        displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
        default: 'archiveMonitorsByMonitorId', displayOptions: { show: { resource: ['auditwolf'] } },
        options: operationOptions('auditwolf'),
    },
    {
        displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
        default: 'deleteValidationResult', displayOptions: { show: { resource: ['financewolf'] } },
        options: operationOptions('financewolf'),
    },
    {
        displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
        default: 'screenshot', displayOptions: { show: { resource: ['renderwolf'] } },
        options: operationOptions('renderwolf'),
    },
    {
        displayName: 'Operation', name: 'operation', type: 'options', noDataExpression: true,
        default: 'convertImage', displayOptions: { show: { resource: ['tools'] } },
        options: operationOptions('tools'),
    },
];

export class Ironfang implements INodeType {
    description: INodeTypeDescription = {
        ...legacy.description,
        usableAsTool: true,
        icon: { light: 'file:ironfang.svg', dark: 'file:ironfang.dark.svg' },
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Renderwolf, Financewolf, Auditwolf and public developer tools',
        credentials: [
            { name: 'ironfangS3', required: true, testedBy: 'ironfangS3Test', displayOptions: { show: { operation: ['createDestination', 'createExportDestinations'] }, hide: { destinationType: ['webhook'] } } },
            { name: 'ironfangApi', required: true, testedBy: 'ironfangApiTest', displayOptions: { show: { resource: ['renderwolf', 'auditwolf', 'financewolf'] }, hide: { authentication: ['public'] } } },
        ],
        properties: [
            { displayName: 'Resource', name: 'resource', type: 'options', noDataExpression: true, default: 'renderwolf', options: [{ name: 'Auditwolf', value: 'auditwolf' }, { name: 'Financewolf', value: 'financewolf' }, { name: 'Renderwolf', value: 'renderwolf' }, { name: 'Public Tool', value: 'tools' }] },
            ...operationParameters,
            ...legacy.description.properties.slice(2).map(field => ({ ...field, displayOptions: { ...field.displayOptions, show: { ...field.displayOptions?.show, resource: ['renderwolf'] } } })),
            ...renderOptions,
            ...productParameters,
        ],
    };
    methods = { ...legacy.methods, credentialTest: { ...legacy.methods.credentialTest, ironfangS3Test: destinationCredentialTest }, listSearch: { searchTemplates } };
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;
        if (resource === 'renderwolf' && legacyOperations.some(op => op.value === operation)) return legacy.execute.call(this);
        return executeProducts.call(this);
    }
}
