import type { ILoadOptionsFunctions, INodeListSearchResult, IDataObject } from 'n8n-workflow';
import { productBase } from './transport';
export async function searchTemplates(this: ILoadOptionsFunctions, _filter?: string, paginationToken?: string): Promise<INodeListSearchResult> {
    const credentials = await this.getCredentials('ironfangApi');
    const body = await this.helpers.httpRequestWithAuthentication.call(this, 'ironfangApi', {
        method: 'GET', url: `${productBase(credentials.baseUrl, 'renderwolf')}/v1/templates`,
        qs: { summary: true, limit: 50, ...(paginationToken ? { cursor: paginationToken } : {}) },
        json: true, timeout: 30_000, disableFollowRedirect: true,
    }) as { templates: IDataObject[]; next_cursor?: string };
    if (!Array.isArray(body.templates)) throw new Error('Template lookup returned an invalid response');
    return { results: body.templates.map(row => ({ name: String(row.name), value: String(row.id) })), paginationToken: body.next_cursor || undefined };
}
