// Core project-management logic: scheduling, EVM, change control, validation, unit tests.
// Shared by the browser (index.html) and Node (server.js, tests).
const D=s=>Math.round(Date.parse(s+'T00:00:00Z')/864e5),F=n=>new Date(n*864e5).toISOString().slice(0,10),M=n=>'PKR '+Math.round(n).toLocaleString('en-US');
const sum=(a,k)=>a.reduce((s,x)=>s+(+x[k]||0),0),f2=x=>x==null?'n/a':x.toFixed(2);
const T=(id,name,owner,start,dur,dep,cost,actual,pct,req)=>({id,name,owner,start,dur,dep,cost,actual,pct,req});
const seed=()=>({
 charter:{name:'Smart Healthcare Project Management System',objectives:'Deliver appointments, lab reports, doctor schedules, online consultations and billing for five hospitals within 16 weeks.',stakeholders:'Hospital management (sponsor), doctors, patients, lab staff, finance department',inScope:'Appointments, lab reports, doctor schedules, online consultations, billing',outScope:'Hardware procurement, hospital network upgrades',budget:5000000,start:'2026-07-06',deadline:'2026-10-25',status:'Execution',statusDate:'2026-09-14',closure:'',plan:{scope:'Only approved requirements (R1-R5) are in scope; changes go through change control.',schedule:'16 weeks, 11 work packages, finish-to-start dependencies.',cost:'Budget PKR 5,000,000; EVM reviewed weekly (CPI/SPI threshold 0.90).',quality:'Every deliverable inspected against the checklist; critical defects block release.'}},
 th:{cpi:.9,spi:.9},
 team:[['Project Manager','Planning, control, reporting'],['Backend Dev 1','Appointments, billing'],['Backend Dev 2','Labs, consultations'],['Frontend Dev 1','Patient UI'],['Frontend Dev 2','Doctor/admin UI'],['Database Dev','Schema, queries'],['QA Engineer','Testing, defects']].map((x,i)=>({id:'M'+(i+1),name:x[0],resp:x[1]})),
 milestones:[['Requirements baseline','2026-07-19'],['Core modules complete','2026-08-30'],['Integration complete','2026-10-04'],['Go-live','2026-10-25']].map((x,i)=>({id:'MS'+(i+1),name:x[0],date:x[1],done:i<1?'Yes':'No'})),
 reqs:[['Appointment management','High','Approved'],['Laboratory reports','High','Approved'],['Doctor schedules','High','Approved'],['Online consultations','Medium','Approved'],['Hospital billing','High','Approved'],['AI-based preliminary diagnosis','High','Proposed'],['Mobile application','Medium','Proposed']].map((x,i)=>({id:'R'+(i+1),title:x[0],pri:x[1],status:x[2]})),
 crs:[{id:'CR1',title:'Add AI diagnosis module and mobile app',why:'Hospital management request during development',cost:800000,days:21,reqs:['R6','R7'],status:'Pending'}],
 tasks:[T('T1','Requirements analysis','Project Manager','2026-07-06',14,[],300000,320000,100,''),T('T2','Database design','Database Dev','2026-07-06',14,['T1'],350000,380000,100,''),T('T3','Appointment module','Backend Dev 1','2026-07-06',28,['T2'],700000,820000,85,'R1'),T('T4','Doctor schedule module','Backend Dev 2','2026-07-06',21,['T2'],500000,540000,100,'R3'),T('T5','Lab report module','Backend Dev 2','2026-07-06',21,['T2'],500000,520000,100,'R2'),T('T6','Online consultation module','Backend Dev 2','2026-07-06',28,['T3'],650000,150000,20,'R4'),T('T7','Billing module','Backend Dev 1','2026-07-06',21,['T3'],500000,60000,10,'R5'),T('T8','Frontend UI','Frontend Dev 1','2026-07-06',42,['T2'],700000,650000,90,'R1'),T('T9','Integration','Frontend Dev 2','2026-07-06',14,['T3','T4','T5','T7','T8'],300000,0,0,''),T('T10','QA testing','QA Engineer','2026-07-06',14,['T9','T6'],350000,0,0,''),T('T11','Deployment and training','Project Manager','2026-07-06',7,['T10'],150000,0,0,'')],
 defects:[['Overlapping appointment slots accepted','Appointments','Critical','Backend Dev 1','Open'],['Duplicate patient records created','Patient records','Critical','Backend Dev 2','In Progress'],['Lab report date format wrong','Lab reports','Low','Frontend Dev 2','Resolved']].map((x,i)=>({id:'D'+(i+1),title:x[0],mod:x[1],sev:x[2],who:x[3],status:x[4]})),
 checks:[['Appointments','Prevents double booking','Fail'],['Appointments','Sends confirmation','Pass'],['Lab reports','Results linked to patient','Pass'],['Billing','Totals match services','Pending'],['Patient records','No duplicate IDs','Fail']].map((x,i)=>({id:'Q'+(i+1),deliv:x[0],item:x[1],result:x[2],note:''})),
 risks:[['Scope creep from new hospital requests',5,4,'Enforce change control','Re-baseline schedule and budget'],['Critical defects delay release',4,5,'Early QA and code reviews','Add developer capacity to fixes'],['Backend developer unavailable',2,4,'Cross-train team','Reassign to other backend dev'],['Hospital data migration errors',3,4,'Dry-run migrations','Roll back and re-import']].map((x,i)=>({id:'K'+(i+1),desc:x[0],lik:x[1],imp:x[2],prev:x[3],corr:x[4]}))
});
function run(tasks,bE,st){const m={},S={},E={},V={};tasks.forEach(t=>m[t.id]=t);
 const go=t=>{if(E[t.id]!=null)return;if(V[t.id])throw Error('Circular dependency involving '+t.id);V[t.id]=1;let s=D(t.start);
  t.dep.forEach(i=>{const p=m[i];if(p){go(p);s=Math.max(s,E[p.id]+1)}});let e=s+t.dur-1;
  if(bE&&t.pct<100&&bE[t.id]<st)e=Math.max(e,st+Math.ceil(t.dur*(1-t.pct/100)));S[t.id]=s;E[t.id]=e};
 tasks.forEach(go);return{S,E}}
function evm(tasks,B,st){let pv=0,e=0,ac=0,bac=0;tasks.forEach(t=>{bac+=t.cost;pv+=t.cost*Math.min(1,Math.max(0,(st-B.S[t.id]+1)/t.dur));e+=t.cost*t.pct/100;ac+=t.actual});
 const cpi=ac?e/ac:null,spi=pv?e/pv:null;return{bac,pv,ev:e,ac,cpi,spi,cv:e-ac,sv:e-pv,eac:cpi?bac/cpi:bac}}
function calc(db){const c=db.charter,ap=db.crs.filter(x=>x.status==='Approved'),st=D(c.statusDate);
 const B=run(db.tasks,null),Fc=run(db.tasks,B.E,st),E=evm(db.tasks,B,st);
 const budget=+c.budget+sum(ap,'cost'),dl=D(c.deadline)+sum(ap,'days'),fin=Math.max(...db.tasks.map(t=>Fc.E[t.id]));
 const delayed=db.tasks.filter(t=>t.pct<100&&B.E[t.id]<st).map(t=>({...t,days:Fc.E[t.id]-B.E[t.id],imp:db.tasks.filter(u=>u.dep.includes(t.id)).map(u=>u.id)}));
 const impacted=db.tasks.filter(t=>Fc.S[t.id]>B.S[t.id]).map(t=>t.id);
 const crit=db.defects.filter(d=>d.sev==='Critical'&&!['Resolved','Closed'].includes(d.status));
 const W=[];if(E.cpi!=null&&E.cpi<db.th.cpi)W.push(['c','Cost overrun: CPI '+f2(E.cpi)+' is below threshold '+db.th.cpi]);
 if(E.spi!=null&&E.spi<db.th.spi)W.push(['c','Schedule deviation: SPI '+f2(E.spi)+' is below threshold '+db.th.spi]);
 if(fin>dl)W.push(['c','Forecast finish '+F(fin)+' is '+(fin-dl)+' days after approved deadline '+F(dl)]);
 if(E.bac>budget)W.push(['c','Planned cost '+M(E.bac)+' exceeds approved budget '+M(budget)]);
 if(E.eac>budget)W.push(['w','Estimate at completion '+M(E.eac)+' exceeds approved budget']);
 if(crit.length)W.push(['c',crit.length+' unresolved critical defect(s)']);
 const pend=db.crs.filter(x=>x.status==='Pending');if(pend.length)W.push(['w',pend.length+' change request(s) awaiting decision']);
 return{B,Fc,E,budget,dl,fin,delayed,impacted,crit,W,pend}}
function applyCR(db,id){const cr=db.crs.find(x=>x.id===id);if(!cr||cr.status!=='Pending')throw Error('Only pending change requests can be approved');
 if(!cr.reqs.length)throw Error('Link at least one requirement to the change request');
 const n=cr.reqs.length,ig=db.tasks.find(t=>/integration/i.test(t.name)),qa=db.tasks.find(t=>/qa/i.test(t.name)),nt=cr.reqs.map((r,i)=>T('T'+(50+db.tasks.length+i),'Implement '+db.reqs.find(q=>q.id===r).title,'Backend Dev 1',db.charter.start,Math.ceil(cr.days/n),ig?[ig.id]:[],cr.cost/n,0,0,r));
 return{...db,crs:db.crs.map(x=>x.id===id?{...x,status:'Approved'}:x),reqs:db.reqs.map(r=>cr.reqs.includes(r.id)?{...r,status:'Approved'}:r),tasks:[...db.tasks.map(t=>qa&&t.id===qa.id?{...t,dep:[...t.dep,...nt.map(x=>x.id)]}:t),...nt]}}
const num=(k,v)=>{v=Math.max(0,+v||0);return k==='pct'?Math.min(100,v):k==='dur'?Math.max(1,v):k==='lik'||k==='imp'?Math.min(5,Math.max(1,v)):v};
const uid=p=>p+Date.now().toString(36).slice(-4);
function tests(){const R=[],t=(n,e,a)=>R.push([n,String(e),String(a),String(e)===String(a)]),s=seed();
 const A=[T('A','A','x','2026-01-01',10,[],1000,600,50,'')],bA=run(A,null),e1=evm(A,bA,D('2026-01-04'));
 t('EVM: PV at 40% elapsed of 1000 = 400',400,e1.pv);t('EVM: EV at 50% complete = 500',500,e1.ev);t('EVM: CPI = EV/AC = 500/600',(500/600).toFixed(3),e1.cpi.toFixed(3));t('EVM: SPI = EV/PV = 500/400',1.25,e1.spi);
 const d=run([T('A','a','x','2026-01-01',5,[],0,0,0,''),T('B','b','x','2026-01-01',3,['A'],0,0,0,'')],null);t('Dependency: B starts day after A ends','2026-01-06',F(d.S.B));
 let err='none';try{run([T('A','a','x','2026-01-01',5,['B'],0,0,0,''),T('B','b','x','2026-01-01',3,['A'],0,0,0,'')],null)}catch(e){err='detected'}t('Circular dependency is rejected','detected',err);
 const c0=calc(s);t('Seed baseline cost = approved budget',5000000,c0.E.bac);t('Delayed tasks found at status date (T3, T8)','T3,T8',c0.delayed.map(x=>x.id).join());t('Delay of T3 impacts successors','T6,T7,T9',c0.delayed[0].imp.join());
 t('Forecast finish is later than baseline',true,c0.fin>D('2026-10-25'));
 const ok=(db,r)=>db.reqs.find(q=>q.id===r).status==='Approved';t('Unapproved requirement R6 cannot be scheduled',false,ok(s,'R6'));
 const s2=applyCR(s,'CR1'),c2=calc(s2);t('Approved CR raises budget by 800,000',5800000,c2.budget);t('Approved CR extends deadline by 21 days','2026-11-15',F(c2.dl));t('Approved CR approves R6 in scope',true,ok(s2,'R6'));t('Approved CR adds 2 work packages',13,s2.tasks.length);t('Planned cost matches new budget',c2.budget,c2.E.bac);
 let e2='none';try{applyCR(s2,'CR1')}catch(e){e2='rejected'}t('Cannot approve CR twice','rejected',e2);
 t('Numeric validation: negative cost becomes 0',0,num('cost',-50));t('Numeric validation: percent capped at 100',100,num('pct',250));return R}
function validateState(s){const E=[],ids=new Set(),c=s.charter||{},reqs=s.reqs||[],tasks=s.tasks||[];
 if(!c.name||!String(c.name).trim())E.push('Project name is required.');
 if(!(c.budget>0))E.push('Approved budget must be greater than zero.');
 if([c.start,c.deadline,c.statusDate].some(x=>isNaN(D(x))))E.push('Charter dates must be valid.');else if(D(c.deadline)<D(c.start))E.push('Deadline cannot be before the start date.');
 reqs.forEach(r=>{if(!String(r.title||'').trim())E.push(r.id+': requirement title is required.')});
 tasks.forEach(t=>{if(ids.has(t.id))E.push('Duplicate task '+t.id);ids.add(t.id);
  if(!String(t.name||'').trim())E.push(t.id+': activity name is required.');if(!(t.dur>=1))E.push(t.id+': duration must be at least 1 day.');
  if(t.cost<0||t.actual<0)E.push(t.id+': costs cannot be negative.');if(!(t.pct>=0&&t.pct<=100))E.push(t.id+': percent complete must be 0-100.');if(isNaN(D(t.start)))E.push(t.id+': invalid start date.');
  t.dep.forEach(x=>{if(x===t.id||!tasks.some(u=>u.id===x))E.push(t.id+': invalid dependency '+x+'.')});
  if(t.req){const r=reqs.find(q=>q.id===t.req);if(!r||r.status!=='Approved')E.push(t.id+': requirement '+t.req+' is not approved, so it cannot be in project scope.')}});
 (s.crs||[]).forEach(x=>{if(x.cost<0||x.days<0)E.push(x.id+': impacts cannot be negative.');x.reqs.forEach(r=>{if(!reqs.some(q=>q.id===r))E.push(x.id+': unknown requirement '+r+'.')});
  if(x.status==='Approved'&&x.reqs.some(r=>(reqs.find(q=>q.id===r)||{}).status!=='Approved'))E.push(x.id+': approved change request has unapproved requirements.')});
 (s.risks||[]).forEach(r=>{if(!(r.lik>=1&&r.lik<=5&&r.imp>=1&&r.imp<=5))E.push(r.id+': likelihood and impact must be 1-5.')});
 try{run(tasks,null)}catch(e){E.push(e.message)}return E}
if(typeof module!=='undefined')module.exports={D,F,M,T,seed,run,evm,calc,applyCR,num,tests,validateState};
