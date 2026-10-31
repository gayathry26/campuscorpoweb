const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx');
const { app } = require('../server');
const { commonPool, getDepartmentPool, checkDatabaseHealth } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const {
  validateDepartmentCode,
  generateDatabaseName,
  provisionDepartmentDatabase,
  verifyDepartmentDatabase
} = require('../services/departmentProvisioningService');
const {
  generateTemplate,
  parseUploadedFile,
  validateImportBatch,
  executeImport
} = require('../services/bulkImportService');

let server;
let port = 5088;
let baseUrl;

const adminToken = jwt.sign(
  { userId: 1, email: 'admin@college.edu', roleId: 7, roleName: 'ADMIN' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const studentToken = jwt.sign(
  { userId: 8, email: 'student.cse1@college.edu', roleId: 1, roleName: 'STUDENT', departmentCode: 'CSE' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

test.before(async () => {
  return new Promise((resolve) => {
    server = app.listen(port, () => {
      baseUrl = `http://localhost:${port}/api/v1`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('1. Department Code Validation & Safe Database Identifier Generator', async () => {
  assert.strictEqual(validateDepartmentCode('CSE'), 'CSE');
  assert.strictEqual(validateDepartmentCode('ai_ds'), 'AI_DS');
  assert.throws(() => validateDepartmentCode(''), /required/);
  assert.throws(() => validateDepartmentCode('A'), /Invalid/);
  assert.throws(() => validateDepartmentCode('DROP TABLE;'), /Invalid/);

  assert.strictEqual(generateDatabaseName('CSE'), 'campuscorp_dept_cse');
  assert.strictEqual(generateDatabaseName('AI_DS'), 'campuscorp_dept_ai_ds');
  assert.strictEqual(generateDatabaseName('ROBOTICS'), 'campuscorp_dept_robotics');
});

test('2. Create Department and Provision Dedicated MySQL Database', async () => {
  const testDeptCode = 'ROBOTICS';
  const res = await fetch(`${baseUrl}/admin/departments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dept_code: testDeptCode,
      dept_name: 'Robotics and Automation Engineering',
      description: 'Department dedicated to Autonomous Systems and Industrial Robotics',
      hod_name: 'Dr. Vikram Chandra',
      hod_email: 'hod.robotics@college.edu',
      duration_years: 4,
      total_semesters: 8,
      auto_provision: true
    })
  });

  const body = await res.json();
  assert.ok([201, 409].includes(res.status), 'Department should be created or already exists');

  // Verify dedicated database exists in MySQL
  const [dbRows] = await commonPool.query("SHOW DATABASES LIKE 'campuscorp_dept_robotics'");
  assert.strictEqual(dbRows.length, 1, "MySQL database 'campuscorp_dept_robotics' must exist");

  // Verify all isolated tables in the new department database
  const roboPool = await getDepartmentPool('ROBOTICS');
  const [tables] = await roboPool.query('SHOW TABLES');
  const tableNames = tables.map(r => Object.values(r)[0]);

  assert.ok(tableNames.includes('students'), 'students table must exist');
  assert.ok(tableNames.includes('student_profiles'), 'student_profiles table must exist');
  assert.ok(tableNames.includes('student_academic_records'), 'student_academic_records table must exist');
  assert.ok(tableNames.includes('classes'), 'classes table must exist');
  assert.ok(tableNames.includes('sections'), 'sections table must exist');
});

test('3. Academic Structure Configuration Hierarchy', async () => {
  const res = await fetch(`${baseUrl}/admin/academics`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dept_code: 'ROBOTICS',
      academic_year: '2026-2027',
      admission_batch: '2023-2027',
      programme_name: 'B.Tech',
      duration_years: 4,
      total_semesters: 8,
      year_of_study: 4,
      semester: 7,
      class_name: 'ROBO-A',
      section: 'A',
      class_advisor_name: 'Prof. Anjali Sen',
      class_advisor_email: 'anjali.sen@college.edu',
      max_capacity: 60
    })
  });

  const body = await res.json();
  assert.ok([201, 409].includes(res.status), 'Academic structure must be saved');

  // Fetch academic structures for ROBOTICS
  const listRes = await fetch(`${baseUrl}/admin/academics?department=ROBOTICS`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const listBody = await listRes.json();
  assert.strictEqual(listRes.status, 200);
  assert.ok(listBody.data.length >= 1);
  const roboClass = listBody.data.find(s => s.class_name === 'ROBO-A');
  assert.ok(roboClass, 'Class ROBO-A must be present');
  assert.strictEqual(roboClass.section, 'A');
});

test('4. Template Download in CSV, XLSX, and JSON', async () => {
  // CSV Template
  const csvRes = await fetch(`${baseUrl}/admin/imports/template?dataType=STUDENT_MASTER&format=CSV&department=ROBOTICS`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(csvRes.status, 200);
  assert.ok(csvRes.headers.get('content-type').includes('text/csv'));
  const csvText = await csvRes.text();
  assert.ok(csvText.includes('registration_number,first_name,last_name'));

  // XLSX Template
  const xlsxRes = await fetch(`${baseUrl}/admin/imports/template?dataType=STUDENT_MASTER&format=XLSX&department=ROBOTICS`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(xlsxRes.status, 200);
  assert.ok(xlsxRes.headers.get('content-type').includes('spreadsheetml'));

  // JSON Template
  const jsonRes = await fetch(`${baseUrl}/admin/imports/template?dataType=STUDENT_MASTER&format=JSON&department=ROBOTICS`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(jsonRes.status, 200);
  const jsonData = await jsonRes.json();
  assert.ok(Array.isArray(jsonData) && jsonData.length > 0);
  assert.strictEqual(jsonData[0].department_code, 'ROBOTICS');
});

test('5. Multi-Format Bulk Import Validation: CSV, XLSX, and JSON', async () => {
  // 5a. Test JSON upload parsing & validation
  const testStudents = [
    {
      registration_number: '2023ROBO001',
      first_name: 'Tanvi',
      last_name: 'Mehta',
      institutional_email: 'tanvi.robo001@college.edu',
      contact_number: '+91 9988776655',
      department_code: 'ROBOTICS',
      programme: 'B.Tech',
      admission_batch: '2023-2027',
      academic_year: '2026-2027',
      year_of_study: 4,
      semester: 7,
      class_name: 'ROBO-A',
      section: 'A',
      placement_status: 'REGISTERED'
    },
    {
      registration_number: '2023ROBO002',
      first_name: 'Karan',
      last_name: 'Nambiar',
      institutional_email: 'karan.robo002@college.edu',
      contact_number: '+91 9988776656',
      department_code: 'ROBOTICS',
      programme: 'B.Tech',
      admission_batch: '2023-2027',
      academic_year: '2026-2027',
      year_of_study: 4,
      semester: 7,
      class_name: 'ROBO-A',
      section: 'A',
      placement_status: 'REGISTERED'
    }
  ];

  const jsonBlob = new Blob([JSON.stringify(testStudents)], { type: 'application/json' });
  const formData = new FormData();
  formData.append('file', jsonBlob, 'robotics_students.json');
  formData.append('department', 'ROBOTICS');
  formData.append('data_type', 'STUDENT_MASTER');

  const previewRes = await fetch(`${baseUrl}/admin/imports/preview`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: formData
  });

  const previewBody = await previewRes.json();
  assert.strictEqual(previewRes.status, 200);
  assert.strictEqual(previewBody.summary.totalRows, 2);
  assert.strictEqual(previewBody.summary.validRows, 2);
  assert.strictEqual(previewBody.summary.invalidRows, 0);

  // 5b. Confirm Import into ROBOTICS isolated database
  const confirmRes = await fetch(`${baseUrl}/admin/imports/confirm`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      department: 'ROBOTICS',
      data_type: 'STUDENT_MASTER',
      import_mode: 'UPSERT',
      records: previewBody.allRecords,
      metadata: { fileName: 'robotics_students.json', fileFormat: 'JSON' }
    })
  });

  const confirmBody = await confirmRes.json();
  assert.strictEqual(confirmRes.status, 200);
  assert.strictEqual(confirmBody.data.importedRows, 2);

  // 5c. Verify records exist in ROBOTICS isolated DB
  const roboPool = await getDepartmentPool('ROBOTICS');
  const [roboStudents] = await roboPool.query(
    'SELECT register_number, first_name, email FROM students WHERE register_number IN (?, ?)',
    ['2023ROBO001', '2023ROBO002']
  );
  assert.strictEqual(roboStudents.length, 2);
  assert.strictEqual(roboStudents[0].register_number, '2023ROBO001');

  // 5d. STRICT TENANT ISOLATION CHECK: Ensure ROBOTICS student does NOT leak into CSE database!
  const csePool = await getDepartmentPool('CSE');
  const [cseLeakCheck] = await csePool.query(
    'SELECT register_number FROM students WHERE register_number = ?',
    ['2023ROBO001']
  );
  assert.strictEqual(cseLeakCheck.length, 0, 'Robotics student MUST NOT leak into CSE database');
});

test('6. Malformed & Duplicate Record Validation Enforcement', async () => {
  const malformedRows = [
    {
      registration_number: '', // Missing reg number
      first_name: 'Invalid Student',
      institutional_email: 'not-an-email',
      department_code: 'ROBOTICS'
    },
    {
      registration_number: '2023DUP001',
      first_name: 'Duplicate One',
      institutional_email: 'dup1@college.edu',
      department_code: 'ROBOTICS'
    },
    {
      registration_number: '2023DUP001', // Duplicate in file
      first_name: 'Duplicate Two',
      institutional_email: 'dup2@college.edu',
      department_code: 'ROBOTICS'
    }
  ];

  const blob = new Blob([JSON.stringify(malformedRows)], { type: 'application/json' });
  const formData = new FormData();
  formData.append('file', blob, 'malformed.json');
  formData.append('department', 'ROBOTICS');
  formData.append('data_type', 'STUDENT_MASTER');

  const res = await fetch(`${baseUrl}/admin/imports/preview`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: formData
  });

  const body = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(body.summary.invalidRows >= 1, 'Must catch invalid row');
  assert.ok(body.summary.duplicateRows >= 1, 'Must catch duplicate row in file');
});

test('7. Database Status Verification & Health Diagnostics', async () => {
  const res = await fetch(`${baseUrl}/admin/database-status`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  const body = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(body.data.centralDatabase.status, 'UP');
  assert.ok(body.data.departments.length >= 7, 'Must report all active departments');

  const roboDeptStatus = body.data.departments.find(d => d.dept_code === 'ROBOTICS');
  assert.ok(roboDeptStatus, 'ROBOTICS database status must be tracked');
  assert.strictEqual(roboDeptStatus.connectionStatus, 'UP');
  assert.strictEqual(roboDeptStatus.database_name, 'campuscorp_dept_robotics');
  assert.ok(roboDeptStatus.studentCount >= 2, 'Must report student count');
});

test('8. Import History & Audit Logging Verification', async () => {
  const res = await fetch(`${baseUrl}/admin/imports/history?department=ROBOTICS`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  const body = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(body.data.length >= 1, 'Import history must contain the committed import job');
  assert.strictEqual(body.data[0].dept_code, 'ROBOTICS');
  assert.strictEqual(body.data[0].status, 'COMPLETED');
});

test('9. Persistent Multi-Step Wizard Draft Storage & Recovery', async () => {
  const draftPayload = {
    draftData: {
      dept_code: 'BIOTECH',
      dept_name: 'Department of Biotechnology',
      hod_name: 'Dr. Anita Roy',
      hod_email: 'anita.biotech@college.edu',
      duration_years: 4,
      total_semesters: 8,
      auto_provision: true
    },
    step: 2
  };

  // 1. Save draft
  const saveRes = await fetch(`${baseUrl}/admin/wizard-drafts/DEPARTMENT_CREATION`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(draftPayload)
  });
  assert.strictEqual(saveRes.status, 200);

  // 2. Fetch saved draft
  const getRes = await fetch(`${baseUrl}/admin/wizard-drafts/DEPARTMENT_CREATION`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(getRes.status, 200);
  const getBody = await getRes.json();
  assert.ok(getBody.data, 'Draft data should be returned');
  assert.strictEqual(getBody.data.step, 2);
  assert.strictEqual(getBody.data.draftData.dept_code, 'BIOTECH');

  // 3. Delete draft
  const delRes = await fetch(`${baseUrl}/admin/wizard-drafts/DEPARTMENT_CREATION`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert.strictEqual(delRes.status, 200);

  // 4. Confirm draft is cleared
  const checkRes = await fetch(`${baseUrl}/admin/wizard-drafts/DEPARTMENT_CREATION`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const checkBody = await checkRes.json();
  assert.strictEqual(checkBody.data, null);
});

test('10. Department Conflict Resolution and Update/Re-provisioning', async () => {
  // Test conflict without update_if_exists
  const conflictRes = await fetch(`${baseUrl}/admin/departments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dept_code: 'ECE',
      dept_name: 'Electronics and Communication',
      auto_provision: false,
      update_if_exists: false
    })
  });
  assert.strictEqual(conflictRes.status, 409, 'Duplicate dept_code must return 409 Conflict');
  const conflictBody = await conflictRes.json();
  assert.strictEqual(conflictBody.success, false);
  assert.strictEqual(conflictBody.canUpdate, true);

  // Test updating and re-provisioning existing department
  const updateRes = await fetch(`${baseUrl}/admin/departments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dept_code: 'ECE',
      dept_name: 'Electronics and Communication Engineering',
      hod_name: 'Dr. Sunita Sharma',
      hod_email: 'hod.ece@college.edu',
      auto_provision: true,
      update_if_exists: true
    })
  });
  assert.strictEqual(updateRes.status, 200, 'Re-provisioning must return 200 OK');
  const updateBody = await updateRes.json();
  assert.strictEqual(updateBody.success, true);
  assert.ok(updateBody.provisionResult);
  assert.strictEqual(updateBody.provisionResult.status, 'READY');

  // Close server and exit clean
  setTimeout(() => process.exit(0), 100);
});
