const test=require('node:test');const assert=require('node:assert/strict');
const {run,payload}=require('./context.cjs');
const {credentialTest}=require('../dist/nodes/Ironfang/credentialTest.js');
for(const version of [1,1.1]) {
 test(`all operations preserve inputs, binary and linking in node v${version}`,async()=>{
  const ops=['screenshot','pdf','image','video','sign','usage'];const {ctx,output}=await run(ops.map(operation=>({operation})),{version});
  assert.equal(output.length,6);output.forEach((x,i)=>assert.deepEqual(x.pairedItem,{item:i}));
  for(const x of output.slice(0,4)){assert.equal(x.json.byteLength,payload.length);assert.equal(x.json.bytes,version===1?`${payload.length} B`:payload.length);assert.deepEqual(Buffer.from(x.binary.data.data,'base64'),payload);assert.equal(x.json._ironfang.creditsCharged,0);assert.equal(x.json._ironfang.requestId,'fixture-request');}
  assert.equal(output[4].json.url,'https://api.ironfang.uk/signed-fixture');assert.equal(output[5].json.limit,250);
  assert(ctx.requests.every(r=>r.returnFullResponse&&r.disableFollowRedirect&&r.timeout>0));
  assert(!('font_size' in ctx.requests[3].body));
 });
 test(`continued error keeps version ${version} contract`,async()=>{
  const {output}=await run([{},{}],{version,continueOnFail:true,reply:(req,i)=>{if(i===0){const e=new Error('HTTP 429');e.response={status:429,headers:{'retry-after':'60','x-ironfang-request-id':'failed-request'},data:Buffer.from(JSON.stringify({error:{code:'rate_limited',message:'Wait before retrying'}}))};throw e;}return {body:payload,headers:{},statusCode:200};}});
  assert.equal(output.length,2);assert.equal(output[0].json._ironfang.code,'rate_limited');assert.equal(output[0].json._ironfang.retryAfterSeconds,60);assert.equal(output[0].json._ironfang.requestId,'failed-request');assert.equal(typeof output[0].json.error,version===1?'string':'object');assert.deepEqual(output[1].pairedItem,{item:1});
 });
}
for(const baseUrl of ['https://api.ironfang.uk','https://api.ironfang.uk/renderwolf///']) test(`base URL ${baseUrl}`,async()=>{const {ctx}=await run([{}],{baseUrl});assert.equal(ctx.requests[0].url,baseUrl.replace(/\/+$/,'')+'/v1/screenshot');});
for(const format of ['png','jpeg','webp'])test(`screenshot ${format} and HTML map correctly`,async()=>{const {ctx,output}=await run([{source:'html',screenshotOptions:{format,device:'mobile'}}]);assert.equal(ctx.requests[0].body.html,'<p>fixture</p>');assert(!('url' in ctx.requests[0].body));assert.equal(ctx.requests[0].body.device,'mobile');assert.equal(output[0].binary.data.mimeType,'image/'+format);});
for(const templateId of ['../sign','a/b','id?x=1','id#fragment',''])test(`rejects template path ${JSON.stringify(templateId)}`,async()=>{await assert.rejects(run([{operation:'image',templateId}]),e=>e.constructor.name==='NodeOperationError'&&e.context.itemIndex===0);});
test('error identifies second input',async()=>{await assert.rejects(run([{},{}],{reply:(req,i)=>{if(i===1)throw new Error('failed');return {body:payload,headers:{},statusCode:200};}}),e=>e.context.itemIndex===1);});
test('refuses an empty output binary property',async()=>{await assert.rejects(run([{binaryProperty:''}]),/Output binary field/);});
for(const [name,statusCode,body,status] of [['usage',200,{limit:250},'OK'],['unmetered',200,{unmetered:true},'OK'],['scoped',403,{error:{code:'insufficient_scope'}},'OK'],['revoked',401,{error:{code:'invalid_api_key'}},'Error'],['firewall',403,'Forbidden','Error'],['bad URL',200,'HTML','Error'],['outage',503,{error:{code:'unavailable'}},'Error']])test(`credential check: ${name}`,async()=>{let request;const result=await credentialTest.call({helpers:{request:async r=>(request=r,{statusCode,body})}},{data:{apiKey:'fixture',baseUrl:'https://api.ironfang.uk/renderwolf/'}});assert.equal(result.status,status);assert.equal(request.uri,'https://api.ironfang.uk/renderwolf/v1/usage');assert.equal(request.followRedirect,false);});

test('preserves problems wrapped by the real n8n authenticated helper', async()=>{
 const {NodeApiError}=require('n8n-workflow');
 const {output}=await run([{}],{continueOnFail:true,reply:()=>{
  const cause=new Error('HTTP 403');cause.response={status:403,headers:{'x-ironfang-request-id':'wrapped'},data:Buffer.from(JSON.stringify({error:{code:'insufficient_scope',message:'Missing render scope'}}))};
  throw new NodeApiError({name:'Ironfang',type:'ironfang',typeVersion:1.1,position:[0,0],parameters:{}},cause);
 }});
 assert.equal(output[0].json.error.code,'insufficient_scope');assert.equal(output[0].json.error.requestId,'wrapped');assert.equal(output[0].json.error.statusCode,403);
});
