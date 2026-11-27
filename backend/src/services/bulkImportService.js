const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDepartmentPool, commonPool } = require('../config/db');

/**
 * Standard field aliases for intelligent column mapping
 */
const FIELD_ALIASES = {
  register_number: ['register_number', 'reg_no', 'regno', 'registration_number', 'roll_no', 'roll_number', 'student_id', 'reg_num'],
  first_name: ['first_name', 'firstname', 'first name', 'fname', 'given_name', 'student_first_name'],
  last_name: ['last_name', 'lastname', 'last name', 'lname', 'surname', 'family_name'],
  full_name: ['name', 'full_name', 'fullname', 'student_name'],
  email: ['institutional_email', 'email', 'email_id', 'mail', 'college_email', 'student_email'],
  phone: ['contact_number', 'phone', 'phone_number', 'mobile', 'mobile_no', 'contact'],
  department_code: ['department_code', 'dept_code', 'department', 'dept', 'branch'],
  programme: ['programme', 'program', 'course', 'degree'],
  admission_batch: ['admission_batch', 'batch', 'cohort', 'joining_batch'],
  academic_year: ['academic_year', 'ay', 'academic_period', 'session'],
  year_of_study: ['year_of_study', 'study_year', 'year', 'current_year'],
  semester: ['semester', 'sem', 'current_semester'],
  class_name: ['class_name', 'class', 'class_group', 'classroom', 'div'],
  section: ['section', 'sec'],
  academic_status: ['academic_status', 'student_status', 'academic_state'],
  placement_status: ['placement_status', 'placement_state'],
  current_cgpa: ['current_cgpa', 'cgpa', 'overall_gpa', 'cumulative_gpa', 'gpa'],
  active_backlogs: ['active_backlogs', 'backlogs', 'standing_arrears', 'current_backlogs'],
  cleared_backlogs: ['cleared_backlogs', 'history_backlogs', 'history_of_backlogs'],
  total_credits_earned: ['total_credits_earned', 'credits_earned', 'total_credits', 'credits'],
  sem1_gpa: ['sem1_gpa', 'sem1', 'sem_1_gpa'],
  sem2_gpa: ['sem2_gpa', 'sem2', 'sem_2_gpa'],
  sem3_gpa: ['sem3_gpa', 'sem3', 'sem_3_gpa'],
  sem4_gpa: ['sem4_gpa', 'sem4', 'sem_4_gpa'],
  sem5_gpa: ['sem5_gpa', 'sem5', 'sem_5_gpa'],
  sem6_gpa: ['sem6_gpa', 'sem6', 'sem_6_gpa'],
  sem7_gpa: ['sem7_gpa', 'sem7', 'sem_7_gpa'],
  sem8_gpa: ['sem8_gpa', 'sem8', 'sem_8_gpa'],
  faculty_mentor_name: ['faculty_mentor_name', 'mentor', 'mentor_name', 'advisor', 'faculty_advisor'],
  mentor_remarks: ['mentor_remarks', 'remarks', 'mentor_notes', 'advisor_remarks'],
  verification_status: ['verification_status', 'status_verification', 'is_verified'],
  credits_registered: ['credits_registered', 'registered_credits'],
  attendance_percentage: ['attendance_percentage', 'attendance', 'attendance_pct']
};

/**
 * Prevent CSV formula injection by neutralizing characters (=, +, -, @, \t, \r)
 */
function sanitizeCsvValue(val) {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate CSV, XLSX, or JSON templates with pre-populated realistic records
 */
function generateTemplate(dataType, format = 'CSV', deptCode = 'CSE') {
  const cleanFormat = format.toUpperCase();
  let headers = [];
  let sampleData = [];

  if (dataType === 'STUDENT_MASTER') {
    headers = [
      'registration_number', 'first_name', 'last_name', 'institutional_email',
      'contact_number', 'department_code', 'programme', 'admission_batch',
      'academic_year', 'year_of_study', 'semester', 'class_name', 'section', 'placement_status'
    ];
    sampleData = [
      {
        registration_number: `2023${deptCode}101`,
        first_name: 'Aarav',
        last_name: 'Sharma',
        institutional_email: `aarav.${deptCode.toLowerCase()}101@college.edu`,
        contact_number: '+91 9876543210',
        department_code: deptCode,
        programme: 'B.Tech',
        admission_batch: '2023-2027',
        academic_year: '2026-2027',
        year_of_study: 4,
        semester: 7,
        class_name: `${deptCode}-A`,
        section: 'A',
        placement_status: 'REGISTERED'
      },
      {
        registration_number: `2023${deptCode}102`,
        first_name: 'Diya',
        last_name: 'Iyer',
        institutional_email: `diya.${deptCode.toLowerCase()}102@college.edu`,
        contact_number: '+91 9876543211',
        department_code: deptCode,
        programme: 'B.Tech',
        admission_batch: '2023-2027',
        academic_year: '2026-2027',
        year_of_study: 4,
        semester: 7,
        class_name: `${deptCode}-A`,
        section: 'A',
        placement_status: 'REGISTERED'
      },
      {
        registration_number: `2023${deptCode}103`,
        first_name: 'Vikram',
        last_name: 'Singh',
        institutional_email: `vikram.${deptCode.toLowerCase()}103@college.edu`,
        contact_number: '+91 9876543212',
        department_code: deptCode,
        programme: 'B.Tech',
        admission_batch: '2023-2027',
        academic_year: '2026-2027',
        year_of_study: 4,
        semester: 7,
        class_name: `${deptCode}-B`,
        section: 'B',
        placement_status: 'REGISTERED'
      }
    ];
  } else if (dataType === 'ACADEMIC_RECORDS') {
    headers = [
      'registration_number', 'current_cgpa', 'active_backlogs', 'cleared_backlogs',
      'total_credits_earned', 'sem1_gpa', 'sem2_gpa', 'sem3_gpa', 'sem4_gpa',
      'sem5_gpa', 'sem6_gpa', 'sem7_gpa', 'faculty_mentor_name', 'mentor_remarks', 'verification_status'
    ];
    sampleData = [
      {
        registration_number: `2023${deptCode}101`,
        current_cgpa: 9.12,
        active_backlogs: 0,
        cleared_backlogs: 0,
        total_credits_earned: 145,
        sem1_gpa: 8.90,
        sem2_gpa: 9.05,
        sem3_gpa: 9.20,
        sem4_gpa: 9.15,
        sem5_gpa: 9.30,
        sem6_gpa: 9.10,
        sem7_gpa: 9.12,
        faculty_mentor_name: 'Dr. Ramesh Kumar',
        mentor_remarks: 'Consistently outstanding in algorithms and system design',
        verification_status: 'VERIFIED'
      },
      {
        registration_number: `2023${deptCode}102`,
        current_cgpa: 8.65,
        active_backlogs: 0,
        cleared_backlogs: 0,
        total_credits_earned: 145,
        sem1_gpa: 8.40,
        sem2_gpa: 8.55,
        sem3_gpa: 8.70,
        sem4_gpa: 8.60,
        sem5_gpa: 8.80,
        sem6_gpa: 8.75,
        sem7_gpa: 8.65,
        faculty_mentor_name: 'Dr. Sunita Sharma',
        mentor_remarks: 'High proficiency in software engineering and cloud tech',
        verification_status: 'VERIFIED'
      }
    ];
  } else {
    // SEMESTER_MARKS
    headers = [
      'registration_number', 'academic_year', 'semester', 'gpa',
      'credits_registered', 'credits_earned', 'active_backlogs', 'attendance_percentage', 'remarks'
    ];
    sampleData = [
      {
        registration_number: `2023${deptCode}101`,
        academic_year: '2026-2027',
        semester: 7,
        gpa: 9.12,
        credits_registered: 22,
        credits_earned: 22,
        active_backlogs: 0,
        attendance_percentage: 95.5,
        remarks: 'Cleared all courses with grade A+'
      },
      {
        registration_number: `2023${deptCode}102`,
        academic_year: '2026-2027',
        semester: 7,
        gpa: 8.65,
        credits_registered: 22,
        credits_earned: 22,
        active_backlogs: 0,
        attendance_percentage: 92.0,
        remarks: 'Cleared all elective courses'
      }
    ];
  }

  if (cleanFormat === 'JSON') {
    return {
      contentType: 'application/json',
      filename: `campuscorp_${deptCode.toLowerCase()}_${dataType.toLowerCase()}_template.json`,
      data: JSON.stringify(sampleData, null, 2)
    };
  }

  if (cleanFormat === 'XLSX') {
    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return {
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `campuscorp_${deptCode.toLowerCase()}_${dataType.toLowerCase()}_template.xlsx`,
      data: buffer
    };
  }

  // Default: CSV
  const csvRows = [headers.join(',')];
  for (const row of sampleData) {
    const line = headers.map(h => sanitizeCsvValue(row[h] ?? '')).join(',');
    csvRows.push(line);
  }
  return {
    contentType: 'text/csv; charset=utf-8',
    filename: `campuscorp_${deptCode.toLowerCase()}_${dataType.toLowerCase()}_template.csv`,
    data: csvRows.join('\r\n')
  };
}

/**
 * Parse uploaded file buffer (CSV, XLSX, or JSON)
 */
function parseUploadedFile(fileBuffer, originalFilename = '') {
  const filename = originalFilename.toLowerCase();
  let rawRows = [];
  let format = 'CSV';

  if (filename.endsWith('.json')) {
    format = 'JSON';
    try {
      const parsed = JSON.parse(fileBuffer.toString('utf8'));
      if (Array.isArray(parsed)) {
        rawRows = parsed;
      } else if (parsed && typeof parsed === 'object') {
        const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        if (arrayKey) {
          rawRows = parsed[arrayKey];
        } else {
          rawRows = [parsed];
        }
      }
    } catch (err) {
      throw new Error(`Failed to parse JSON file: ${err.message}`);
    }
  } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
    format = 'XLSX';
    try {
      const wb = XLSX.read(fileBuffer, { type: 'buffer' });
      const firstSheetName = wb.SheetNames[0];
      if (!firstSheetName) {
        throw new Error('Excel workbook contains no sheets.');
      }
      const ws = wb.Sheets[firstSheetName];
      rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' });
    } catch (err) {
      throw new Error(`Failed to parse Excel file: ${err.message}`);
    }
  } else {
    // CSV
    format = 'CSV';
    try {
      const text = fileBuffer.toString('utf8');
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row.');
      }

      // Simple CSV parser supporting quotes
      const parseCsvLine = (line) => {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const headers = parseCsvLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());
      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.length === 1 && values[0] === '') continue;
        const row = {};
        for (let h = 0; h < headers.length; h++) {
          let val = values[h] ?? '';
          if (typeof val === 'string' && val.startsWith("'")) {
            val = val.substring(1); // Unescape safe formula mark
          }
          row[headers[h]] = val;
        }
        rawRows.push(row);
      }
    } catch (err) {
      throw new Error(`Failed to parse CSV file: ${err.message}`);
    }
  }

  if (rawRows.length === 0) {
    throw new Error('The uploaded file contains no data rows.');
  }

  if (rawRows.length > 5000) {
    throw new Error(`File row limit exceeded: Maximum 5,000 rows permitted per import job (found ${rawRows.length}).`);
  }

  const rawHeaders = Object.keys(rawRows[0] || {});
  return {
    format,
    totalRows: rawRows.length,
    rawHeaders,
    rawRows
  };
}

/**
 * Intelligent automatic column mapper
 */
function buildColumnMapping(fileHeaders, dataType) {
  const mapping = {};
  const lowerFileHeaders = fileHeaders.map(h => ({
    original: h,
    cleaned: h.toLowerCase().trim().replace(/[\s\-_]+/g, '_')
  }));

  for (const [canonicalField, aliases] of Object.entries(FIELD_ALIASES)) {
    const match = lowerFileHeaders.find(lh => 
      aliases.includes(lh.cleaned) || lh.cleaned === canonicalField
    );
    if (match) {
      mapping[canonicalField] = match.original;
    }
  }

  return mapping;
}

/**
 * Validate parsed import batch against department database and schema rules
 */
async function validateImportBatch(deptCode, dataType, rawRows, customMapping = {}, context = {}) {
  const cleanDept = deptCode.toUpperCase();
  const fileHeaders = Object.keys(rawRows[0] || {});
  const columnMapping = { ...buildColumnMapping(fileHeaders, dataType), ...customMapping };

  // Invert mapping for fast lookup: canonicalKey -> fileHeader
  const getVal = (row, canonicalKey) => {
    const fileHeader = columnMapping[canonicalKey];
    if (fileHeader && row[fileHeader] !== undefined) {
      return String(row[fileHeader]).trim();
    }
    // Fallback: direct match
    if (row[canonicalKey] !== undefined) {
      return String(row[canonicalKey]).trim();
    }
    return '';
  };

  // Fetch existing student registration numbers from department DB
  const deptPool = await getDepartmentPool(cleanDept);
  let existingDeptStudents = new Set();
  try {
    const [rows] = await deptPool.query('SELECT register_number FROM students');
    for (const r of rows) existingDeptStudents.add(r.register_number.toUpperCase());
  } catch (err) {
    console.warn(`[VALIDATE] Could not query department students for ${cleanDept}:`, err.message);
  }

  // Fetch existing emails from central users
  let existingUserEmails = new Set();
  try {
    const [uRows] = await commonPool.query('SELECT email FROM users');
    for (const r of uRows) existingUserEmails.add(r.email.toLowerCase());
  } catch (err) {}

  const parsedRecords = [];
  const seenRegsInFile = new Map(); // reg -> rowNumber
  const seenEmailsInFile = new Map(); // email -> rowNumber

  let validCount = 0;
  let invalidCount = 0;
  let duplicateCount = 0;
  let newCount = 0;
  let existingCount = 0;

  for (let idx = 0; idx < rawRows.length; idx++) {
    const row = rawRows[idx];
    const rowNum = idx + 1;
    const errors = [];
    const warnings = [];

    const regNo = getVal(row, 'register_number').toUpperCase();
    let email = getVal(row, 'email').toLowerCase();
    const firstName = getVal(row, 'first_name');
    const lastName = getVal(row, 'last_name');
    const fullName = getVal(row, 'full_name');
    const phone = getVal(row, 'phone');
    const fileDept = (getVal(row, 'department_code') || cleanDept).toUpperCase();
    const programme = getVal(row, 'programme') || context.programme || 'B.Tech';
    const batch = getVal(row, 'admission_batch') || context.admission_batch || '2023-2027';
    const academicYear = getVal(row, 'academic_year') || context.academic_year || '2026-2027';
    const yearOfStudy = parseInt(getVal(row, 'year_of_study') || context.year_of_study || 4, 10);
    const semester = parseInt(getVal(row, 'semester') || context.semester || 7, 10);
    const className = getVal(row, 'class_name') || context.class_name || `${cleanDept}-A`;
    const section = getVal(row, 'section') || context.section || 'A';
    const placementStatus = getVal(row, 'placement_status') || 'REGISTERED';
    const academicStatus = getVal(row, 'academic_status') || 'REGULAR';

    // 1. Registration Number validation
    if (!regNo) {
      errors.push('Registration number is required.');
    } else if (!/^[A-Z0-9_\-\/]{3,50}$/.test(regNo)) {
      errors.push(`Registration number '${regNo}' has invalid format (alphanumeric 3-50 chars).`);
    }

    // In-file duplicate registration check
    if (regNo) {
      if (seenRegsInFile.has(regNo)) {
        errors.push(`Duplicate registration number '${regNo}' found in file (already on row ${seenRegsInFile.get(regNo)}).`);
      } else {
        seenRegsInFile.set(regNo, rowNum);
      }
    }

    // 2. Department check
    if (fileDept && fileDept !== cleanDept) {
      errors.push(`Department mismatch: File row specified '${fileDept}', but selected target is '${cleanDept}'.`);
    }

    // 3. Type-specific validations
    if (dataType === 'STUDENT_MASTER') {
      let resolvedFirstName = firstName;
      let resolvedLastName = lastName;
      if (!resolvedFirstName && fullName) {
        const parts = fullName.split(' ');
        resolvedFirstName = parts[0];
        resolvedLastName = parts.slice(1).join(' ') || '.';
      }

      if (!resolvedFirstName) {
        errors.push('First name or full name is required.');
      }

      if (!email) {
        // Fallback construct email if missing
        email = `${regNo.toLowerCase()}@college.edu`;
        warnings.push(`Institutional email missing; default auto-generated as '${email}'.`);
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push(`Invalid email format: '${email}'.`);
      }

      if (email) {
        if (seenEmailsInFile.has(email)) {
          errors.push(`Duplicate email '${email}' found in file (already on row ${seenEmailsInFile.get(email)}).`);
        } else {
          seenEmailsInFile.set(email, rowNum);
        }
      }

      if (isNaN(yearOfStudy) || yearOfStudy < 1 || yearOfStudy > 6) {
        errors.push(`Invalid year of study '${yearOfStudy}'. Must be between 1 and 6.`);
      }

      if (isNaN(semester) || semester < 1 || semester > 12) {
        errors.push(`Invalid semester '${semester}'. Must be between 1 and 12.`);
      }
    } else if (dataType === 'ACADEMIC_RECORDS') {
      const cgpaStr = getVal(row, 'current_cgpa');
      const cgpa = parseFloat(cgpaStr);
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        errors.push(`CGPA '${cgpaStr}' is invalid. Must be a numeric value between 0.00 and 10.00.`);
      }

      const backlogsStr = getVal(row, 'active_backlogs');
      if (backlogsStr && (isNaN(parseInt(backlogsStr, 10)) || parseInt(backlogsStr, 10) < 0)) {
        errors.push(`Active backlogs '${backlogsStr}' must be a non-negative integer.`);
      }
    } else if (dataType === 'SEMESTER_MARKS') {
      const gpaStr = getVal(row, 'current_cgpa') || getVal(row, 'gpa') || '0';
      const gpa = parseFloat(gpaStr);
      if (isNaN(gpa) || gpa < 0 || gpa > 10) {
        errors.push(`Semester GPA '${gpaStr}' must be between 0.00 and 10.00.`);
      }
    }

    // Check if record already exists in database
    const existsInDb = existingDeptStudents.has(regNo);
    const isDuplicate = errors.some(e => e.includes('Duplicate'));

    let status = 'VALID';
    if (errors.length > 0) {
      if (isDuplicate) {
        status = 'DUPLICATE_IN_FILE';
        duplicateCount++;
      } else {
        status = 'INVALID';
        invalidCount++;
      }
    } else {
      validCount++;
      if (existsInDb) {
        existingCount++;
      } else {
        newCount++;
      }
    }

    parsedRecords.push({
      rowNumber: rowNum,
      register_number: regNo,
      first_name: firstName || (fullName ? fullName.split(' ')[0] : ''),
      last_name: lastName || (fullName ? fullName.split(' ').slice(1).join(' ') || '.' : '.'),
      email,
      phone,
      department_code: cleanDept,
      programme,
      admission_batch: batch,
      academic_year: academicYear,
      year_of_study: yearOfStudy,
      semester,
      class_name: className,
      section,
      placement_status: placementStatus,
      academic_status: academicStatus,
      // Academic record fields
      current_cgpa: parseFloat(getVal(row, 'current_cgpa') || getVal(row, 'gpa') || '0.00') || 0.00,
      active_backlogs: parseInt(getVal(row, 'active_backlogs') || '0', 10) || 0,
      cleared_backlogs: parseInt(getVal(row, 'cleared_backlogs') || '0', 10) || 0,
      total_credits_earned: parseInt(getVal(row, 'total_credits_earned') || '0', 10) || 0,
      sem1_gpa: parseFloat(getVal(row, 'sem1_gpa') || '0.00') || 0.00,
      sem2_gpa: parseFloat(getVal(row, 'sem2_gpa') || '0.00') || 0.00,
      sem3_gpa: parseFloat(getVal(row, 'sem3_gpa') || '0.00') || 0.00,
      sem4_gpa: parseFloat(getVal(row, 'sem4_gpa') || '0.00') || 0.00,
      sem5_gpa: parseFloat(getVal(row, 'sem5_gpa') || '0.00') || 0.00,
      sem6_gpa: parseFloat(getVal(row, 'sem6_gpa') || '0.00') || 0.00,
      sem7_gpa: parseFloat(getVal(row, 'sem7_gpa') || '0.00') || 0.00,
      sem8_gpa: parseFloat(getVal(row, 'sem8_gpa') || '0.00') || 0.00,
      faculty_mentor_name: getVal(row, 'faculty_mentor_name') || null,
      mentor_remarks: getVal(row, 'mentor_remarks') || null,
      verification_status: getVal(row, 'verification_status') || 'VERIFIED',
      attendance_percentage: parseFloat(getVal(row, 'attendance_percentage') || '100.00') || 100.00,
      status,
      existsInDb,
      errors,
      warnings,
      rawRow: row
    });
  }

  return {
    summary: {
      totalRows: rawRows.length,
      validRows: validCount,
      invalidRows: invalidCount,
      duplicateRows: duplicateCount,
      newRecords: newCount,
      existingRecords: existingCount,
      canImport: validCount > 0
    },
    columnMapping,
    records: parsedRecords
  };
}

/**
 * Execute validated records into isolated Department MySQL database under transaction
 */
async function executeImport(deptCode, dataType, recordsToImport, importMode = 'UPSERT', userContext = null, metadata = {}) {
  const cleanDept = deptCode.toUpperCase();
  const deptPool = await getDepartmentPool(cleanDept);

  const validRecords = recordsToImport.filter(r => r.status === 'VALID' || (r.errors && r.errors.length === 0));
  const rejectedRecords = recordsToImport.filter(r => r.status !== 'VALID' && r.errors && r.errors.length > 0);

  if (validRecords.length === 0) {
    throw new Error('No valid records found for import.');
  }

  const jobUuid = uuidv4();
  const deptConn = await deptPool.getConnection();
  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  // Pre-generate student default password hash for any user accounts
  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  try {
    await deptConn.beginTransaction();

    for (const rec of validRecords) {
      if (importMode === 'INSERT_ONLY' && rec.existsInDb) {
        skippedCount++;
        continue;
      }
      if (importMode === 'UPDATE_EXISTING' && !rec.existsInDb) {
        skippedCount++;
        continue;
      }

      if (dataType === 'STUDENT_MASTER') {
        // 1. Ensure class & section exist in department database
        try {
          await deptConn.query(`
            INSERT IGNORE INTO classes (class_name, academic_year, admission_batch, year_of_study, semester)
            VALUES (?, ?, ?, ?, ?)
          `, [rec.class_name, rec.academic_year, rec.admission_batch, rec.year_of_study, rec.semester]);

          const [clsRows] = await deptConn.query(
            'SELECT id FROM classes WHERE class_name = ? AND admission_batch = ? AND semester = ?',
            [rec.class_name, rec.admission_batch, rec.semester]
          );
          if (clsRows.length > 0) {
            await deptConn.query(`
              INSERT IGNORE INTO sections (class_id, section_name, capacity)
              VALUES (?, ?, 60)
            `, [clsRows[0].id, rec.section]);
          }
        } catch (clsErr) {
          console.warn('[IMPORT] Class/section note:', clsErr.message);
        }

        // 2. Insert or update student in isolated department DB
        await deptConn.query(`
          INSERT INTO students 
          (register_number, first_name, last_name, email, phone, department_code, programme, admission_batch, academic_year, year_of_study, current_semester, class_name, section, academic_status, placement_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            first_name = VALUES(first_name),
            last_name = VALUES(last_name),
            email = VALUES(email),
            phone = VALUES(phone),
            programme = VALUES(programme),
            admission_batch = VALUES(admission_batch),
            academic_year = VALUES(academic_year),
            year_of_study = VALUES(year_of_study),
            current_semester = VALUES(current_semester),
            class_name = VALUES(class_name),
            section = VALUES(section),
            academic_status = VALUES(academic_status),
            placement_status = VALUES(placement_status)
        `, [
          rec.register_number, rec.first_name, rec.last_name, rec.email, rec.phone || null,
          rec.department_code, rec.programme, rec.admission_batch, rec.academic_year,
          rec.year_of_study, rec.semester, rec.class_name, rec.section, rec.academic_status, rec.placement_status
        ]);

        // 3. Ensure student_profiles row exists
        await deptConn.query(`
          INSERT INTO student_profiles (register_number)
          VALUES (?)
          ON DUPLICATE KEY UPDATE updated_at = NOW()
        `, [rec.register_number]);

        // 4. Ensure baseline student_academic_records row exists
        await deptConn.query(`
          INSERT INTO student_academic_records (register_number, current_cgpa)
          VALUES (?, 0.00)
          ON DUPLICATE KEY UPDATE current_cgpa = VALUES(current_cgpa)
        `, [rec.register_number]);

        // 5. Sync into master DB users & students_master so student can log into CampusCorp
        try {
          // Check if user exists by email
          const [uRows] = await commonPool.query('SELECT id FROM users WHERE email = ?', [rec.email]);
          let userId;
          if (uRows.length > 0) {
            userId = uRows[0].id;
            await commonPool.query(`
              UPDATE users 
              SET first_name = ?, last_name = ?, phone = ?, department_code = ?
              WHERE id = ?
            `, [rec.first_name, rec.last_name, rec.phone || null, cleanDept, userId]);
          } else {
            const [insRes] = await commonPool.query(`
              INSERT INTO users (uuid, email, password_hash, role_id, role_name, first_name, last_name, phone, department_code, status)
              VALUES (?, ?, ?, 1, 'STUDENT', ?, ?, ?, ?, 'ACTIVE')
            `, [uuidv4(), rec.email, defaultPasswordHash, rec.first_name, rec.last_name, rec.phone || null, cleanDept]);
            userId = insRes.insertId;
          }

          // Sync students_master
          await commonPool.query(`
            INSERT INTO students_master 
            (user_id, register_number, department_code, programme, batch, graduation_year, academic_year, current_semester, placement_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              user_id = VALUES(user_id),
              department_code = VALUES(department_code),
              programme = VALUES(programme),
              batch = VALUES(batch),
              academic_year = VALUES(academic_year),
              current_semester = VALUES(current_semester),
              placement_status = VALUES(placement_status)
          `, [
            userId, rec.register_number, cleanDept, rec.programme, rec.admission_batch,
            parseInt(rec.admission_batch.split('-')[1] || 2027, 10), rec.academic_year,
            rec.semester, rec.placement_status
          ]);
        } catch (masterSyncErr) {
          console.warn(`[IMPORT] Master sync warning for ${rec.register_number}:`, masterSyncErr.message);
        }

        if (rec.existsInDb) updatedCount++;
        else importedCount++;
      } else if (dataType === 'ACADEMIC_RECORDS') {
        // Academic records update
        await deptConn.query(`
          INSERT INTO student_academic_records 
          (register_number, current_cgpa, active_backlogs, cleared_backlogs, total_credits_earned, sem1_gpa, sem2_gpa, sem3_gpa, sem4_gpa, sem5_gpa, sem6_gpa, sem7_gpa, sem8_gpa, faculty_mentor_name, mentor_remarks, verification_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            current_cgpa = VALUES(current_cgpa),
            active_backlogs = VALUES(active_backlogs),
            cleared_backlogs = VALUES(cleared_backlogs),
            total_credits_earned = VALUES(total_credits_earned),
            sem1_gpa = VALUES(sem1_gpa),
            sem2_gpa = VALUES(sem2_gpa),
            sem3_gpa = VALUES(sem3_gpa),
            sem4_gpa = VALUES(sem4_gpa),
            sem5_gpa = VALUES(sem5_gpa),
            sem6_gpa = VALUES(sem6_gpa),
            sem7_gpa = VALUES(sem7_gpa),
            sem8_gpa = VALUES(sem8_gpa),
            faculty_mentor_name = VALUES(faculty_mentor_name),
            mentor_remarks = VALUES(mentor_remarks),
            verification_status = VALUES(verification_status)
        `, [
          rec.register_number, rec.current_cgpa, rec.active_backlogs, rec.cleared_backlogs,
          rec.total_credits_earned, rec.sem1_gpa, rec.sem2_gpa, rec.sem3_gpa, rec.sem4_gpa,
          rec.sem5_gpa, rec.sem6_gpa, rec.sem7_gpa, rec.sem8_gpa, rec.faculty_mentor_name,
          rec.mentor_remarks, rec.verification_status
        ]);

        // Sync legacy dept_students_academic for compatibility
        await deptConn.query(`
          INSERT INTO dept_students_academic
          (register_number, current_cgpa, active_backlogs, cleared_backlogs, sem1_gpa, sem2_gpa, sem3_gpa, sem4_gpa, sem5_gpa, sem6_gpa, sem7_gpa, sem8_gpa, faculty_mentor_name, mentor_remarks, verification_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            current_cgpa = VALUES(current_cgpa),
            active_backlogs = VALUES(active_backlogs),
            sem1_gpa = VALUES(sem1_gpa),
            sem2_gpa = VALUES(sem2_gpa)
        `, [
          rec.register_number, rec.current_cgpa, rec.active_backlogs, rec.cleared_backlogs,
          rec.sem1_gpa, rec.sem2_gpa, rec.sem3_gpa, rec.sem4_gpa, rec.sem5_gpa, rec.sem6_gpa, rec.sem7_gpa, rec.sem8_gpa,
          rec.faculty_mentor_name, rec.mentor_remarks, rec.verification_status
        ]);

        // Sync CGPA in master DB
        try {
          await commonPool.query(`
            UPDATE students_master 
            SET cgpa = ?, active_backlogs = ? 
            WHERE register_number = ?
          `, [rec.current_cgpa, rec.active_backlogs, rec.register_number]);
        } catch (e) {}

        importedCount++;
      } else if (dataType === 'SEMESTER_MARKS') {
        // Individual semester record
        await deptConn.query(`
          INSERT INTO semester_records 
          (register_number, academic_year, semester, gpa, credits_registered, credits_earned, active_backlogs, attendance_percentage)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            gpa = VALUES(gpa),
            credits_registered = VALUES(credits_registered),
            credits_earned = VALUES(credits_earned),
            active_backlogs = VALUES(active_backlogs),
            attendance_percentage = VALUES(attendance_percentage)
        `, [
          rec.register_number, rec.academic_year, rec.semester, rec.current_cgpa,
          20, 20, rec.active_backlogs, rec.attendance_percentage
        ]);
        importedCount++;
      }
    }

    // Record department audit log
    await deptConn.query(`
      INSERT INTO dept_audit_logs (action, performed_by, details)
      VALUES (?, ?, ?)
    `, [
      `BULK_IMPORT_${dataType}`,
      userContext?.email || 'Administrator',
      `Imported ${importedCount} records, updated ${updatedCount}, skipped ${skippedCount} using ${importMode} mode.`
    ]);

    await deptConn.commit();

    // Record Master Job in import_jobs
    const totalProcessed = recordsToImport.length;
    const finalStatus = rejectedRecords.length === 0 ? 'COMPLETED' : (importedCount + updatedCount > 0 ? 'COMPLETED' : 'FAILED');

    await commonPool.query(`
      INSERT INTO import_jobs 
      (job_uuid, dept_code, academic_year, admission_batch, semester, class_name, section, data_type, import_mode, file_name, file_format, file_size_bytes, total_rows, valid_rows, invalid_rows, duplicate_rows, imported_rows, status, summary_notes, error_report_json, uploaded_by_user_id, uploaded_by_name, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      jobUuid,
      cleanDept,
      metadata.academic_year || null,
      metadata.admission_batch || null,
      metadata.semester || null,
      metadata.class_name || null,
      metadata.section || null,
      dataType,
      importMode,
      metadata.fileName || 'bulk_upload.csv',
      metadata.fileFormat || 'CSV',
      metadata.fileSizeBytes || 0,
      totalProcessed,
      validRecords.length,
      rejectedRecords.length,
      skippedCount,
      importedCount + updatedCount,
      finalStatus,
      `Successfully processed ${importedCount + updatedCount} of ${totalProcessed} records into ${cleanDept} database.`,
      rejectedRecords.length > 0 ? JSON.stringify(rejectedRecords.map(r => ({ row: r.rowNumber, reg: r.register_number, errors: r.errors }))) : null,
      userContext?.id || null,
      userContext ? `${userContext.first_name} ${userContext.last_name}` : 'Administrator'
    ]);

    // Master audit log
    await commonPool.query(`
      INSERT INTO audit_logs (user_id, action, module, details)
      VALUES (?, 'BULK_DATA_IMPORTED', 'Student Data Import', ?)
    `, [
      userContext?.id || 1,
      `Imported ${importedCount + updatedCount} ${dataType} records for ${cleanDept} into isolated database (Job ID: ${jobUuid})`
    ]);

    return {
      success: true,
      jobUuid,
      deptCode: cleanDept,
      dataType,
      importMode,
      totalProcessed,
      importedRows: importedCount + updatedCount,
      newCreated: importedCount,
      updated: updatedCount,
      skipped: skippedCount,
      rejectedRows: rejectedRecords.length,
      status: finalStatus
    };
  } catch (err) {
    await deptConn.rollback();
    console.error('[IMPORT FAILED ROLLBACK]:', err);
    throw new Error(`Import failed and was rolled back: ${err.message}`);
  } finally {
    deptConn.release();
  }
}

/**
 * Generate CSV Error Report for rejected records
 */
function generateErrorReportCsv(rejectedRecords, originalFilename = 'upload') {
  const headers = ['Row Number', 'Registration Number', 'Email', 'Error Details'];
  const lines = [headers.join(',')];

  for (const rec of rejectedRecords) {
    const rowNum = rec.rowNumber || '';
    const reg = sanitizeCsvValue(rec.register_number || rec.reg || '');
    const email = sanitizeCsvValue(rec.email || '');
    const errText = sanitizeCsvValue(Array.isArray(rec.errors) ? rec.errors.join('; ') : (rec.errors || 'Validation error'));
    lines.push([rowNum, reg, email, errText].join(','));
  }

  return {
    contentType: 'text/csv; charset=utf-8',
    filename: `error_report_${originalFilename.replace(/\.[^/.]+$/, '')}_${Date.now()}.csv`,
    data: lines.join('\r\n')
  };
}

module.exports = {
  FIELD_ALIASES,
  generateTemplate,
  parseUploadedFile,
  buildColumnMapping,
  validateImportBatch,
  executeImport,
  generateErrorReportCsv,
};
