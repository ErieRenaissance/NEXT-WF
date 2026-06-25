let openPhase = null;

function buildPipeline(){
  const pipe = document.getElementById('pipeline');
  PHASES.forEach((ph,i)=>{
    let tags='';
    ph.qg.forEach(q=>tags+=`<span class="ptag ptag-qg">${q}</span>`);
    ph.ae.forEach(a=>tags+=`<span class="ptag ptag-ae">${a}</span>`);
    const card = document.createElement('div');
    card.className='pipe-phase';
    card.innerHTML=`<div class="pipe-card" data-id="${ph.id}"><div class="pipe-letter">${ph.id}</div><div class="pipe-name">${ph.name}</div><div class="pipe-tags">${tags}</div></div>`;
    card.querySelector('.pipe-card').addEventListener('click',()=>togglePhase(ph.id));
    pipe.appendChild(card);
    if(i<PHASES.length-1){
      const arr=document.createElement('div');
      arr.className='pipe-arrow';
      arr.textContent='›';
      pipe.appendChild(arr);
    }
  });
}

function togglePhase(id){
  const detail=document.getElementById('phaseDetail');
  if(openPhase===id){
    openPhase=null;
    detail.style.display='none';
    document.querySelectorAll('.pipe-card').forEach(c=>c.classList.remove('active'));
    return;
  }
  openPhase=id;
  document.querySelectorAll('.pipe-card').forEach(c=>{
    c.classList.toggle('active',c.dataset.id===id);
  });
  const ph=PHASES.find(p=>p.id===id);
  let tags='';
  ph.qg.forEach(q=>tags+=`<span class="pd-tag qg">${q}</span>`);
  ph.ae.forEach(a=>tags+=`<span class="pd-tag ae">${a}</span>`);
  let sps='';
  ph.subprocs.forEach(sp=>{
    const aeTag=sp.ae?`<span class="pd-sp-ae">${sp.ae}</span>`:'';
    sps+=`<div class="pd-sp ${sp.cls}"><div class="pd-sp-header"><span class="pd-sp-id">${sp.id}</span><span class="pd-sp-badge ${sp.badgeCls}">${sp.badge}</span>${aeTag}</div><div class="pd-sp-desc"><strong style="font-size:12px">${sp.name}</strong> — ${sp.desc}</div></div>`;
  });
  detail.style.display='block';
  detail.innerHTML=`
    <div class="pd-header">
      <div class="pd-letter">${ph.id}</div>
      <div class="pd-info"><div class="pd-name">${ph.name}</div><div class="pd-tags">${tags}</div></div>
    </div>
    <div class="pd-body">
      <div class="pd-io"><div class="pd-io-label">Phase Input</div><div class="pd-io-text">${ph.input}</div></div>
      <div class="pd-io"><div class="pd-io-label">Phase Output</div><div class="pd-io-text">${ph.output}</div></div>
    </div>
    <div class="pd-subprocs">
      <div class="pd-sp-title">L2 Subprocesses</div>
      <div class="pd-sp-grid">${sps}</div>
    </div>`;
  detail.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function buildAE(){
  const tbody=document.getElementById('aeBody');
  AE_DATA.forEach(ae=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td><span class="ae-id">${ae.id}</span></td><td>${ae.name}</td><td><span class="ae-phase">${ae.phase}</span></td><td>${ae.change}</td>`;
    tbody.appendChild(tr);
  });
}

function buildCL(){
  const grid=document.getElementById('clGrid');
  CL_DATA.forEach(cl=>{
    const card=document.createElement('div');
    card.className='cl-card'+(cl.cls?' '+cl.cls:'');
    card.innerHTML=`
      <div class="cl-num">${cl.num}</div>
      <div class="cl-name">${cl.name}</div>
      <span class="cl-badge ${cl.badgeCls}">${cl.badge}</span>
      <div class="cl-row"><div class="cl-key">Sensor</div><div class="cl-val">${cl.sensor}</div></div>
      <div class="cl-row"><div class="cl-key">Variable</div><div class="cl-val">${cl.variable}</div></div>
      <div class="cl-row"><div class="cl-key">Point</div><div class="cl-val">${cl.point}</div></div>
      <div class="cl-row"><div class="cl-key">Mechanism</div><div class="cl-val">${cl.mechanism}</div></div>`;
    grid.appendChild(card);
  });
}

function buildHITL(){
  const tbody=document.getElementById('hitlBody');
  HITL_DATA.forEach(h=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${h.activity}</td><td style="color:var(--dim)">${h.reason}</td>`;
    tbody.appendChild(tr);
  });
}

function buildSafety(){
  const tbody=document.getElementById('safetyBody');
  SAFETY_DATA.forEach(s=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td><strong>${s.interlock}</strong></td><td class="si-trigger">${s.trigger}</td><td>${s.action}</td>`;
    tbody.appendChild(tr);
  });
}

function buildAutoList(){
  const el=document.getElementById('autoList');
  el.innerHTML=AUTO_LIST.map(a=>`• ${a}`).join('<br>');
}

/* ===== CRAWL / WALK / RUN PHASING ===== */

// status per phase: 'man' = manual, 'sup' = supervised, 'auto' = autonomous. who = NEXT or Customer.

let cwrPhase = 'crawl';
let cwrView = 'all';   // all | autonomous | supervised | manual | sup_auto
let ROWMAP = {};

function cwrEmph(st){
  if(cwrView==='all')        return st!=='man';
  if(cwrView==='manual')     return st==='man';
  if(cwrView==='supervised') return st==='sup';
  if(cwrView==='autonomous') return st==='auto';
  if(cwrView==='sup_auto')   return st==='sup' || st==='auto';
  return true;
}

function buildPhasing(){
  PHASING.forEach(g=>g.rows.forEach(r=>ROWMAP[r.id]=r));

  const tabs=document.getElementById('cwrTabs');
  tabs.innerHTML=['crawl','walk','run'].map(p=>{
    const m=PHASE_META[p];
    return `<button class="cwr-tab${p===cwrPhase?' active':''}" data-ph="${p}">
      <div class="cwr-tab-top"><span class="cwr-tab-name">${m.name}</span><span class="cwr-tab-phase">${m.phase} · ${m.tag}</span></div>
      <div class="cwr-tab-sub">${m.headline}</div>
    </button>`;
  }).join('');
  tabs.querySelectorAll('.cwr-tab').forEach(b=>b.addEventListener('click',()=>{cwrPhase=b.dataset.ph;renderPhasing();}));

  const body=document.getElementById('cwrBody');
  body.innerHTML=PHASING.map(grp=>{
    const rows=grp.rows.map(r=>`
      <div class="cwr-row" data-id="${r.id}">
        <div class="cwr-row-id">${r.id}</div>
        <div class="cwr-row-mid">
          <div class="cwr-row-name">${r.name}</div>
          <div class="cwr-row-note">${r.note}</div>
          <div class="cwr-row-tags">
            <span class="cwr-actor ${r.who==='Customer'?'cust':'next'}">${r.who}</span>
            <span class="cwr-cat">${r.cat}</span>
          </div>
        </div>
        <div class="cwr-badge-col">
          <span class="cwr-badge"></span>
          <button class="cwr-info" data-id="${r.id}" title="Why is this supervised?" style="display:none">i</button>
        </div>
      </div>`).join('');
    return `<div class="cwr-group"><div class="cwr-group-head">${grp.g}</div>${rows}</div>`;
  }).join('');

  body.addEventListener('click',e=>{
    const btn=e.target.closest('.cwr-info');
    if(btn) openCwrModal(ROWMAP[btn.dataset.id]);
  });

  document.querySelectorAll('#cwrSeg button').forEach(b=>b.addEventListener('click',()=>{
    cwrView=b.dataset.v;
    document.querySelectorAll('#cwrSeg button').forEach(x=>x.classList.toggle('on',x.dataset.v===cwrView));
    renderPhasing();
  }));

  const modal=document.getElementById('cwrModal');
  document.getElementById('cwrModalX').addEventListener('click',closeCwrModal);
  modal.addEventListener('click',e=>{if(e.target===modal)closeCwrModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCwrModal();});

  renderPhasing();
}

function openCwrModal(r){
  if(!r||!r.supRsn) return;
  document.getElementById('cwrModalTitle').textContent=r.id+'  '+r.name;
  document.getElementById('cwrModalBody').textContent=r.supRsn;
  const phs=['crawl','walk','run'].filter(p=>r[p]==='sup').map(p=>PHASE_LABEL[p]);
  document.getElementById('cwrModalFoot').textContent=phs.length?('Supervised in: '+phs.join(', ')):'';
  document.getElementById('cwrModal').classList.add('open');
}
function closeCwrModal(){document.getElementById('cwrModal').classList.remove('open');}

function renderPhasing(){
  document.querySelectorAll('.cwr-tab').forEach(b=>b.classList.toggle('active',b.dataset.ph===cwrPhase));
  const counts={man:0,sup:0,auto:0};
  document.querySelectorAll('.cwr-row').forEach(el=>{
    const r=ROWMAP[el.dataset.id];
    const st=r[cwrPhase];
    counts[st]++;
    const pos=(st==='auto'||st==='sup');
    el.classList.remove('st-pos','st-man','emph','dim');
    el.classList.add(pos?'st-pos':'st-man');
    el.classList.add(cwrEmph(st)?'emph':'dim');
    const badge=el.querySelector('.cwr-badge');
    badge.className='cwr-badge '+(pos?'b-pos':'b-man');
    badge.textContent=CWR_BADGE[st];
    const info=el.querySelector('.cwr-info');
    info.style.display=(st==='sup'&&r.supRsn)?'flex':'none';
  });
  const m=PHASE_META[cwrPhase];
  const human=counts.man+counts.sup;
  const tot=counts.man+counts.sup+counts.auto;
  document.getElementById('cwrBanner').innerHTML=`
    <div class="cwr-banner-l">
      <div class="cwr-banner-name">${m.name} <span class="cwr-banner-rev">${m.phase} · ${m.tag}</span></div>
      <div class="cwr-banner-desc">${m.desc} <strong style="color:var(--ink2)">${human} of ${tot} activities still involve a human at this phase.</strong></div>
    </div>
    <div class="cwr-stats">
      <div class="cwr-stat auto"><div class="cwr-stat-num">${counts.auto}</div><div class="cwr-stat-lbl">Autonomous</div></div>
      <div class="cwr-stat sup"><div class="cwr-stat-num">${counts.sup}</div><div class="cwr-stat-lbl">Supervised</div></div>
      <div class="cwr-stat man"><div class="cwr-stat-num">${counts.man}</div><div class="cwr-stat-lbl">Manual</div></div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', function(){
  buildPipeline();
  buildAE();
  buildCL();
  buildHITL();
  buildSafety();
  buildAutoList();
  buildPhasing();
});
