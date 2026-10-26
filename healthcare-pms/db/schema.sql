-- Smart Healthcare Project Management System: SQLite schema
CREATE TABLE IF NOT EXISTS project_charter(id INTEGER PRIMARY KEY CHECK(id=1),name TEXT NOT NULL,objectives TEXT,stakeholders TEXT,in_scope TEXT,out_scope TEXT,
 approved_budget REAL NOT NULL CHECK(approved_budget>0),start_date TEXT NOT NULL,deadline TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN('Initiation','Planning','Execution','Monitoring','Closed')),
 status_date TEXT NOT NULL,closure_notes TEXT,plan_scope TEXT,plan_schedule TEXT,plan_cost TEXT,plan_quality TEXT,cpi_threshold REAL NOT NULL,spi_threshold REAL NOT NULL);
CREATE TABLE IF NOT EXISTS team_members(id TEXT PRIMARY KEY,name TEXT NOT NULL,responsibility TEXT);
CREATE TABLE IF NOT EXISTS milestones(id TEXT PRIMARY KEY,name TEXT NOT NULL,due_date TEXT NOT NULL,done TEXT NOT NULL CHECK(done IN('Yes','No')));
CREATE TABLE IF NOT EXISTS requirements(id TEXT PRIMARY KEY,title TEXT NOT NULL,priority TEXT NOT NULL CHECK(priority IN('High','Medium','Low')),status TEXT NOT NULL CHECK(status IN('Proposed','Approved','Rejected')));
CREATE TABLE IF NOT EXISTS change_requests(id TEXT PRIMARY KEY,title TEXT NOT NULL,justification TEXT,cost_impact REAL NOT NULL CHECK(cost_impact>=0),schedule_impact_days INTEGER NOT NULL CHECK(schedule_impact_days>=0),status TEXT NOT NULL CHECK(status IN('Pending','Approved','Rejected')));
CREATE TABLE IF NOT EXISTS change_request_requirements(cr_id TEXT NOT NULL REFERENCES change_requests(id) ON DELETE CASCADE,req_id TEXT NOT NULL REFERENCES requirements(id),PRIMARY KEY(cr_id,req_id));
CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY,name TEXT NOT NULL,owner TEXT,start_date TEXT NOT NULL,duration_days INTEGER NOT NULL CHECK(duration_days>=1),planned_cost REAL NOT NULL CHECK(planned_cost>=0),
 actual_cost REAL NOT NULL CHECK(actual_cost>=0),percent_complete REAL NOT NULL CHECK(percent_complete BETWEEN 0 AND 100),requirement_id TEXT REFERENCES requirements(id));
CREATE TABLE IF NOT EXISTS task_dependencies(task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,depends_on TEXT NOT NULL REFERENCES tasks(id),PRIMARY KEY(task_id,depends_on),CHECK(task_id<>depends_on));
CREATE TABLE IF NOT EXISTS defects(id TEXT PRIMARY KEY,title TEXT NOT NULL,module TEXT,severity TEXT NOT NULL CHECK(severity IN('Critical','High','Medium','Low')),assignee TEXT,status TEXT NOT NULL CHECK(status IN('Open','In Progress','Resolved','Closed')));
CREATE TABLE IF NOT EXISTS quality_checks(id TEXT PRIMARY KEY,deliverable TEXT,item TEXT NOT NULL,result TEXT NOT NULL CHECK(result IN('Pending','Pass','Fail')),note TEXT);
CREATE TABLE IF NOT EXISTS risks(id TEXT PRIMARY KEY,description TEXT NOT NULL,likelihood INTEGER NOT NULL CHECK(likelihood BETWEEN 1 AND 5),impact INTEGER NOT NULL CHECK(impact BETWEEN 1 AND 5),preventive_action TEXT,corrective_action TEXT);
