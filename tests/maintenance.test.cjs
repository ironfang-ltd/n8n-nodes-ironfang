const test=require('node:test');const assert=require('node:assert/strict');
const {run,payload}=require('./context.cjs');
const {credentialTest}=require('../dist/nodes/Ironfang/credentialTest.js');
for(const version of [1,1.1,1.2,2]) {
 test(`all operations preserve inputs, binary and linking in node v${version}`,async()=>{
  const ops=['screenshot','pdf','image','video','sign','usage'];const {ctx,output}=await run(ops.map(operation=>({operation})),{version});
  assert.equal(output.length,6);output.forEach((x,i)=>assert.deepEqual(x.pairedItem,{item:i}));
  for(const x of output.slice(0,4)){assert.equal(x.json.byteLength,payload.length);assert.equal(x.json.bytes,version===1?`${payload.length} B`:payload.length);assert.deepEqual(Buffer.from(x.binary.data.data,'base64'),payload);assert.equal(x.json._ironfang.meter,'render.screenshot');assert.equal(x.json._ironfang.quantity,0);assert(!('creditsCharged' in x.json._ironfang));assert.equal(x.json._ironfang.requestId,'fixture-request');}
  assert.equal(output[4].json.url,'https://api.ironfang.com/signed-fixture');assert.equal(output[5].json.meters[0].id,'render.screenshot');
  assert(ctx.requests.every(r=>r.returnFullResponse&&r.disableFollowRedirect&&r.timeout>0));
  assert(!('font_size' in ctx.requests[3].body));
 });
 test(`continued error keeps version ${version} contract`,async()=>{
  const {output}=await run([{},{}],{version,continueOnFail:true,reply:(req,i)=>{if(i===0){const e=new Error('HTTP 429');e.response={status:429,headers:{'retry-after':'60','x-ironfang-request-id':'failed-request'},data:Buffer.from(JSON.stringify({error:{code:'rate_limited',message:'Wait before retrying'}}))};throw e;}return {body:payload,headers:{},statusCode:200};}});
  assert.equal(output.length,2);assert.equal(output[0].json._ironfang.code,'rate_limited');assert.equal(output[0].json._ironfang.retryAfterSeconds,60);assert.equal(output[0].json._ironfang.requestId,'failed-request');assert.equal(typeof output[0].json.error,version===1?'string':'object');assert.deepEqual(output[1].pairedItem,{item:1});
 });
}
for(const [baseUrl,expected] of [['https://api.ironfang.com','https://api.ironfang.com/v1/screenshot'],['https://api.ironfang.com/renderwolf///','https://api.ironfang.com/render/v1/screenshot'],['https://api.ironfang.com/render','https://api.ironfang.com/render/v1/screenshot']]) test(`base URL ${baseUrl}`,async()=>{const {ctx}=await run([{}],{baseUrl});assert.equal(ctx.requests[0].url,expected);});
for(const format of ['png','jpeg','webp'])test(`screenshot ${format} and HTML map correctly`,async()=>{const {ctx,output}=await run([{source:'html',screenshotOptions:{format,device:'mobile'}}]);assert.equal(ctx.requests[0].body.html,'<p>fixture</p>');assert(!('url' in ctx.requests[0].body));assert.equal(ctx.requests[0].body.device,'mobile');assert.equal(output[0].binary.data.mimeType,'image/'+format);});
for(const templateId of ['../sign','a/b','id?x=1','id#fragment',''])test(`rejects template path ${JSON.stringify(templateId)}`,async()=>{await assert.rejects(run([{operation:'image',templateId}]),e=>e.constructor.name==='NodeOperationError'&&e.context.itemIndex===0);});
test('error identifies second input',async()=>{await assert.rejects(run([{},{}],{reply:(req,i)=>{if(i===1)throw new Error('failed');return {body:payload,headers:{},statusCode:200};}}),e=>e.context.itemIndex===1);});
test('refuses an empty output binary property',async()=>{await assert.rejects(run([{binaryProperty:''}]),/Output binary field/);});
for(const [name,statusCode,body,status] of [['usage',200,{product:'render',meters:[]},'OK'],['unmetered',200,{unmetered:true},'OK'],['retired usage shape',200,{limit:250},'Error'],['account not linked',403,{error:{code:'account_not_linked'}},'Error'],['scoped',403,{error:{code:'insufficient_scope'}},'OK'],['revoked',401,{error:{code:'invalid_api_key'}},'Error'],['firewall',403,'Forbidden','Error'],['bad URL',200,'HTML','Error'],['outage',503,{error:{code:'unavailable'}},'Error']])test(`credential check: ${name}`,async()=>{let request;const result=await credentialTest.call({helpers:{request:async r=>(request=r,{statusCode,body})}},{data:{testProduct:'renderwolf',apiKey:'fixture',baseUrl:'https://api.ironfang.com/renderwolf/'}});assert.equal(result.status,status);assert.equal(request.uri,'https://api.ironfang.com/render/v1/usage');assert.equal(request.followRedirect,false);});

test('preserves problems wrapped by the real n8n authenticated helper', async()=>{
 const {NodeApiError}=require('n8n-workflow');
 const {output}=await run([{}],{continueOnFail:true,reply:()=>{
  const cause=new Error('HTTP 403');cause.response={status:403,headers:{'x-ironfang-request-id':'wrapped'},data:Buffer.from(JSON.stringify({error:{code:'insufficient_scope',message:'Missing render scope'}}))};
  throw new NodeApiError({name:'Ironfang',type:'ironfang',typeVersion:1.1,position:[0,0],parameters:{}},cause);
 }});
 assert.equal(output[0].json.error.code,'insufficient_scope');assert.equal(output[0].json.error.requestId,'wrapped');assert.equal(output[0].json.error.statusCode,403);
});

test('billing refusals keep their code, product, meter, renewal and retry information', async()=>{
 const refusals=[
  [429,{},{error:{code:'free_allowance_exhausted',message:"This month's free allowance is used up. Enable paid usage in Billing to continue.",docs:'https://ironfang.com/render/docs#errors',product:'render',meter:'render.screenshot',reset_at:'2026-10-01T00:00:00Z'},request_id:'refused-0'}],
  [503,{'retry-after':'30'},{error:{code:'billing_temporarily_unavailable',message:'Billing is briefly unavailable. Try again shortly.',product:'render',meter:'render.pdf'}}],
  [402,{},{type:'https://ironfang.com/finance/problems/payment_required',status:402,code:'payment_required',detail:'Paid usage needs a working payment method. Update it in Billing.',billing:{product:'finance',meter:'finance.validation'}}],
  [429,{},{error:{code:'free_allowance_exhausted',message:'Used up',product:'Render API',meter:'../usage',reset_at:'next month'}}],
 ];
 const reply=(req,i)=>{const [status,headers,body]=refusals[i];const e=new Error('HTTP '+status);e.response={status,headers:{'x-ironfang-request-id':'refused-'+i,...headers},data:Buffer.from(JSON.stringify(body))};throw e;};
 const {output}=await run(refusals.map(()=>({})),{continueOnFail:true,reply});
 assert.deepEqual(output[0].json._ironfang,{message:"This month's free allowance is used up. Enable paid usage in Billing to continue.",itemIndex:0,code:'free_allowance_exhausted',statusCode:429,requestId:'refused-0',product:'render',meter:'render.screenshot',resetAt:'2026-10-01T00:00:00Z'});
 assert.deepEqual(output[1].json._ironfang,{message:'Billing is briefly unavailable. Try again shortly.',itemIndex:1,code:'billing_temporarily_unavailable',statusCode:503,requestId:'refused-1',retryAfterSeconds:30,product:'render',meter:'render.pdf'});
 assert.deepEqual(output[2].json._ironfang,{message:'Paid usage needs a working payment method. Update it in Billing.',itemIndex:2,code:'payment_required',statusCode:402,requestId:'refused-2',product:'finance',meter:'finance.validation'});
 for(const field of ['product','meter','resetAt'])assert(!(field in output[3].json._ironfang),field);
 await assert.rejects(run([{}],{reply}),e=>e.context.ironfang.code==='free_allowance_exhausted'&&e.context.ironfang.resetAt==='2026-10-01T00:00:00Z'&&/free allowance is used up/.test(e.description));
});
