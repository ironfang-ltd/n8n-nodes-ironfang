"""Refresh the checked-in operation catalogue from an Ironfang source checkout.
Requires PyYAML for development only; the published node has no runtime dependencies.
Usage: python3 scripts/sync-contracts.py /path/to/ironfang [commit]
The commit labels the operation reference when the source is an export without git metadata.
"""
import json, re, subprocess, sys
from pathlib import Path
import yaml
root=Path(sys.argv[1]); output=Path(__file__).resolve().parent.parent
operations=[]; schemas={}
# Catalogue product values are saved in workflows and keep their launch names;
# PREFIX is the API path and scope family each one has used since September 2026.
PREFIX={'renderwolf':'render','financewolf':'finance','auditwolf':'audit','rig':'rig','tools':'tools'}
# List operations released before 0.4.0 without paging keep their single-response
# shape in saved workflows; paging applies from node version 1.2.
PAGED_SINCE_1_2={'listFindingsByFindingIdEvents','listRulesByLineageIdRevisions','listSitesBySiteIdAudits','listAudits','listAuditsByAuditIdPages','listWebhooksByEndpointIdDeliveries','listExports','listMonitorsByMonitorIdRuns'}
def routes(directory, prefix):
 src=(root/f'internal/{directory}/httpapi/server.go').read_text()
 return {(method,normal(path.removeprefix('/'+prefix))):f'{prefix}:{perm.lower()}' for method,path,perm in re.findall(r'mux.Handle\("(GET|POST|PUT|PATCH|DELETE) (/'+prefix+r'/[^" ]+)", s.auth\(Perm(\w+)',src)}
def title(s):
 return re.sub(r'\b(Id|Url|Qr|Pdf|Xml|Api|Uuid|S3)\b', lambda m:m[0].upper(),s.replace('_',' ').title())
def normal(path): return re.sub(r'\{[^}]+\}', '{}',path)
for product, directory in [('renderwolf','render'),('financewolf','finance/einvoice'),('auditwolf','audit'),('rig','rig')]:
 doc=yaml.safe_load((root/f'internal/{directory}/httpapi/openapi.yaml').read_text())
 def resolve(s):
  if '$ref' in s:
   ref=doc
   for k in s['$ref'][2:].split('/'):ref=ref[k]
   return resolve(ref)
  return s
 def sample(s,depth=0):
  s=resolve(s)
  if depth>8:return {}
  for key in ['example','const','default']:
   if key in s:return s[key]
  if s.get('enum'):return s['enum'][0]
  if 'allOf' in s:
   out={}
   for sub in s['allOf']:
    value=sample(sub,depth+1)
    if isinstance(value,dict):out.update(value)
   return out
  if 'oneOf' in s:return sample(s['oneOf'][0],depth+1)
  if s.get('type')=='array':return [sample(s.get('items',{}),depth+1)]
  if s.get('type')=='object' or 'properties' in s:return {k:sample(v,depth+1) for k,v in s.get('properties',{}).items() if k in s.get('required',[])}
  if s.get('type') in ['integer','number']:return s.get('minimum',1)
  if s.get('type')=='boolean':return False
  if s.get('format')=='uri':return 'https://example.com'
  return ''
 scopes=routes(directory,PREFIX[product]) if product in ['auditwolf','rig'] else {}
 for path, methods in doc['paths'].items():
  for method, op in methods.items():
   if method not in ['get','post','put','patch','delete']:continue
   ident=op['operationId']
   if product=='renderwolf' and ident in ['createScreenshot','createPdf','createClip','renderTemplate','createSignedUrl','renderSignedUrl','getSignedResult','getUsage']:continue
   if product=='auditwolf' and ('/billing' in path or path=='/v1/plans' or '/notification' in path or path.startswith('/verify')):continue
   if product=='financewolf' and path.endswith('/billing'):continue
   name=title(re.sub(r'([a-z])([A-Z])',r'\1 \2',ident).replace('By ','').replace('Site Id','Site').replace('Audit Id','Audit').replace('Monitor Id','Monitor').replace('Finding Id','Finding').replace('Lineage Id','Rule').replace('Endpoint Id','Endpoint').replace('Destination Id','Destination').replace('Installation Id','Installation').replace('Observation Id','Observation').replace('Artifact Id','Artifact').replace('Delivery Id','Delivery'))
   override={'createQr':'QR Code','createSitePreview':'Site Preview','submitJob':'Submit Job','getJobResult':'Download Job Result','getCapabilities':'Capabilities','generateEInvoice':'Generate E-Invoice','validateEInvoice':'Validate E-Invoice','listEInvoiceRulesets':'List Rulesets','getEInvoiceRuleset':'Get Ruleset','listValidationResults':'List Results','getValidationResult':'Get Result','deleteValidationResult':'Delete Result','createSitesBySiteIdAudits':'Run Site Audit','getAuditsByAuditId':'Get Audit','listSitesBySiteIdAudits':'List Site Audits','listAuditsByAuditIdEvidence':'Download Audit Evidence','getArtifactsByArtifactId':'Download Artifact','getProductHome':'Home','getUsage':'Usage','getEinvoiceUsage':'Usage'}
   override.update({
    'archiveMonitorsByMonitorId':'Archive Monitor', 'createExportDestinations':'Create Export Destination', 'createSites':'Create Site',
    'createSitesBySiteIdMonitors':'Create Monitor', 'createSitesBySiteIdRulePacks':'Install Rule Pack', 'createSitesBySiteIdRules':'Create Rule', 'createWebhooks':'Create Webhook',
    'deleteRulePacksInstalledByInstallationId':'Uninstall Rule Pack', 'deleteRulesByLineageId':'Retire Rule', 'deleteWebhooksByEndpointId':'Delete Webhook',
    'disableRulesByLineageId':'Disable Rule', 'enableRulesByLineageId':'Enable Rule', 'exportAuditsByAuditId':'Export Audit',
    'getFindingsByFindingId':'Get Finding', 'getMonitorsByMonitorId':'Get Monitor', 'getPageObservationsByObservationId':'Get Page Observation',
    'getPageObservationsByObservationIdComparison':'Compare Page Observation', 'getRulesByLineageId':'Get Rule', 'getSitesBySiteId':'Get Site',
    'listAuditsByAuditIdPages':'List Audit Pages', 'listFindingsByFindingIdEvents':'List Finding Events', 'listMonitorsByMonitorIdRuns':'List Monitor Runs',
    'listPagesByPageIdObservations':'List Page Observations', 'listRulesByLineageIdRevisions':'List Rule Revisions',
    'listSitesBySiteIdMonitors':'List Site Monitors', 'listSitesBySiteIdRulePacks':'List Installed Rule Packs', 'listSitesBySiteIdRules':'List Site Rules',
    'listWebhooksByEndpointIdDeliveries':'List Webhook Deliveries', 'pauseMonitorsByMonitorId':'Pause Monitor', 'replaceMonitorsByMonitorIdUrls':'Replace Monitor URLs',
    'resumeMonitorsByMonitorId':'Resume Monitor', 'retryWebhooksByEndpointIdDeliveriesByDeliveryId':'Retry Webhook Delivery',
    'rotateWebhooksByEndpointIdSecret':'Rotate Webhook Secret', 'runMonitorsByMonitorId':'Run Monitor',
    'testExportDestinationsByDestinationId':'Test Export Destination', 'testWebhooksByEndpointId':'Test Webhook',
    'updateFindingsByFindingId':'Update Finding', 'updateMonitorsByMonitorId':'Update Monitor', 'updateRulesByLineageId':'Update Rule',
    'updateWebhooksByEndpointId':'Update Webhook', 'upgradeRulePacksInstalledByInstallationId':'Upgrade Rule Pack',
    'getWebhookDelivery':'Get Webhook Delivery', 'listWebhookDeliveries':'List All Webhook Deliveries', 'listMonitors':'List Monitors',
    'createEinvoiceJob':'Create Job', 'getEinvoiceJob':'Get Job', 'listEinvoiceJobs':'List Jobs', 'cancelEinvoiceJob':'Cancel Job',
    'createEinvoiceBatch':'Create Batch', 'getEinvoiceBatch':'Get Batch', 'listEinvoiceBatches':'List Batches', 'cancelEinvoiceBatch':'Cancel Batch',
    'createEinvoiceDestination':'Create Destination', 'getEinvoiceDestination':'Get Destination', 'listEinvoiceDestinations':'List Destinations',
    'updateEinvoiceDestination':'Update Destination', 'deleteEinvoiceDestination':'Delete Destination',
    'listEinvoiceDeliveries':'List Deliveries', 'getEinvoiceDelivery':'Get Delivery', 'retryEinvoiceDelivery':'Retry Delivery',
    'createEinvoiceReport':'Download Signed Report', 'verifyEinvoiceReport':'Verify Signed Report', 'getEinvoiceReportKeys':'Get Report Signing Keys',
    'renderEinvoice':'Render E-Invoice PDF',
    'createRunReceipt':'Create Run Receipt', 'exportEvidence':'Export Run Evidence', 'getEventPayload':'Download Event Payload',
    'holdRun':'Hold Run', 'releaseRun':'Release Run Hold', 'replayCallback':'Replay Callback', 'setMockRules':'Set Mock Rules',
    'waitForEvent':'Wait For Event', 'listEvidenceKeys':'List Evidence Signing Keys', 'getEnvironment':'Get Environment',
   })
   name=override.get(ident,name)
   params=[]
   for param in methods.get('parameters',[])+op.get('parameters',[]):
    p=resolve(param)
    if p['in']!='query':continue
    s=resolve(p.get('schema',{}))
    params.append({'name':p['name'],'label':title(p['name']),'type':s.get('type','string'),'required':p.get('required',False),'default':s.get('default',sample(s) if p.get('required') else ''),'description':p.get('description',''),'enum':s.get('enum',[])})
   response='json'
   if ident in ['createQr','listAuditsByAuditIdEvidence','getArtifactsByArtifactId','createEinvoiceReport','renderEinvoice','exportEvidence','getEventPayload']:response='binary'
   if ident=='createSitePreview':response='multipart'
   if ident=='getJobResult':response='redirect'
   body=resolve(op.get('requestBody',{})).get('content',{}).get('application/json',{})
   mode='json' if body else 'none'
   if ident=='validateEInvoice':mode='xml'
   if ident=='verifyEinvoiceReport':mode='zip'
   example=body.get('example')
   if example is None:
    example=next((e['value'] for e in body.get('examples',{}).values() if 'value' in e),None)
   if example is None and body:example=sample(body.get('schema',{}))
   if ident=='generateEInvoice':example=json.loads((root/'internal/finance/einvoice/generate/examples/invoice-minimal.json').read_text())
   if ident=='submitJob':example={'kind':'screenshot','request':{'url':'https://example.com'}}
   if ident=='submitBatch':example={'items':[{'kind':'screenshot','request':{'url':'https://example.com'}}]}
   if ident in ['createTemplate','updateTemplate']:example={'name':'example-card','html':'<h1>{{title}}</h1>','width':1200,'height':630}
   if ident=='createSites':example={'name':'Example site','url':'https://example.com'}
   if ident=='createSitesBySiteIdAudits':example={'reason':'Scheduled n8n check','trigger_type':'api'}
   if ident=='createDestination':example={'name':'n8n delivery','url':'https://example.com/webhook'}
   if ident=='createExportDestinations':example={'region':'eu-west-2','bucket':'your-bucket','prefix':'auditwolf','export_mode':'manual_only'}
   if ident=='createEinvoiceDestination':example={'name':'n8n delivery','config':{'url':'https://example.com/webhook'}}
   if ident=='updateEinvoiceDestination':example={'enabled':True}
   if ident=='createEinvoiceJob':example={'operation':'validate','document_base64':'PEludm9pY2UvPg==','options':{'ruleset':'latest','profile':'peppol-bis-billing-3'}}
   if ident=='createEinvoiceBatch':example={'jobs':[{'operation':'validate','document_base64':'PEludm9pY2UvPg==','options':{'ruleset':'latest','profile':'peppol-bis-billing-3'}}]}
   if ident in ['createEinvoiceReport','renderEinvoice']:example={'operation_id':'00000000-0000-0000-0000-000000000000'}
   if ident=='createRun':example={'ttl':'30m','reason':'n8n workflow run'}
   if ident=='finishRun':example={'outcome':'pass'}
   if ident=='cancelRun':example={'reason':'Cancelled from n8n'}
   if ident=='createResource':example={'name':'order_webhook','type':'callback'}
   if ident=='waitForEvent':example={'type':'callback.received','resource':'order_webhook','timeout':'30s'}
   if ident=='holdRun':example={'until':'2027-01-01T00:00:00Z'}
   if ident=='createConnector':example={'name':'n8n'}
   if ident=='addFault':example={'type':'delay','resource':'order_webhook','delay':'5s'}
   if ident=='setMockRules':example={'rules':[{'match':{'method':'POST','path':'/v1/ship/{id}'},'respond':{'status':200,'json':{'ok':True}}}]}
   if ident=='createWebhooks':example={'url':'https://example.com/webhook','events':['audit.completed']}

   if product=='renderwolf':
    scope='render:render'
    if 'Template' in ident:scope='render:templates:'+('read' if method=='get' else 'write')
    if 'Destination' in ident or ident=='redeliverDelivery':scope='render:destinations'
    if ident=='listRequests':scope='render:usage:read'
    if ident=='getCapabilities':scope='none'
   elif product=='financewolf':
    # The Finance contract states each operation's scope, except for retained
    # results, whose handler requires einvoices:read, and einvoices:write to delete.
    required=[s for entry in op.get('security',doc.get('security',[])) for s in entry.get('platformKey',[])]
    scope=required[0] if required else ('none' if op.get('security')==[] else 'finance:einvoices:'+('write' if method=='delete' else 'read'))
   else:scope=scopes.get((method.upper(),normal(path)))
   assert scope,(ident,path)
   o={'product':product,'id':ident,'name':name,'description':op.get('summary',name),'method':method.upper(),'path':path,'scope':scope,'query':params,'input':mode,'response':response}
   if example is not None:o['example']=example
   if body.get('schema'):schemas[product+':'+ident]={'schema':body['schema'],'components':doc.get('components',{}).get('schemas',{})}
   if ident in ['submitJob','submitBatch','generateEInvoice','validateEInvoice','createSitesBySiteIdAudits','runMonitorsByMonitorId','createEinvoiceJob','createEinvoiceBatch','createRun']:o['idempotency']=True
   # Wait For Event holds the request open for up to 90 seconds.
   if ident=='waitForEvent':o['timeout']=100000
   # Evidence answers JSON-accepting clients with the manifest alone; ask for the bundle.
   if ident=='exportEvidence':o['accept']='application/zip'
   if product=='financewolf' and ident in ['generateEInvoice','validateEInvoice','listEInvoiceRulesets','getEInvoiceRuleset']:o['public']=True
   if scope=='none':o['public']=True
   # Pagination is based on the implemented response envelopes.
   pages={'listTemplates':('templates','cursor',100),'listJobs':('jobs','cursor',100),'listDeliveries':('deliveries','cursor',100),'listRequests':('requests','offset',200),'listValidationResults':('results','before',20),'listFindings':('findings','offset',200),'listPagesByPageIdObservations':('observations','cursor',100),
    'listBatches':('batches','cursor',100),'listEinvoiceJobs':('jobs','cursor',100),'listEinvoiceBatches':('batches','cursor',100),'listEinvoiceDeliveries':('deliveries','cursor',100),
    'listMonitors':('monitors','cursor',200),'listWebhookDeliveries':('deliveries','cursor',200),
    'listFindingsByFindingIdEvents':('events','cursor',200),'listRulesByLineageIdRevisions':('revisions','cursor',200),'listSitesBySiteIdAudits':('audits','cursor',200),'listAudits':('audits','cursor',200),
    'listAuditsByAuditIdPages':('pages','cursor',200),'listWebhooksByEndpointIdDeliveries':('deliveries','cursor',200),'listExports':('exports','cursor',200),'listMonitorsByMonitorIdRuns':('audits','cursor',200),
    'listProjects':('projects','cursor',100),'listSuites':('suites','cursor',100),'listRuns':('runs','cursor',100),'listEvents':('events','since',500)}
   if ident in pages and not (product=='auditwolf' and ident=='listEvents'):
    key,param,size=pages[ident];o['pagination']={'key':key,'parameter':param,'size':size}
    if ident in PAGED_SINCE_1_2:o['pagination']['since']=1.2
    if param=='since':o['pagination']['next']='next_since'
   operations.append(o)
# Public tools use their actual handler request types, rather than an OpenAPI document.
for ident,name,path,mode,response,example in [
 ('convertImage','Convert Image','convert','upload','binary',{'format':'png'}),
 ('createFavicon','Create Favicon ZIP','favicon','upload','binary',{'fit':'pad','bg':'transparent'}),
 ('verifyQr','Verify QR Code','qr/verify','upload','json',{}),
 ('generateQr','Generate QR Code','qr','json','binary',{'data':'https://example.com'}),
 ('generateUuid','Generate UUID','uuid','json','json',{'version':'v7','count':1}),
 ('inspectUuid','Inspect UUID','uuid/inspect','json','json',{'value':'01900000-0000-7000-8000-000000000000'}),
 ('freeScreenshot','Free Screenshot','screenshot','json','binary',{'url':'https://example.com','width':1280})]:
 operations.append({'product':'tools','id':ident,'name':name,'description':name,'method':'POST','path':'/v1/'+path,'scope':'none','query':[],'input':mode,'response':response,'example':example,'public':True})
operations.sort(key=lambda o:(o['product'],o['name']))
(output/'nodes/Ironfang/catalog.ts').write_text("// Generated by scripts/sync-contracts.py. Review handler changes alongside the contract.\nimport type { Operation } from './types';\n\nexport const operations: Operation[] = "+json.dumps(operations,indent=2,ensure_ascii=False)+';\n')
# A compact request reference avoids copying entire components repeatedly.
commit=sys.argv[2] if len(sys.argv)>2 else subprocess.run(['git','-C',str(root),'rev-parse','--short','HEAD'],capture_output=True,text=True).stdout.strip() or 'unknown'
lines=['# Operation reference','',f'Generated from Ironfang main `{commit}`. Runtime endpoint selection is fixed by this catalogue.','Complex request bodies use JSON so all supported schema fields remain available. Replace placeholders with your own values.','']
for o in operations:
 lines.extend(['## '+PREFIX[o['product']]+' / '+o['name'],'',f"`{o['method']} /{PREFIX[o['product']]}{o['path']}`. Scope: `{o['scope']}`.",'',o['description'],'',('Full request contract: https://api.ironfang.uk/'+PREFIX[o['product']]+'/openapi.yaml' if o['product'] != 'tools' else 'Public tool input: use the form options and binary image field, or the JSON example below.'),''])
 if o.get('example') is not None:lines.extend(['```json',json.dumps(o['example'],indent=2),'```',''])
 if o['query']:lines.extend(['Query fields: '+', '.join('`'+p['name']+'`'+(' (required)' if p.get('required') else '') for p in o['query'])+'.',''])
(output/'docs/operations.md').write_text('\n'.join(lines))
print(f'Generated {len(operations)} additional operations')
