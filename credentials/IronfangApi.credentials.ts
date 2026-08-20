import type {
    IAuthenticateGeneric,
    ICredentialTestRequest,
    ICredentialType,
    Icon,
    INodeProperties,
} from 'n8n-workflow';

export class IronfangApi implements ICredentialType {
    name = 'ironfangApi';

    icon: Icon = 'file:ironfang.svg';

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
            description: 'An rw_live_ key from your Ironfang dashboard',
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

    test: ICredentialTestRequest = {
        request: {
            baseURL: '={{$credentials.baseUrl}}',
            url: '/v1/usage',
        },
    };
}
