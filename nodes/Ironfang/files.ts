import { randomBytes } from 'crypto';
import type { IDataObject } from 'n8n-workflow';

export function multipartUpload(data: Buffer, options: IDataObject): { body: Buffer; contentType: string } {
    const boundary = `ironfang-${randomBytes(24).toString('hex')}`;
    const chunks: Buffer[] = [];
    for (const [key, value] of Object.entries(options)) {
        if (!/^[a-z][a-z0-9_]*$/.test(key) || !['string', 'number', 'boolean'].includes(typeof value)) throw new Error('Form options must contain named string, number or boolean values');
        chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${String(value)}\r\n`));
    }
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="image"\r\nContent-Type: application/octet-stream\r\n\r\n`), data, Buffer.from(`\r\n--${boundary}--\r\n`));
    return { body: Buffer.concat(chunks), contentType: `multipart/form-data; boundary=${boundary}` };
}

export interface Part { name: string; filename: string; contentType: string; data: Buffer }

/** The named parts of a multipart/form-data body, in order. */
export function multipartParts(body: Buffer, contentType: string, what: string): Part[] {
    const boundary = /boundary=(?:"([^"\r\n]+)"|([^;\s]+))/i.exec(contentType);
    const value = boundary?.[1] ?? boundary?.[2];
    if (!value || value.length > 128) throw new Error(`${what} response has no valid multipart boundary`);
    const marker = Buffer.from(`--${value}`);
    const separator = Buffer.from(`\r\n--${value}`);
    const parts: Part[] = [];
    let offset = body.indexOf(marker);
    while (offset >= 0) {
        offset += marker.length;
        if (body.subarray(offset, offset + 2).toString() === '--') break;
        const headerEnd = body.indexOf('\r\n\r\n', offset);
        if (headerEnd < 0 || headerEnd - offset > 8192) throw new Error(`Invalid ${what} part headers`);
        const header = body.subarray(offset, headerEnd).toString('ascii');
        const name = /(?:^|;)\s*name="([a-z_]{1,32})"/m.exec(header)?.[1];
        const end = body.indexOf(separator, headerEnd + 4);
        if (end < 0 || !name || parts.some(p => p.name === name)) throw new Error(`Invalid or duplicate ${what} part`);
        parts.push({
            name,
            filename: /filename="([^"\r\n]{1,180})"/.exec(header)?.[1] ?? name,
            contentType: /^content-type:\s*([^\r\n]+)/im.exec(header)?.[1]?.trim() ?? 'application/octet-stream',
            data: body.subarray(headerEnd + 4, end),
        });
        offset = end + 2;
    }
    return parts;
}

export function previewParts(body: Buffer, contentType: string): { poster: Buffer; video: Buffer } {
    const parts = multipartParts(body, contentType, 'Site Preview');
    const poster = parts.find(p => p.name === 'poster')?.data;
    const video = parts.find(p => p.name === 'video')?.data;
    if (!poster?.length || !video?.length) throw new Error('Site Preview must return both poster and video');
    return { poster, video };
}

/** The binary MIME type a bundle output is stored as. Captured HTML is the
 * page's own markup, so it is stored as plain text: nothing previews it as
 * a page. */
export function bundleMime(part: Part): string {
    if (part.name === 'screenshot' && /^image\/(png|jpeg|webp)$/.test(part.contentType)) return part.contentType;
    if (part.name === 'markdown') return 'text/markdown';
    return 'text/plain';
}

export function filename(headers: Record<string, string>, fallback: string): string {
    const match = /filename="?([^";\r\n]+)"?/i.exec(headers['content-disposition'] ?? '');
    const name = match?.[1]?.split(/[\\/]/).pop();
    return name && /^[\w. -]{1,180}$/.test(name) && !name.startsWith('.') ? name : fallback;
}
