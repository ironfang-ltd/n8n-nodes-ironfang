import type { ICredentialTestFunctions, ICredentialsDecrypted, INodeCredentialTestResult } from 'n8n-workflow';
import { renderwolfBase, productBase, productPrefix } from './transport';

// One read-only list per product, and the array its response must carry.
const checks: Record<string, [string, string]> = { financewolf: ['/v1/einvoices/results', 'results'], auditwolf: ['/v1/sites', 'sites'], rig: ['/v1/projects', 'projects'] };

// n8n's credential-test context exposes request; execution uses the authenticated
// httpRequest helper. A structured scope refusal proves authentication succeeded.
export async function credentialTest(this: ICredentialTestFunctions, credential: ICredentialsDecrypted): Promise<INodeCredentialTestResult> {
    const data = credential.data ?? {};
    const selected = String(data.testProduct || 'auto');
    const products = selected === 'auto' ? ['renderwolf', 'financewolf', 'auditwolf', 'rig'] : [selected];
    const { request: testRequest } = this.helpers;
    let lastStatus: number | undefined;
    try {
        for (const product of products) {
            const base = product === 'renderwolf' ? renderwolfBase(data.baseUrl) : productBase(data.baseUrl, product);
            const endpoint = product === 'renderwolf' ? '/v1/usage' : checks[product][0];
            const name = productPrefix(product);
            const response = await testRequest({
                method: 'GET', uri: base + endpoint,
                headers: { Authorization: `Bearer ${String(data.apiKey ?? '')}` },
                json: true, resolveWithFullResponse: true, simple: false,
                followRedirect: false, timeout: 15_000,
            });
            lastStatus = response.statusCode;
            const body = response.body;
            const valid = product === 'renderwolf' ? typeof body?.limit === 'number' || body?.unmetered === true : Array.isArray(body?.[checks[product][1]]);
            if (response.statusCode === 200 && valid) return { status: 'OK', message: `Connected to Ironfang ${name}. Each operation requires its own scope.` };
            if (response.statusCode === 403 && (body?.error?.code ?? body?.code) === 'insufficient_scope') return { status: 'OK', message: `API key authenticated by Ironfang ${name}. The test read is outside its scopes; choose only the scopes your workflow needs.` };
            if (response.statusCode !== 401 && response.statusCode !== 404) break;
        }
        return { status: 'Error', message: lastStatus === 401 ? 'API key was not accepted. Use an if_live_ platform key or an existing rw_live_ Render key.' : `Connection check returned HTTP ${lastStatus}. Check the base URL and service availability.` };
    } catch {
        return { status: 'Error', message: 'Could not connect. Check the base URL, TLS and service availability.' };
    }
}
