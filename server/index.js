// API + static server. Node >= 22.5 (built-in node:sqlite). Run: npm run server
import http from 'http';import fs from 'fs';import path from 'path';import{fileURLToPath}from 'url';import{DatabaseSync}from 'node:sqlite';import*as L from '../shared/logic.js';
const __dirname=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.join(__dirname,'..'),DIST=path.join(ROOT,'dist');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};
const SCHEMA_VERSION=2;
const ORDER=['expenditures','task_dependencies','change_request_requirements','scope_baseline_items','scope_baselines','scope_log','defects','quality_checks','tasks','change_requests','requirements','milestones','team_members','risks','project_charter'];
function openDb(file){if(file!==':memory:')fs.mkdirSync(path.dirname(file),{recursive:true});const db=new DatabaseSync(file);
 if(db.prepare('PRAGMA user_version').get().user_version!==SCHEMA_VERSION){   // older development database: rebuild with the current schema
  db.exec('PRAGMA foreign_keys=OFF');db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().forEach(t=>db.exec('DROP TABLE IF EXISTS '+t.name));db.exec('PRAGMA user_version='+SCHEMA_VERSION)}
 db.exec('PRAGMA foreign_keys=ON');db.exec(fs.readFileSync(path.join(ROOT,'db','schema.sql'),'utf8'));
 if(!db.prepare('SELECT COUNT(*) n FROM project_charter').get().n)saveState(db,L.seed());return db}
// Validates the whole project state, then replaces all tables inside one transaction (all-or-nothing).
function saveState(db,s){const errs=L.validateState(s);if(errs.length){const e=new Error(errs.slice(0,5).join(' ')+(errs.length>5?' (+'+(errs.length-5)+' more)':''));e.status=400;throw e}
 const c=s.charter,p=c.plan,ins=(t,...v)=>db.prepare('INSERT INTO '+t+' VALUES ('+v.map(()=>'?').join()+')').run(...v.map(x=>x===undefined||x===''?null:x));
 db.exec('BEGIN');try{ORDER.forEach(t=>db.exec('DELETE FROM '+t));
  ins('project_charter',1,c.name,c.objectives,c.stakeholders,c.inScope,c.outScope,c.budget,c.start,c.deadline,c.status,c.statusDate,c.closure,p.scope,p.schedule,p.cost,p.quality,s.th.cpi,s.th.spi);
  s.team.forEach(m=>ins('team_members',m.id,m.name,m.resp));s.milestones.forEach(m=>ins('milestones',m.id,m.name,m.date,m.done));
  s.reqs.forEach(r=>ins('requirements',r.id,r.title,r.pri,r.status));
  s.crs.forEach(x=>{ins('change_requests',x.id,x.title,x.type,x.by,x.date,x.why,x.cost,x.days,x.status,x.decidedOn,x.decidedBy,x.note);x.reqs.forEach(r=>ins('change_request_requirements',x.id,r))});
  s.baselines.forEach(b=>{ins('scope_baselines',b.id,b.version,b.date,b.desc,b.budget,b.deadline,b.cr);b.reqs.forEach(r=>ins('scope_baseline_items',b.id,r))});
  s.scopeLog.forEach(l=>ins('scope_log',l.id,l.date,l.action,l.ref,l.detail,l.by));
  s.tasks.forEach(t=>ins('tasks',t.id,t.name,t.owner,t.start,t.dur,t.cost,t.pct,t.req));s.tasks.forEach(t=>t.dep.forEach(d=>ins('task_dependencies',t.id,d)));
  s.expenses.forEach(e=>ins('expenditures',e.id,e.date,e.task,e.cat,e.desc,e.amount,e.ref));
  s.defects.forEach(d=>ins('defects',d.id,d.title,d.mod,d.sev,d.who,d.status,d.req));s.checks.forEach(q=>ins('quality_checks',q.id,q.deliv,q.item,q.result,q.note,q.req));
  s.risks.forEach(r=>ins('risks',r.id,r.desc,r.lik,r.imp,r.prev,r.corr));db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');if(!e.status)e.status=400;throw e}}
function loadState(db){const q=(s,...a)=>db.prepare(s).all(...a),c=q('SELECT * FROM project_charter')[0],e=(v)=>v||'';
 return{charter:{name:c.name,objectives:c.objectives,stakeholders:c.stakeholders,inScope:c.in_scope,outScope:c.out_scope,budget:c.approved_budget,start:c.start_date,deadline:c.deadline,status:c.status,statusDate:c.status_date,closure:e(c.closure_notes),plan:{scope:c.plan_scope,schedule:c.plan_schedule,cost:c.plan_cost,quality:c.plan_quality}},th:{cpi:c.cpi_threshold,spi:c.spi_threshold},
  team:q('SELECT id,name,responsibility resp FROM team_members ORDER BY rowid'),milestones:q('SELECT id,name,due_date date,done FROM milestones ORDER BY rowid'),reqs:q('SELECT id,title,priority pri,status FROM requirements ORDER BY rowid'),
  crs:q('SELECT id,title,type,requested_by AS "by",submitted_date date,justification why,cost_impact cost,schedule_impact_days days,status,decision_date decidedOn,decided_by decidedBy,decision_note note FROM change_requests ORDER BY rowid').map(x=>({...x,decidedOn:e(x.decidedOn),decidedBy:e(x.decidedBy),note:e(x.note),reqs:q('SELECT req_id FROM change_request_requirements WHERE cr_id=? ORDER BY rowid',x.id).map(r=>r.req_id)})),
  baselines:q('SELECT id,version,baseline_date date,description "desc",budget,deadline,cr_id cr FROM scope_baselines ORDER BY version').map(b=>({...b,cr:e(b.cr),reqs:q('SELECT req_id FROM scope_baseline_items WHERE baseline_id=? ORDER BY rowid',b.id).map(r=>r.req_id)})),
  scopeLog:q('SELECT id,log_date date,action,ref,detail,actor AS "by" FROM scope_log ORDER BY rowid'),
  tasks:q('SELECT id,name,owner,start_date start,duration_days dur,planned_cost cost,percent_complete pct,requirement_id req FROM tasks ORDER BY rowid').map(t=>({...t,req:e(t.req),dep:q('SELECT depends_on d FROM task_dependencies WHERE task_id=? ORDER BY rowid',t.id).map(r=>r.d)})),
  expenses:q('SELECT id,expense_date date,task_id task,category cat,description "desc",amount,reference ref FROM expenditures ORDER BY rowid').map(x=>({...x,ref:e(x.ref)})),
  defects:q('SELECT id,title,module mod,severity sev,assignee who,status,requirement_id req FROM defects ORDER BY rowid').map(d=>({...d,req:e(d.req)})),checks:q('SELECT id,deliverable deliv,item,result,note,requirement_id req FROM quality_checks ORDER BY rowid').map(x=>({...x,req:e(x.req)})),
  risks:q('SELECT id,description "desc",likelihood lik,impact imp,preventive_action prev,corrective_action corr FROM risks ORDER BY rowid')}}
function start(port,file){const db=openDb(file);const srv=http.createServer((req,res)=>{const send=(code,obj,type='application/json')=>{res.writeHead(code,{'Content-Type':type});res.end(type==='application/json'?JSON.stringify(obj):obj)};
  try{const url=req.url.split('?')[0];
   if(url==='/api/state'&&req.method==='GET')return send(200,loadState(db));
   if(url==='/api/state'&&req.method==='PUT'){let b='';req.on('data',d=>{b+=d;if(b.length>5e6)req.destroy()});req.on('end',()=>{try{saveState(db,JSON.parse(b));send(200,{ok:true})}catch(e){send(e.status||400,{error:e instanceof SyntaxError?'Invalid JSON':e.message})}});return}
   if(url==='/api/health')return send(200,{ok:true});
   let f=path.join(DIST,url==='/'?'index.html':url);if(!f.startsWith(DIST))return send(404,'Not found','text/plain');if(!fs.existsSync(f))f=path.join(DIST,'index.html');if(!fs.existsSync(f))return send(404,'Run "npm run build" first, or use "npm run dev" while developing.','text/plain');
   send(200,fs.readFileSync(f),MIME[path.extname(f)]||'text/plain')}catch(e){send(500,{error:e.message})}});
 srv.db=db;return new Promise(r=>srv.listen(port,()=>r(srv)))}
export{openDb,saveState,loadState,start};
if(process.argv[1]===fileURLToPath(import.meta.url))start(+process.env.PORT||3000,process.env.DB||path.join(ROOT,'data','pms.db')).then(s=>console.log('Smart Healthcare PMS running at http://localhost:'+s.address().port));
