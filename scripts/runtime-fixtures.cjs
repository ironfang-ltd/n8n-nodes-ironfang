const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const dir=process.argv[2];
const expanded=[
 {resource:'renderwolf',operation:'createQr',requestBody:{data:'https://example.com'}},
 {resource:'renderwolf',operation:'submitJob',requestBody:{kind:'screenshot',request:{url:'https://example.com'}},idempotencyKey:'runtime-job'},
 {resource:'renderwolf',operation:'submitBatch',requestBody:{items:[{kind:'screenshot',request:{url:'https://example.com'}}]},idempotencyKey:'runtime-batch'},
 {resource:'renderwolf',operation:'getJobResult',id:'fixture-job'},
 {resource:'renderwolf',operation:'createSitePreview',requestBody:{url:'https://example.com'},outputBinaryField:'clip'},
 {resource:'renderwolf',operation:'createDestination',destinationType:'s3',requestBody:{bucket:'fixture',region:'eu-west-2'}},
 {resource:'financewolf',operation:'validateEInvoice',xmlSource:'binary',inputBinaryField:'data'},
 {resource:'financewolf',operation:'generateEInvoice',ruleset:'latest',profile:'peppol-bis-billing-3',requestBody:{amount:'12.50'}},
 {resource:'financewolf',operation:'listValidationResults',returnAll:true},
 {resource:'financewolf',operation:'listEInvoiceRulesets'},
 {resource:'tools',operation:'convertImage',requestBody:{format:'jpeg',quality:82}},
 {resource:'tools',operation:'createFavicon',requestBody:{fit:'pad',bg:'transparent'}},
 {resource:'tools',operation:'verifyQr',requestBody:{}},
 {resource:'tools',operation:'generateUuid',requestBody:{version:'v7',count:1}},
 {resource:'auditwolf',operation:'listSites'},
 {resource:'auditwolf',operation:'listFindings',query:{state:['open','acknowledged']},limit:10},
 {resource:'auditwolf',operation:'createSitesBySiteIdAudits',siteId:'fixture-site',requestBody:{reason:'fixture'},idempotencyKey:'runtime-audit'},
 {resource:'auditwolf',operation:'listAuditsByAuditIdEvidence',auditId:'fixture-audit'},
];
const expected=Buffer.from('89504e470d0a1a0a0000000049454e44','hex');
if(process.argv[3]==='verify'){
 const requests=fs.readFileSync(path.join(dir,'requests.jsonl'),'utf8').trim().split('\n').map(JSON.parse);assert.equal(requests.length,7+expanded.length+2);assert.equal(requests[0].body.url,'https://example.com');assert.match(requests[0].contentType,/application\/json/);
 const log=fs.readFileSync(path.join(dir,'execution.log'),'utf8');let result;
 for(let i=log.indexOf('{');i>=0;i=log.indexOf('{',i+1)){try{const x=JSON.parse(log.slice(i).trim());if(x.data?.resultData){result=x;break;}}catch{}}
 assert(result,'Execution JSON missing: '+log.slice(-1000));assert(!result.data.resultData.error,JSON.stringify(result.data.resultData.error));
 const data=result.data.resultData.runData;for(let i=0;i<7;i++){const x=data['Operation '+i][0].data.main[0][0];assert.equal(x.json._ironfang.requestId,'runtime-request');if(i<5){assert.equal(x.json.byteLength,expected.length);assert.equal(x.json.bytes,i===0?`${expected.length} B`:expected.length);assert(x.binary.data);assert.deepEqual(fs.readFileSync(path.join(dir,'binary',x.binary.data.id.replace(/^filesystem-v2:/,''))),expected);}}
 for(let i=0;i<expanded.length;i++)assert(data['Expanded '+i]?.[0]?.data?.main?.[0]?.length,'Missing expanded output '+i);
 const generated=data['Expanded 7'][0].data.main[0][0];const xml=fs.readFileSync(path.join(dir,'binary',generated.binary.data.id.replace(/^filesystem-v2:/,'')));assert.equal(xml.toString(),'<?xml version="1.0"?><Invoice>£12.50</Invoice>');
 assert.equal(data['Expanded 6'][0].data.main[0][0].json.outcome,'invalid');assert.equal(data['Expanded 8'][0].data.main[0].length,2);assert(data['Expanded 4'][0].data.main[0][0].binary.poster);
 const validation=requests.find(x=>x.url.includes('/einvoices/validate'));assert.deepEqual(Buffer.from(validation.raw,'base64'),expected);assert.equal(validation.contentType,'application/xml');
 for(const upload of requests.filter(x=>/tools\/v1\/(convert|favicon|qr\/verify)/.test(x.url))){assert.match(upload.contentType,/multipart\/form-data; boundary=/);assert(Buffer.from(upload.raw,'base64').includes(expected));assert.equal(upload.authenticated,false);}
 assert.equal(requests.find(x=>x.url.includes('/v1/results/123/')).authenticated,false);
 const finding=new URL(requests.find(x=>x.url.startsWith('/auditwolf/v1/findings')).url,'http://fixture');assert.deepEqual(finding.searchParams.getAll('state'),['open','acknowledged']);
 console.log('Real n8n runtime: legacy/new Renderwolf, Financewolf XML, Auditwolf, public tools, multipart, pagination, signed downloads and filesystem binary storage passed');process.exit(0);
}
const credential={id:'runtime-key',name:'Fixture API',type:'ironfangApi',data:{apiKey:'synthetic-runtime-key',baseUrl:'http://fixture-api:8080/renderwolf'}};
fs.writeFileSync(path.join(dir,'credentials.json'),JSON.stringify([credential,{id:'runtime-s3',name:'Fixture S3',type:'ironfangS3',data:{accessKey:'synthetic-access',secretKey:'synthetic-secret'}}]));
const ops=['screenshot','screenshot','pdf','image','video','sign','usage'];const nodes=[{id:'start',name:'Start',type:'n8n-nodes-base.manualTrigger',typeVersion:1,position:[0,0],parameters:{}}];const connections={};
for(const [i,operation] of ops.entries()){const name='Operation '+i;const previous=i===0?'Start':'Operation '+(i-1);connections[previous]={main:[[{node:name,type:'main',index:0}]]};nodes.push({id:name,name,type:'CUSTOM.ironfang',typeVersion:i===0?1:1.1,position:[(i+1)*220,0],credentials:{ironfangApi:{id:'runtime-key',name:'Fixture API'}},parameters:{resource:'renderwolf',operation,source:'url',url:'https://example.com',screenshotOptions:{},pdfOptions:{},binaryProperty:'data',templateId:'fixture-template',imageFormat:'png',vars:{values:[{name:'title',value:'Fixture'}]},signKind:'screenshot',signUrl:'https://example.com',signFullPage:false,ttlHours:1,clipSize:'720p',clipDuration:3,captions:{},clipOptions:{font_size:0}}});}
for(const [i,params] of expanded.entries()){
 const name='Expanded '+i;connections['Operation 1'].main[0].push({node:name,type:'main',index:0});
 nodes.push({id:name,name,type:'CUSTOM.ironfang',typeVersion:1.1,position:[700,i*200+200],credentials:{ironfangApi:{id:'runtime-key',name:'Fixture API'},ironfangS3:{id:'runtime-s3',name:'Fixture S3'}},parameters:{authentication:'apiKey',publicBaseUrl:'http://fixture-api:8080',outputBinaryField:'data',inputBinaryField:'data',...params}});
}
fs.writeFileSync(path.join(dir,'workflow.json'),JSON.stringify({id:'runtime-fixture',name:'Runtime fixture',nodes,connections,active:false,settings:{executionOrder:'v1'}}));
