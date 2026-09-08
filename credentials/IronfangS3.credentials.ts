import type { ICredentialType, Icon, INodeProperties } from 'n8n-workflow';
export class IronfangS3 implements ICredentialType {
    name = 'ironfangS3';
    displayName = 'Ironfang S3 Destination';
    icon: Icon = { light: 'file:ironfang.svg', dark: 'file:ironfang.dark.svg' };
    documentationUrl = 'https://ironfang.uk/renderwolf/docs';
    properties: INodeProperties[] = [
        { displayName: 'Access Key', name: 'accessKey', type: 'string', default: '', required: true },
        { displayName: 'Secret Key', name: 'secretKey', type: 'string', typeOptions: { password: true }, default: '', required: true },
        { displayName: 'Session Token', name: 'sessionToken', type: 'string', typeOptions: { password: true }, default: '' },
    ];
}
