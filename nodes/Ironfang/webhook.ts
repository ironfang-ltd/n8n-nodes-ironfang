import { createHmac, timingSafeEqual } from 'crypto';
import type { IDataObject, ICredentialsDecrypted, INodeCredentialTestResult } from 'n8n-workflow';
export function signingKey(product: string, secret: string): Buffer {
    if (product === 'renderwolf' && /^[a-f0-9]{64}$/i.test(secret)) return Buffer.from(secret, 'hex');
    if (product === 'auditwolf' && /^awsec_[A-Za-z0-9_-]{43}$/.test(secret)) return Buffer.from(secret, 'utf8');
    throw new Error('Enter the signing secret returned by the selected product');
}
export function verifyEvent(raw: Buffer, headers: Record<string, unknown>, product: string, secret: string, now: number): IDataObject {
    if (!raw.length || raw.length > 65_536) throw new Error('Webhook payload size is invalid');
    const timestamp = headers[`${product}-timestamp`];
    const signature = headers[`${product}-signature`];
    if (typeof timestamp !== 'string' || !/^\d{10,11}$/.test(timestamp) || Math.abs(now / 1000 - Number(timestamp)) > 300) throw new Error('Webhook timestamp is invalid or expired');
    if (typeof signature !== 'string' || !/^v1=[a-f0-9]{64}$/.test(signature)) throw new Error('Webhook signature is invalid');
    const expected = createHmac('sha256', signingKey(product, secret)).update(`${timestamp}.`).update(raw).digest();
    if (!timingSafeEqual(expected, Buffer.from(signature.slice(3), 'hex'))) throw new Error('Webhook signature is invalid');
    const event = JSON.parse(raw.toString('utf8')) as IDataObject;
    if (!event || Array.isArray(event) || typeof event.id !== 'string' || !/^[a-zA-Z0-9_-]{1,200}$/.test(event.id) || typeof event.type !== 'string') throw new Error('Webhook event is invalid');
    return event;
}
export async function webhookCredentialTest(credential: ICredentialsDecrypted): Promise<INodeCredentialTestResult> {
    try {
        signingKey(String(credential.data?.product || ''), String(credential.data?.signingSecret || ''));
        return { status: 'OK', message: 'Signing secret format is valid. Run Test Webhook or Test Destination to verify a signed delivery to the active trigger.' };
    } catch { return { status: 'Error', message: 'Signing secret format does not match the selected product' }; }
}
