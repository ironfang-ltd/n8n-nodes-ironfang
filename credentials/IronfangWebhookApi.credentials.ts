import type { ICredentialType, Icon, INodeProperties } from 'n8n-workflow';
export class IronfangWebhookApi implements ICredentialType {
    name = 'ironfangWebhookApi';
    displayName = 'Ironfang Webhook API';
    icon: Icon = { light: 'file:ironfang.svg', dark: 'file:ironfang.dark.svg' };
    documentationUrl = 'https://ironfang.uk/auditwolf/docs';
    properties: INodeProperties[] = [
        { displayName: 'Product', name: 'product', type: 'options', default: 'auditwolf', options: [{ name: 'Auditwolf', value: 'auditwolf' }, { name: 'Renderwolf', value: 'renderwolf' }] },
        { displayName: 'Signing Secret', name: 'signingSecret', type: 'string', typeOptions: { password: true }, default: '', required: true, description: 'The one-time secret returned when creating the webhook endpoint or destination. This is not an API key.' },
    ];
}
