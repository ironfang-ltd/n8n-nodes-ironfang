import type { IDataObject, IHttpRequestMethods } from 'n8n-workflow';
// Product values are saved in workflows and credentials, so the three launch
// names stay as identifiers; transport maps each to its current API prefix.
export type Product = 'renderwolf' | 'financewolf' | 'auditwolf' | 'rig' | 'tools';
export interface QueryField {
    name: string; label: string; type: string; required?: boolean;
    default?: string | number | boolean; description?: string; enum?: string[];
}
export interface Operation {
    product: Product; id: string; name: string; description: string;
    method: IHttpRequestMethods; path: string; scope: string; query: QueryField[];
    input: 'none' | 'json' | 'xml' | 'upload' | 'zip';
    response: 'json' | 'binary' | 'multipart' | 'redirect';
    example?: IDataObject; idempotency?: boolean; public?: boolean; timeout?: number; accept?: string;
    // since: the node version from which a list released without paging is paged.
    // next: the response field carrying the next position, when not next_cursor.
    pagination?: { key: string; parameter: 'cursor' | 'before' | 'offset' | 'since'; size: number; since?: number; next?: string };
}
