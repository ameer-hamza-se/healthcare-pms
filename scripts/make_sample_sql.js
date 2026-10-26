// Generates db/sample_data.sql from the built-in case-study seed data. Run: node scripts/make_sample_sql.js
import fs from 'fs';import path from 'path';import{fileURLToPath}from 'url';import*as S from '../server/index.js';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const db=S.openDb(':memory:'),tables=['project_charter','team_members','milestones','requirements','change_requests','change_request_requirements','scope_baselines','scope_baseline_items','scope_log','tasks','task_dependencies','expenditures','defects','quality_checks','risks'];
const lit=v=>v==null?'NULL':typeof v==='number'?String(v):"'"+String(v).replace(/'/g,"''")+"'";
let out='-- Sample data for the Smart Healthcare case study (generated)\nPRAGMA foreign_keys=ON;\nBEGIN;\n';
tables.forEach(t=>db.prepare('SELECT * FROM '+t+' ORDER BY rowid').all().forEach(r=>out+='INSERT INTO '+t+'('+Object.keys(r).join(',')+') VALUES ('+Object.values(r).map(lit).join(',')+');\n'));
fs.writeFileSync(path.join(__dirname,'..','db','sample_data.sql'),out+'COMMIT;\n');console.log('db/sample_data.sql written');
