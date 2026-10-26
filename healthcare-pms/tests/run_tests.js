// Runs unit tests (logic.js) and API/database integration tests, then writes TEST_REPORT.md. Run: node tests/run_tests.js
const fs=require('fs'),os=require('os'),path=require('path'),L=require('../public/logic.js'),S=require('../server.js');
(async()=>{const R=L.tests().map(r=>['Unit',...r]),t=(n,e,a)=>R.push(['Integration',n,String(e),String(a),String(e)===String(a)]);
 const file=path.join(os.tmpdir(),'pms-test-'+Date.now()+'.db'),srv=await S.start(0,file),u='http://localhost:'+srv.address().port,j=async(m,b)=>{const r=await fetch(u+'/api/state',{method:m,headers:{'Content-Type':'application/json'},body:b&&JSON.stringify(b)});return{s:r.status,b:await r.json()}};
 let g=await j('GET');t('DB is seeded with 11 tasks on first start',11,g.b.tasks.length);t('Seed budget stored in database',5000000,g.b.charter.budget);
 let bad=JSON.parse(JSON.stringify(g.b));bad.tasks[0].cost=-5;let r=await j('PUT',bad);t('Negative cost rejected by API (HTTP 400)',400,r.s);
 bad=JSON.parse(JSON.stringify(g.b));bad.tasks[2].req='R6';r=await j('PUT',bad);t('Task linked to unapproved requirement R6 rejected',400,r.s);
 bad=JSON.parse(JSON.stringify(g.b));bad.tasks[0].dep=['T11'];r=await j('PUT',bad);t('Circular dependency rejected',400,r.s);
 g=await j('GET');t('Rejected changes leave database unchanged',5000000,L.calc(g.b).E.bac);
 const ok=L.applyCR(g.b,'CR1');r=await j('PUT',ok);t('Approved change request saved (HTTP 200)',200,r.s);
 g=await j('GET');const c=L.calc(g.b);t('Persisted approved budget after change request',5800000,c.budget);t('Persisted approved deadline','2026-11-15',L.F(c.dl));t('R6 approved in database',true,g.b.reqs.find(x=>x.id==='R6').status==='Approved');t('Work packages in database after change request',13,g.b.tasks.length);
 srv.close();const db2=S.openDb(file);try{t('Data survives restart (reopen database file)',13,S.loadState(db2).tasks.length);}finally{db2.close();}
 const pass=R.filter(x=>x[4]).length;let md='# Test report\n\nGenerated '+new Date().toISOString()+'. '+pass+' of '+R.length+' tests passed.\n\n| Type | Test case | Expected | Actual | Result |\n|---|---|---|---|---|\n'+R.map(x=>'| '+x.slice(0,4).join(' | ')+' | '+(x[4]?'PASS':'FAIL')+' |').join('\n')+'\n';
 fs.writeFileSync(path.join(__dirname,'..','TEST_REPORT.md'),md);R.forEach(x=>console.log((x[4]?'PASS ':'FAIL ')+x[1]+' | expected '+x[2]+' | actual '+x[3]));console.log(pass+'/'+R.length+' passed');process.exit(pass===R.length?0:1)})();
