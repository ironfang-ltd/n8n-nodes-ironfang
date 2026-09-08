import type { INodeType, INodeTypeDescription, IWebhookFunctions, IWebhookResponseData } from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { verifyEvent, webhookCredentialTest } from './webhook';

// Endpoints are registered explicitly and remain customer-owned; n8n owns its local route.
// eslint-disable-next-line @n8n/community-nodes/webhook-lifecycle-complete
export class IronfangTrigger implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Ironfang Trigger', name: 'ironfangTrigger', group: ['trigger'], version: 1,
        icon: { light: 'file:ironfang.svg', dark: 'file:ironfang.dark.svg' },
        subtitle: 'Signed product events', description: 'Receive signed Auditwolf and Renderwolf events', defaults: { name: 'Ironfang Trigger' },
        inputs: [], outputs: [NodeConnectionTypes.Main],
        credentials: [{ name: 'ironfangWebhookApi', required: true, testedBy: 'ironfangWebhookTest' }],
        webhooks: [{ name: 'default', httpMethod: 'POST', responseMode: 'onReceived', path: 'events' }],
        properties: [
            { displayName: 'Register this node’s production webhook URL using Create Webhooks (Auditwolf) or Create Destination (Renderwolf), save the returned signing secret in its credential, then activate the workflow and test the endpoint. Signatures and timestamps are checked before execution.', name: 'setupNotice', type: 'notice', default: '' },
        ],
    };
    methods = { credentialTest: { ironfangWebhookTest: webhookCredentialTest } };
    async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
        const req = this.getRequestObject() as ReturnType<IWebhookFunctions['getRequestObject']> & { rawBody?: Buffer; readRawBody?: () => Promise<void> };
        const res = this.getResponseObject();
        const credentials = await this.getCredentials('ironfangWebhookApi');
        const now = Date.now();
        let event;
        try {
            if (req.headers['content-encoding'] && req.headers['content-encoding'] !== 'identity') throw new NodeOperationError(this.getNode(), 'Compressed webhooks are not accepted');
            if (!req.rawBody && req.readRawBody) await req.readRawBody();
            if (!Buffer.isBuffer(req.rawBody)) throw new NodeOperationError(this.getNode(), 'Raw webhook body is unavailable');
            event = verifyEvent(req.rawBody, req.headers, String(credentials.product), String(credentials.signingSecret), now);
        } catch {
            res.status(401).json({ error: 'Invalid signed webhook' });
            return { noWebhookResponse: true };
        }
        // Only the signed body ID is trusted. Header IDs are not part of the MAC.
        const id = String(event.id);
        const data = this.getWorkflowStaticData('node');
        const seen: Record<string, number> = Object.assign(Object.create(null), data.events ?? {});
        for (const [key, received] of Object.entries(seen)) if (received < now - 7 * 86_400_000) delete seen[key];
        if (Object.hasOwn(seen, id)) return { webhookResponse: { accepted: true, duplicate: true } };
        while (Object.keys(seen).length >= 10_000) delete seen[Object.keys(seen).sort((a, b) => seen[a] - seen[b])[0]];
        seen[id] = now; data.events = seen;
        return { webhookResponse: { accepted: true }, workflowData: [[{ json: { ...event, _ironfang: { product: String(credentials.product), verified: true, eventId: id } } }]] };
    }
}
