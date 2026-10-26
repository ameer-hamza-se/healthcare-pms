// Generates db/sample_data.sql from the built-in case-study seed data. Run: node scripts/make_sample_sql.js
const fs=require('fs'),path=require('path'),S=require('../server.js');
const db=S.openDb(':memory:'),tables=['project_charter','team_members','milestones','requirements','change_requests','change_request_requirements','tasks','task_dependencies','defects','quality_checks','risks'];
const lit=v=>v==null?'NULL':typeof v==='number'?String(v):"'"+String(v).replace(/'/g,"''")+"'";
let out='-- Sample data for the Smart Healthcare case study (generated)\nPRAGMA foreign_keys=ON;\nBEGIN;\n';
tables.forEach(t=>db.prepare('SELECT * FROM '+t+' ORDER BY rowid').all().forEach(r=>out+='INSERT INTO '+t+'('+Object.keys(r).join(',')+') VALUES ('+Object.values(r).map(lit).join(',')+');\n'));
fs.writeFileSync(path.join(__dirname,'..','db','sample_data.sql'),out+'COMMIT;\n');console.log('db/sample_data.sql written');
