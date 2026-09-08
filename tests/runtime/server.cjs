const http=require('node:http');const fs=require('node:fs');
const png=Buffer.from('89504e470d0a1a0a0000000049454e44','hex');
http.createServer(async(req,res)=>{let raw='';for await(const chunk of req)raw+=chunk;let body;try{body=JSON.parse(raw||'{}');}catch{res.writeHead(400);res.end();return;}
 if(req.headers.authorization!=='Bearer synthetic-runtime-key'){res.writeHead(401,{'content-type':'application/json'});res.end(JSON.stringify({error:{code:'invalid_api_key'}}));return;}
 fs.appendFileSync('/output/requests.jsonl',JSON.stringify({url:req.url,method:req.method,contentType:req.headers['content-type'],body})+'\n');
 const headers={'x-ironfang-request-id':'runtime-request','x-renderwolf-credits':'1','x-renderwolf-cache':'miss'};
 if(req.url.endsWith('/usage')||req.url.endsWith('/sign')){res.writeHead(200,{...headers,'content-type':'application/json'});res.end(JSON.stringify({limit:250,url:'https://example.com/signed'}));}
 else {res.writeHead(200,{...headers,'content-type':'image/png'});res.end(png);}
}).listen(8080,'0.0.0.0');
