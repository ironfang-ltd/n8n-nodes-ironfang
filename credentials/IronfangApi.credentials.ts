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
                'Only change this if you are pointing at a non-production instance. Credentials created before Renderwolf moved under /renderwolf still hold https://api.ironfang.uk and keep working - the API serves both.',
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
