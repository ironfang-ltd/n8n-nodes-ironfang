import type { IDataObject, IHttpRequestMethods } from 'n8n-workflow';
export type Product = 'renderwolf' | 'financewolf' | 'auditwolf' | 'tools';
export interface QueryField {
    name: string; label: string; type: string; required?: boolean;
    default?: string | number | boolean; description?: string; enum?: string[];
}
export interface Operation {
    product: Product; id: string; name: string; description: string;
    method: IHttpRequestMethods; path: string; scope: string; query: QueryField[];
    input: 'none' | 'json' | 'xml' | 'upload';
    response: 'json' | 'binary' | 'multipart' | 'redirect';
    example?: IDataObject; idempotency?: boolean; public?: boolean;
    pagination?: { key: string; parameter: 'cursor' | 'before' | 'offset'; size: number };
}
