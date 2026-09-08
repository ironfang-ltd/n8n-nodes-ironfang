import type { ICredentialsDecrypted, INodeCredentialTestResult } from 'n8n-workflow';
// A signing key cannot be authenticated without the destination bucket and region.
// Keep the connection check explicit about that limit; destination Test performs
// the actual upload/verification through Ironfang once the destination exists.
export async function destinationCredentialTest(credential: ICredentialsDecrypted): Promise<INodeCredentialTestResult> {
    const data = credential.data ?? {};
    if (!data.accessKey || !data.secretKey) return { status: 'Error', message: 'Access key and secret key are required' };
    return { status: 'OK', message: 'Credential fields are present. To verify S3 access, register the destination and run Test Destination. No S3 connection has been made by this check.' };
}
