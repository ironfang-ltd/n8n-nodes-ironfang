import type { ICredentialTestFunctions, ICredentialsDecrypted, INodeCredentialTestResult } from 'n8n-workflow';
import { apiBase, productBase } from './transport';

// n8n's credential-test context exposes request; execution uses the authenticated
// httpRequest helper. A structured scope refusal proves authentication succeeded.
export async function credentialTest(this: ICredentialTestFunctions, credential: ICredentialsDecrypted): Promise<INodeCredentialTestResult> {
    const data = credential.data ?? {};
    const selected = String(data.testProduct || 'auto');
    const products = selected === 'auto' ? ['renderwolf', 'financewolf', 'auditwolf'] : [selected];
    const { request: testRequest } = this.helpers;
    let lastStatus: number | undefined;
    try {
        for (const product of products) {
            const base = product === 'renderwolf' && !/\/(financewolf|auditwolf|tools)\/?$/.test(String(data.baseUrl)) ? apiBase(data.baseUrl) : productBase(data.baseUrl, product);
            const endpoint = product === 'renderwolf' ? '/v1/usage' : product === 'financewolf' ? '/v1/einvoices/results' : '/v1/sites';
            const response = await testRequest({
                method: 'GET', uri: base + endpoint,
                headers: { Authorization: `Bearer ${String(data.apiKey ?? '')}` },
                json: true, resolveWithFullResponse: true, simple: false,
                followRedirect: false, timeout: 15_000,
            });
            lastStatus = response.statusCode;
            const body = response.body;
            const valid = product === 'renderwolf' ? typeof body?.limit === 'number' || body?.unmetered === true : Array.isArray(body?.[product === 'financewolf' ? 'results' : 'sites']);
            if (response.statusCode === 200 && valid) return { status: 'OK', message: `Connected to ${product}. Each operation requires its own scope.` };
            if (response.statusCode === 403 && (body?.error?.code ?? body?.code) === 'insufficient_scope') return { status: 'OK', message: `API key authenticated by ${product}. The test read is outside its scopes; choose only the scopes your workflow needs.` };
            if (response.statusCode !== 401 && response.statusCode !== 404) break;
        }
        return { status: 'Error', message: lastStatus === 401 ? 'API key was not accepted. Use an if_live_ platform key or an existing rw_live_ Renderwolf key.' : `Connection check returned HTTP ${lastStatus}. Check the base URL and service availability.` };
    } catch {
        return { status: 'Error', message: 'Could not connect. Check the base URL, TLS and service availability.' };
    }
}
