import type {
    IAuthenticateGeneric,
    ICredentialType,
    Icon,
    INodeProperties,
} from 'n8n-workflow';

export class IronfangApi implements ICredentialType {
    name = 'ironfangApi';

    icon: Icon = { light: 'file:ironfang.svg', dark: 'file:ironfang.dark.svg' };

    displayName = 'Ironfang API';

    documentationUrl = 'https://ironfang.uk/renderwolf/docs';

    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: { password: true },
            default: '',
            required: true,
            description: 'An if_live_ platform API key from the Ironfang portal. Existing rw_live_ Renderwolf keys remain supported.',
        },
        {
            displayName: 'Base URL',
            name: 'baseUrl',
            type: 'string',
            default: 'https://api.ironfang.uk/renderwolf',
            description:
                'API origin or product base URL. Both legacy origin-only and /renderwolf credentials remain valid; the node selects the requested product path.',
        },
        {
            displayName: 'Test Product', name: 'testProduct', type: 'options', default: 'auto',
            options: [{ name: 'Auto', value: 'auto' }, { name: 'Auditwolf', value: 'auditwolf' }, { name: 'Financewolf', value: 'financewolf' }, { name: 'Renderwolf', value: 'renderwolf' }],
            description: 'Choose a product for the read-only connection check, or discover which product accepts the key',
        },
    ];

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                Authorization: '=Bearer {{$credentials.apiKey}}',
            },
        },
    };

}
