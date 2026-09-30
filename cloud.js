'use strict';
const {timingSafeEqual}=require('node:crypto');
const DATA_KEY='treino:database:v1';
const MAX_BYTES=3500000;
const CAS=`local raw=redis.call('GET',KEYS[1]); local rev=0; if raw then rev=cjson.decode(raw).revision end; if rev~=tonumber(ARGV[1]) then return 0 end; redis.call('SET',KEYS[1],ARGV[2]); return 1`;
function authorized(req){const expected=process.env.TREINO_ACCESS_KEY||'';const got=(req.headers.authorization||'').replace(/^Bearer /,'');return expected.length>=32&&Buffer.byteLength(got)===Buffer.byteLength(expected)&&timingSafeEqual(Buffer.from(got),Buffer.from(expected));}
function valid(data){if(!data||typeof data!=='object'||Array.isArray(data))return false;return ['students','programs','exercises','sessions'].every(k=>Array.isArray(data[k])&&data[k].every(r=>r&&typeof r==='object'&&typeof r.id==='string'&&r.id.length>0)&&new Set(data[k].map(r=>r.id)).size===data[k].length);}
async function redis(command){const url=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL;const token=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;const response=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error('STORAGE');const result=await response.json();if(result.error)throw new Error('STORAGE');return result.result;}
module.exports=async function(req,res){
  res.setHeader('Cache-Control','private, no-store, max-age=0');res.setHeader('Vary','Authorization');res.setHeader('X-Content-Type-Options','nosniff');
  if(!['GET','PUT'].includes(req.method)){res.setHeader('Allow','GET, PUT');return res.status(405).json({error:'METHOD'});}
  if(!process.env.TREINO_ACCESS_KEY||!(process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL)||!(process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN))return res.status(503).json({error:'NOT_CONFIGURED'});
  if(!authorized(req))return res.status(401).json({error:'PRIVATE_LINK_REQUIRED'});
  try{
    if(req.method==='GET'){const raw=await redis(['GET',DATA_KEY]);return res.status(200).json(raw?JSON.parse(raw):{revision:0,data:null});}
    let body=req.body;if(typeof body==='string'){if(Buffer.byteLength(body)>MAX_BYTES)return res.status(413).json({error:'TOO_LARGE'});try{body=JSON.parse(body);}catch{return res.status(400).json({error:'INVALID_JSON'});}}
    if(!Number.isSafeInteger(body?.revision)||body.revision<0||!valid(body?.data))return res.status(400).json({error:'INVALID_DATA'});
    const saved={revision:body.revision+1,updatedAt:Date.now(),data:body.data};const raw=JSON.stringify(saved);if(Buffer.byteLength(raw)>MAX_BYTES)return res.status(413).json({error:'TOO_LARGE'});
    if(!await redis(['EVAL',CAS,1,DATA_KEY,body.revision,raw]))return res.status(409).json({error:'CONFLICT'});
    return res.status(200).json({revision:saved.revision,updatedAt:saved.updatedAt});
  }catch{return res.status(503).json({error:'STORAGE_UNAVAILABLE'});}
};
