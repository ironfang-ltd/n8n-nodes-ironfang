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

    documentationUrl = 'https://ironfang.uk/render/docs';

    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: { password: true },
            default: '',
            required: true,
            description: 'An if_live_ platform API key from the Ironfang portal. Existing rw_live_ Render keys remain supported.',
        },
        {
            displayName: 'Base URL',
            name: 'baseUrl',
            type: 'string',
            default: 'https://api.ironfang.uk/render',
            description:
                'API origin or product base URL. Origin-only and /renderwolf values saved by earlier versions remain valid; the node selects the requested product path.',
        },
        {
            displayName: 'Test Product', name: 'testProduct', type: 'options', default: 'auto',
            options: [{ name: 'Auto', value: 'auto' }, { name: 'Audit', value: 'auditwolf' }, { name: 'Finance', value: 'financewolf' }, { name: 'Render', value: 'renderwolf' }, { name: 'Rig', value: 'rig' }],
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
