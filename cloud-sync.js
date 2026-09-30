/* Remote persistence only wraps persist(), never persistDraft()/per-set edits. */
(function(){
  'use strict';
  const META='treinoCloudV1',ACCESS='treinoCloudAccessV1',GENDER='treinoStudentGenderV1';
  const copy=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
  const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback;}catch{return fallback;}}
  let meta=read(META,{base:null,pending:false}),key=localStorage.getItem(ACCESS)||'',busy=false,timer=null,waiting=null,conflict=null,blocked=false;
  const fragment=new URLSearchParams(location.hash.slice(1));if(fragment.get('chave')){key=fragment.get('chave');localStorage.setItem(ACCESS,key);}
  const localPersist=persist;let observed;
  function snapshot(){const d=copy(db);delete d.updatedAt;d.studentGenders=read(GENDER,{});return d;}
  function saveMeta(){localStorage.setItem(META,JSON.stringify(meta));}
  function status(text,kind=''){const el=document.getElementById('cloudStatus');el.textContent=text;el.dataset.state=kind;}
  const badge=document.createElement('button');badge.id='cloudStatus';badge.type='button';badge.textContent='Nuvem: verificando…';badge.setAttribute('aria-live','polite');document.querySelector('.app-shell').appendChild(badge);
  const style=document.createElement('style');style.textContent='#cloudStatus{display:block;margin:4px auto 12px;padding:6px 12px;background:transparent;color:var(--muted);font-size:10px;border:0;border-radius:9px}#cloudStatus[data-state="error"]{color:var(--red)}#cloudStatus[data-state="ok"]{color:var(--green)}body.workout-route #cloudStatus{display:none}.cloud-actions{display:grid;gap:8px;margin-top:16px}';document.head.appendChild(style);
  function safeApply(data){
    localStorage.setItem('treinoCloudLastLocalBackup',JSON.stringify({savedAt:Date.now(),data:snapshot()}));
    // Server data was written by this app; normalize on load, not while users edit inputs.
    db=normalizeDatabase(data);localStorage.setItem(GENDER,JSON.stringify(data.studentGenders||{}));localPersist();observed=snapshot();
    if(!live&&!['student','student-history'].includes(state.route))render();
    else if(!live&&state.studentId&&!studentById(state.studentId))navigate('home');
    else if(!live)render();
  }
  function canApply(){return !document.activeElement?.matches('input,textarea,select')&&($('#modalLayer').classList.contains('is-hidden')||!$('#modal').querySelector('input,textarea,select'));}
  async function request(method,body){const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),12000);try{const r=await fetch('./api/cloud',{method,headers:{Authorization:`Bearer ${key}`,...(body?{'Content-Type':'application/json'}:{})},cache:'no-store',signal:ctrl.signal,...(body?{body:JSON.stringify(body)}:{})});let v;try{v=await r.json();}catch{throw new Error('NOT_CONFIGURED');}if(!r.ok)throw new Error(v.error||String(r.status));return v;}finally{clearTimeout(timeout);}}
  function merge(base,local,remote,prefer){
    const conflicts=[];
    function one(b,l,r,path){if(equal(l,b))return copy(r);if(equal(r,b)||equal(l,r))return copy(l);if(l&&r&&b&&typeof l==='object'&&typeof r==='object'&&typeof b==='object'&&!Array.isArray(l)&&!Array.isArray(r)&&!Array.isArray(b)){const out={};for(const k of new Set([...Object.keys(b),...Object.keys(l),...Object.keys(r)])){if(['__proto__','constructor','prototype'].includes(k))continue;const v=one(b[k],l[k],r[k],path+'.'+k);if(v!==undefined)out[k]=v;}return out;}conflicts.push(path);return copy(prefer==='local'?l:r);}
    const out={};for(const k of new Set([...Object.keys(base||{}),...Object.keys(local),...Object.keys(remote)])){
      if(['students','programs','exercises','sessions'].includes(k)){const b=new Map((base?.[k]||[]).map(x=>[x.id,x])),l=new Map((local[k]||[]).map(x=>[x.id,x])),r=new Map((remote[k]||[]).map(x=>[x.id,x]));out[k]=[];for(const id of new Set([...r.keys(),...l.keys(),...b.keys()])){const v=one(b.get(id),l.get(id),r.get(id),k+'.'+id);if(v!==undefined)out[k].push(v);}}
      else if(k!=='updatedAt')out[k]=one(base?.[k],local[k],remote[k],k);
    }return {data:out,conflicts};
  }
  function schedule(delay=500){clearTimeout(timer);timer=setTimeout(()=>sync(),delay);}
  persist=function(){localPersist();const now=snapshot();if(!equal(observed,now)){observed=copy(now);meta.pending=true;saveMeta();status('Alterações aguardando nuvem');schedule();}};
  observed=snapshot();
  async function sync(prefer){
    if(busy)return;
    if(!key){status('Nuvem: abra seu link privado','error');return;}
    if(!navigator.onLine){status(meta.pending?'Sem conexão · alterações guardadas':'Sem conexão','error');return;}
    busy=true;blocked=false;status('Sincronizando…');
    try{
      for(let attempt=0;attempt<3;attempt++){
        const remote=await request('GET');if(remote.data&&!['students','programs','exercises','sessions'].every(k=>Array.isArray(remote.data[k])))throw new Error('INVALID_DATA');
        if(!canApply()){waiting=true;status('Nuvem disponível · finalizando edição');return;}
        waiting=false;const local=snapshot();let candidate;
        if(!remote.data)candidate=local;
        else if(!meta.base){
          // A new device must not push an old local database over an existing cloud.
          if(local.students.length||local.sessions.length||meta.pending){conflict={initial:true,remote};status('Nuvem: escolher dados iniciais','error');return;}
          candidate=remote.data;
        }else{const merged=merge(meta.base,local,remote.data,prefer);if(merged.conflicts.length&&!prefer){conflict={initial:false,remote};status('Nuvem: revisar alterações simultâneas','error');return;}candidate=merged.data;}
        if(remote.data&&equal(candidate,remote.data)){
          if(!equal(local,candidate))safeApply(candidate);meta={base:copy(candidate),pending:false};saveMeta();conflict=null;status('Salvo na nuvem','ok');return;
        }
        const sending=copy(local);
        let saved;try{saved=await request('PUT',{revision:remote.revision,data:candidate});}catch(e){if(e.message==='CONFLICT')continue;throw e;}
        // Edits made while the request was in flight stay pending and are rebased next time.
        meta.base=copy(sending);meta.pending=!equal(snapshot(),sending);saveMeta();conflict=null;
        if(!meta.pending){if(canApply()){if(!equal(snapshot(),candidate))safeApply(candidate);meta.base=copy(candidate);saveMeta();}else{waiting=true;schedule(800);}}
        status(meta.pending?'Novas alterações aguardando nuvem':'Salvo na nuvem',meta.pending?'':'ok');if(meta.pending)schedule();return;
      }
      throw new Error('CONFLICT');
    }catch(e){blocked=true;const labels={NOT_CONFIGURED:'Nuvem: ativação pendente',PRIVATE_LINK_REQUIRED:'Nuvem: link privado inválido',TOO_LARGE:'Nuvem: limite do arquivo atingido',INVALID_DATA:'Nuvem: dados inválidos',CONFLICT:'Nuvem ocupada · tentando novamente'};status(labels[e.message]||(meta.pending?'Falha na nuvem · alterações guardadas':'Nuvem indisponível'), 'error');if(!['NOT_CONFIGURED','PRIVATE_LINK_REQUIRED','TOO_LARGE','INVALID_DATA'].includes(e.message))schedule(15000);
    }finally{busy=false;}
  }
  badge.onclick=()=>{
    if(conflict){const initial=conflict.initial;openModal(`<h2>${initial?'Dados deste aparelho e da nuvem':'Alterações em dois aparelhos'}</h2><p class="modal-sub">${initial?'Já existem dados na nuvem. Sua cópia local será preservada antes de continuar.':'O mesmo registro foi alterado em dois aparelhos. Escolha qual versão manter para os campos em conflito. As demais alterações serão combinadas.'}</p><div class="cloud-actions"><button class="btn btn-primary" id="cloudRemote">Usar dados da nuvem</button><button class="btn btn-secondary" id="cloudLocal">${initial?'Combinar com este aparelho':'Manter alterações deste aparelho'}</button><button class="btn btn-secondary" id="cloudCancel">Decidir depois</button></div>`);
      $('#cloudCancel').onclick=closeModal;
      $('#cloudRemote').onclick=()=>{const r=conflict.remote;closeModal();if(initial){safeApply(r.data);meta={base:copy(r.data),pending:false};saveMeta();conflict=null;schedule(0);}else sync('remote');};
      $('#cloudLocal').onclick=()=>{const r=conflict.remote;closeModal();if(initial){meta.base={students:[],programs:[],exercises:[],sessions:[]};saveMeta();}sync('local');};return;
    }
    if(!key||blocked){openModal('<h2>Salvamento em nuvem</h2><p class="modal-sub">'+(!key?'Abra o link privado do seu app neste aparelho. Ele libera a sincronização sem cadastro ou tela de login.':'A nuvem ainda não respondeu. Os dados deste aparelho estão preservados. A configuração da Vercel precisa estar ativa.')+'</p><div class="modal-actions"><button class="btn btn-primary" id="cloudRetry">Tentar novamente</button></div>');$('#cloudRetry').onclick=()=>{closeModal();sync();};}else sync();
  };
  const close=closeModal;closeModal=function(){close();if(waiting)schedule(100);};
  document.addEventListener('focusout',()=>{if(waiting)schedule(300);});
  window.addEventListener('online',()=>schedule(0));document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(0);});
  // Single local database shared by tabs: reload it before sending from another tab.
  window.addEventListener('storage',e=>{if(e.key===DB_KEY||e.key===META){if(canApply()&&!live){db=loadDatabase();meta=read(META,meta);observed=snapshot();render();schedule();}}});
  setInterval(()=>{if(!document.hidden&&!conflict)sync();},30000);
  window.TreinoCloud={sync,merge};
  schedule(0);
})();
