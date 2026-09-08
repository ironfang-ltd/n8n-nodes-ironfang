const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const dir=process.argv[2];
const expected=Buffer.from('89504e470d0a1a0a0000000049454e44','hex');
if(process.argv[3]==='verify'){
 const requests=fs.readFileSync(path.join(dir,'requests.jsonl'),'utf8').trim().split('\n').map(JSON.parse);assert.equal(requests.length,7);assert.equal(requests[0].body.url,'https://example.com');assert.match(requests[0].contentType,/application\/json/);
 const log=fs.readFileSync(path.join(dir,'execution.log'),'utf8');let result;
 for(let i=log.indexOf('{');i>=0;i=log.indexOf('{',i+1)){try{const x=JSON.parse(log.slice(i).trim());if(x.data?.resultData){result=x;break;}}catch{}}
 assert(result,'Execution JSON missing: '+log.slice(-1000));assert(!result.data.resultData.error,JSON.stringify(result.data.resultData.error));
 const data=result.data.resultData.runData;for(let i=0;i<7;i++){const x=data['Operation '+i][0].data.main[0][0];assert.equal(x.json._ironfang.requestId,'runtime-request');if(i<5){assert.equal(x.json.byteLength,expected.length);assert.equal(x.json.bytes,i===0?`${expected.length} B`:expected.length);assert(x.binary.data);assert.deepEqual(fs.readFileSync(path.join(dir,'binary',x.binary.data.id.replace(/^filesystem-v2:/,''))),expected);}}
 console.log('Real n8n runtime: seven operations, authenticated JSON requests, binary outputs, legacy/new fields and metadata passed');process.exit(0);
}
const credential={id:'runtime-key',name:'Fixture API',type:'ironfangApi',data:{apiKey:'synthetic-runtime-key',baseUrl:'http://fixture-api:8080/renderwolf'}};
fs.writeFileSync(path.join(dir,'credentials.json'),JSON.stringify([credential]));
const ops=['screenshot','screenshot','pdf','image','video','sign','usage'];const nodes=[{id:'start',name:'Start',type:'n8n-nodes-base.manualTrigger',typeVersion:1,position:[0,0],parameters:{}}];const connections={};
for(const [i,operation] of ops.entries()){const name='Operation '+i;const previous=i===0?'Start':'Operation '+(i-1);connections[previous]={main:[[{node:name,type:'main',index:0}]]};nodes.push({id:name,name,type:'CUSTOM.ironfang',typeVersion:i===0?1:1.1,position:[(i+1)*220,0],credentials:{ironfangApi:{id:'runtime-key',name:'Fixture API'}},parameters:{resource:'renderwolf',operation,source:'url',url:'https://example.com',screenshotOptions:{},pdfOptions:{},binaryProperty:'data',templateId:'fixture-template',imageFormat:'png',vars:{values:[{name:'title',value:'Fixture'}]},signKind:'screenshot',signUrl:'https://example.com',signFullPage:false,ttlHours:1,clipSize:'720p',clipDuration:3,captions:{},clipOptions:{font_size:0}}});}
fs.writeFileSync(path.join(dir,'workflow.json'),JSON.stringify({id:'runtime-fixture',name:'Runtime fixture',nodes,connections,active:false,settings:{executionOrder:'v1'}}));
