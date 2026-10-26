// Zero-dependency server: Node >= 22.5 (built-in node:sqlite). Run: node server.js
const http=require('http'),fs=require('fs'),path=require('path'),{DatabaseSync}=require('node:sqlite'),L=require('./public/logic.js');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const ORDER=['task_dependencies','change_request_requirements','tasks','change_requests','requirements','milestones','team_members','defects','quality_checks','risks','project_charter'];

function closeDb(db){
  if(db&&typeof db.close==='function'){
    try{db.close();}catch(e){/* SQLite may already be finalizing during process shutdown */}
  }
}

function openDb(file){
  if(file!==':memory:')fs.mkdirSync(path.dirname(file),{recursive:true});
  const db=new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys=ON');
  db.exec(fs.readFileSync(path.join(__dirname,'db','schema.sql'),'utf8'));
  if(!db.prepare('SELECT COUNT(*) n FROM project_charter').get().n)saveState(db,L.seed());
  return db;
}

function saveState(db,s){
  const errs=L.validateState(s);if(errs.length){const e=new Error(errs.join(' '));e.status=400;throw e}
  const c=s.charter,p=c.plan,ins=(t,...v)=>db.prepare('INSERT INTO '+t+' VALUES ('+v.map(()=>'?').join()+')').run(...v.map(x=>x===undefined?null:x));
  db.exec('BEGIN');
  try{
    ORDER.forEach(t=>db.exec('DELETE FROM '+t));
    ins('project_charter',1,c.name,c.objectives,c.stakeholders,c.inScope,c.outScope,c.budget,c.start,c.deadline,c.status,c.statusDate,c.closure,p.scope,p.schedule,p.cost,p.quality,s.th.cpi,s.th.spi);
    s.team.forEach(m=>ins('team_members',m.id,m.name,m.resp));
    s.milestones.forEach(m=>ins('milestones',m.id,m.name,m.date,m.done));
    s.reqs.forEach(r=>ins('requirements',r.id,r.title,r.pri,r.status));
    s.crs.forEach(x=>{ins('change_requests',x.id,x.title,x.why,x.cost,x.days,x.status);x.reqs.forEach(r=>ins('change_request_requirements',x.id,r))});
    s.tasks.forEach(t=>ins('tasks',t.id,t.name,t.owner,t.start,t.dur,t.cost,t.actual,t.pct,t.req||null));
    s.tasks.forEach(t=>t.dep.forEach(d=>ins('task_dependencies',t.id,d)));
    s.defects.forEach(d=>ins('defects',d.id,d.title,d.mod,d.sev,d.who,d.status));
    s.checks.forEach(q=>ins('quality_checks',q.id,q.deliv,q.item,q.result,q.note));
    s.risks.forEach(r=>ins('risks',r.id,r.desc,r.lik,r.imp,r.prev,r.corr));
    db.exec('COMMIT');
  }catch(e){
    db.exec('ROLLBACK');
    if(!e.status)e.status=400;
    throw e;
  }
}

function loadState(db){
  const q=(s,...a)=>db.prepare(s).all(...a),c=q('SELECT * FROM project_charter')[0];
  return{charter:{name:c.name,objectives:c.objectives,stakeholders:c.stakeholders,inScope:c.in_scope,outScope:c.out_scope,budget:c.approved_budget,start:c.start_date,deadline:c.deadline,status:c.status,statusDate:c.status_date,closure:c.closure_notes||'',plan:{scope:c.plan_scope,schedule:c.plan_schedule,cost:c.plan_cost,quality:c.plan_quality}},th:{cpi:c.cpi_threshold,spi:c.spi_threshold},
    team:q('SELECT id,name,responsibility resp FROM team_members ORDER BY rowid'),milestones:q('SELECT id,name,due_date date,done FROM milestones ORDER BY rowid'),reqs:q('SELECT id,title,priority pri,status FROM requirements ORDER BY rowid'),
    crs:q('SELECT id,title,justification why,cost_impact cost,schedule_impact_days days,status FROM change_requests ORDER BY rowid').map(x=>({...x,reqs:q('SELECT req_id FROM change_request_requirements WHERE cr_id=? ORDER BY rowid',x.id).map(r=>r.req_id)})),
    tasks:q('SELECT id,name,owner,start_date start,duration_days dur,planned_cost cost,actual_cost actual,percent_complete pct,requirement_id req FROM tasks ORDER BY rowid').map(t=>({...t,req:t.req||'',dep:q('SELECT depends_on d FROM task_dependencies WHERE task_id=? ORDER BY rowid',t.id).map(r=>r.d)})),
    defects:q('SELECT id,title,module mod,severity sev,assignee who,status FROM defects ORDER BY rowid'),checks:q('SELECT id,deliverable deliv,item,result,note FROM quality_checks ORDER BY rowid'),
    risks:q('SELECT id,description desc,likelihood lik,impact imp,preventive_action prev,corrective_action corr FROM risks ORDER BY rowid')}
}

function start(port,file){
  const db=openDb(file);
  const srv=http.createServer((req,res)=>{
    const send=(code,obj,type='application/json')=>{res.writeHead(code,{'Content-Type':type});res.end(type==='application/json'?JSON.stringify(obj):obj)};
    try{
      const url=req.url.split('?')[0];
      if(url==='/api/state'&&req.method==='GET')return send(200,loadState(db));
      if(url==='/api/state'&&req.method==='PUT'){
        let b='';
        req.on('data',d=>{b+=d;if(b.length>5e6)req.destroy()});
        req.on('end',()=>{try{saveState(db,JSON.parse(b));send(200,{ok:true})}catch(e){send(e.status||400,{error:e instanceof SyntaxError?'Invalid JSON':e.message})}});
        return;
      }
      if(url==='/api/health')return send(200,{ok:true});
      const f=path.join(__dirname,'public',url==='/'?'index.html':url);
      if(!f.startsWith(path.join(__dirname,'public'))||!fs.existsSync(f))return send(404,'Not found','text/plain');
      send(200,fs.readFileSync(f),MIME[path.extname(f)]||'text/plain');
    }catch(e){send(500,{error:e.message})}
  });

  const stop=()=>{srv.close(()=>closeDb(db));};
  srv.on('close',()=>closeDb(db));
  process.once('SIGINT',stop);
  process.once('SIGTERM',stop);
  process.once('exit',()=>closeDb(db));
  srv.db=db;
  return new Promise(r=>srv.listen(port,()=>r(srv)));
}

module.exports={openDb,saveState,loadState,start};
if(require.main===module)start(+process.env.PORT||3000,process.env.DB||path.join(__dirname,'data','pms.db')).then(s=>console.log('Smart Healthcare PMS running at http://localhost:'+s.address().port));
