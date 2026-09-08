import type { ICredentialTestFunctions, ICredentialsDecrypted, INodeCredentialTestResult } from 'n8n-workflow';
import { apiBase } from './transport';

// n8n's credential-test context exposes request; execution uses the authenticated
// httpRequest helper. A structured scope refusal proves authentication succeeded.
export async function credentialTest(this: ICredentialTestFunctions, credential: ICredentialsDecrypted): Promise<INodeCredentialTestResult> {
    try {
        const data = credential.data ?? {};
        const { request: testRequest } = this.helpers;
        const response = await testRequest({
            method: 'GET', uri: `${apiBase(data.baseUrl)}/v1/usage`,
            headers: { Authorization: `Bearer ${String(data.apiKey ?? '')}` },
            json: true, resolveWithFullResponse: true, simple: false,
            followRedirect: false, timeout: 15_000,
        });
        if (response.statusCode === 200 && (typeof response.body?.limit === 'number' || response.body?.unmetered === true)) {
            return { status: 'OK', message: 'Connected to Renderwolf; usage permission is available' };
        }
        if (response.statusCode === 403 && response.body?.error?.code === 'insufficient_scope') {
            return { status: 'OK', message: 'API key authenticated. Usage needs renderwolf:usage:read; other operations use their own scopes.' };
        }
        return { status: 'Error', message: response.statusCode === 401 ? 'API key was not accepted. Use an if_live_ platform key or an existing rw_live_ Renderwolf key.' : `Connection check returned HTTP ${response.statusCode}. Check the base URL and service availability.` };
    } catch {
        return { status: 'Error', message: 'Could not connect. Check the base URL, TLS and service availability.' };
    }
}
