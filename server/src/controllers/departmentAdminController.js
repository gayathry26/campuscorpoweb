const { commonPool, getDepartmentPool, invalidateDepartmentPool } = require('../config/db');
const {
  validateDepartmentCode,
  generateDatabaseName,
  provisionDepartmentDatabase,
  verifyDepartmentDatabase,
  getAllDepartmentDatabaseStatus,
} = require('../services/departmentProvisioningService');
const {
  generateTemplate,
  parseUploadedFile,
  validateImportBatch,
  executeImport,
  generateErrorReportCsv,
} = require('../services/bulkImportService');

/**
 * 1. Get all departments with database status and metrics
 */
async function getDepartments(req, res, next) {
  try {
    const [departments] = await commonPool.query(`
      SELECT dd.*,
             (SELECT COUNT(*) FROM academic_structures WHERE dept_code = dd.dept_code) AS academic_structures_count
      FROM department_databases dd
      ORDER BY dd.dept_code ASC
    `);

    // Enrich with live student counts from isolated department databases
    const enriched = await Promise.all(
      departments.map(async (dept) => {
        let studentCount = 0;
        try {
          const pool = await getDepartmentPool(dept.dept_code);
          const [sRows] = await pool.query('SELECT COUNT(*) AS cnt FROM students');
          studentCount = sRows[0].cnt;
        } catch (e) {
          studentCount = 0;
        }
        return {
          ...dept,
          studentCount,
        };
      })
    );

    res.json({
      success: true,
      data: enriched,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 2. Get single department details
 */
async function getDepartmentByCode(req, res, next) {
  try {
    const { deptCode } = req.params;
    const cleanCode = validateDepartmentCode(deptCode);

    const [rows] = await commonPool.query(
      'SELECT * FROM department_databases WHERE dept_code = ?',
      [cleanCode]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Department '${cleanCode}' not found.` });
    }

    const dept = rows[0];
    const verification = await verifyDepartmentDatabase(cleanCode);

    res.json({
      success: true,
      data: {
        ...dept,
        databaseHealth: verification,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 3. Create a new department and provision its isolated MySQL database
 */
async function createDepartment(req, res, next) {
  try {
    const {
      dept_code,
      dept_name,
      description,
      hod_name,
      hod_email,
      duration_years = 4,
      total_semesters = 8,
      auto_provision = true,
      update_if_exists = false,
    } = req.body;

    const cleanCode = validateDepartmentCode(dept_code);

    if (!dept_name || typeof dept_name !== 'string' || dept_name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Department name is required.' });
    }

    // Check if code already exists in master registry
    const [existing] = await commonPool.query(
      'SELECT id, dept_code, database_name, provisioning_status FROM department_databases WHERE dept_code = ?',
      [cleanCode]
    );

    if (existing.length > 0) {
      if (!update_if_exists) {
        return res.status(409).json({
          success: false,
          code: 'DEPARTMENT_EXISTS',
          message: `Department with code '${cleanCode}' already exists in the institutional registry.`,
          existingDept: existing[0],
          canUpdate: true,
        });
      }

      // Update existing record
      await commonPool.query(`
        UPDATE department_databases 
        SET dept_name = ?,
            description = COALESCE(?, description),
            hod_name = COALESCE(?, hod_name),
            hod_email = COALESCE(?, hod_email),
            duration_years = COALESCE(?, duration_years),
            total_semesters = COALESCE(?, total_semesters),
            is_active = 1
        WHERE dept_code = ?
      `, [
        dept_name.trim(),
        description ? description.trim() : null,
        hod_name ? hod_name.trim() : null,
        hod_email ? hod_email.trim() : null,
        parseInt(duration_years, 10),
        parseInt(total_semesters, 10),
        cleanCode,
      ]);
    }

    const targetDbName = existing.length > 0 && existing[0].database_name
      ? existing[0].database_name
      : generateDatabaseName(cleanCode);

    // Provision the dedicated MySQL database
    let provisionResult = null;
    if (auto_provision) {
      provisionResult = await provisionDepartmentDatabase(
        {
          dept_code: cleanCode,
          dept_name: dept_name.trim(),
          description: description ? description.trim() : null,
          hod_name: hod_name ? hod_name.trim() : null,
          hod_email: hod_email ? hod_email.trim() : null,
          duration_years: parseInt(duration_years, 10),
          total_semesters: parseInt(total_semesters, 10),
        },
        req.user
      );
      await invalidateDepartmentPool(cleanCode);
    } else if (existing.length === 0) {
      await commonPool.query(`
        INSERT INTO department_databases 
        (dept_code, dept_name, database_name, is_active, description, hod_name, hod_email, duration_years, total_semesters, provisioning_status)
        VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, 'PENDING')
      `, [
        cleanCode, dept_name.trim(), targetDbName, description ? description.trim() : null,
        hod_name ? hod_name.trim() : null, hod_email ? hod_email.trim() : null,
        parseInt(duration_years, 10), parseInt(total_semesters, 10)
      ]);
    }

    // Fetch newly created/updated record
    const [deptRows] = await commonPool.query(
      'SELECT * FROM department_databases WHERE dept_code = ?',
      [cleanCode]
    );

    const isUpdate = existing.length > 0;
    res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate
        ? `Department '${cleanCode}' successfully updated and isolated database '${targetDbName}' provisioned!`
        : `Department '${cleanCode}' successfully created and isolated database '${targetDbName}' provisioned!`,
      data: deptRows[0],
      provisionResult,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 4. Update department information
 */
async function updateDepartment(req, res, next) {
  try {
    const { deptCode } = req.params;
    const cleanCode = validateDepartmentCode(deptCode);
    const {
      dept_name,
      description,
      hod_name,
      hod_email,
      duration_years,
      total_semesters,
      is_active,
    } = req.body;

    const [existing] = await commonPool.query(
      'SELECT * FROM department_databases WHERE dept_code = ?',
      [cleanCode]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Department '${cleanCode}' not found.` });
    }

    await commonPool.query(`
      UPDATE department_databases 
      SET dept_name = COALESCE(?, dept_name),
          description = COALESCE(?, description),
          hod_name = COALESCE(?, hod_name),
          hod_email = COALESCE(?, hod_email),
          duration_years = COALESCE(?, duration_years),
          total_semesters = COALESCE(?, total_semesters),
          is_active = COALESCE(?, is_active)
      WHERE dept_code = ?
    `, [
      dept_name ? dept_name.trim() : null,
      description !== undefined ? description : null,
      hod_name !== undefined ? hod_name : null,
      hod_email !== undefined ? hod_email : null,
      duration_years ? parseInt(duration_years, 10) : null,
      total_semesters ? parseInt(total_semesters, 10) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      cleanCode,
    ]);

    // Audit log
    await commonPool.query(`
      INSERT INTO audit_logs (user_id, action, module, details)
      VALUES (?, 'DEPARTMENT_UPDATED', 'Department Management', ?)
    `, [req.user?.id || 1, `Updated configuration for department ${cleanCode}`]);

    const [updated] = await commonPool.query(
      'SELECT * FROM department_databases WHERE dept_code = ?',
      [cleanCode]
    );

    res.json({
      success: true,
      message: `Department '${cleanCode}' successfully updated.`,
      data: updated[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 5. Provision or re-provision department database
 */
async function provisionDepartmentDb(req, res, next) {
  try {
    const { deptCode } = req.params;
    const cleanCode = validateDepartmentCode(deptCode);

    const [existing] = await commonPool.query(
      'SELECT * FROM department_databases WHERE dept_code = ?',
      [cleanCode]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Department '${cleanCode}' not found.` });
    }

    const dept = existing[0];
    const result = await provisionDepartmentDatabase(dept, req.user);
    await invalidateDepartmentPool(cleanCode);

    res.json({
      success: true,
      message: `Isolated database '${result.databaseName}' for department '${cleanCode}' successfully provisioned and verified.`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 6. Verify department database health
 */
async function verifyDepartmentDb(req, res, next) {
  try {
    const { deptCode } = req.params;
    const cleanCode = validateDepartmentCode(deptCode);
    const verification = await verifyDepartmentDatabase(cleanCode);

    res.json({
      success: true,
      data: verification,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 7. Get academic structures with student counts
 */
async function getAcademicStructures(req, res, next) {
  try {
    const { department, academic_year, batch, semester } = req.query;

    let sql = 'SELECT * FROM academic_structures WHERE 1=1';
    const params = [];

    if (department) {
      sql += ' AND dept_code = ?';
      params.push(department.toUpperCase());
    }
    if (academic_year) {
      sql += ' AND academic_year = ?';
      params.push(academic_year);
    }
    if (batch) {
      sql += ' AND admission_batch = ?';
      params.push(batch);
    }
    if (semester) {
      sql += ' AND semester = ?';
      params.push(parseInt(semester, 10));
    }

    sql += ' ORDER BY dept_code ASC, academic_year DESC, semester ASC, class_name ASC, section ASC';

    const [structures] = await commonPool.query(sql, params);

    // Enrich with actual enrolled student count per group from the isolated department DB
    const enriched = await Promise.all(
      structures.map(async (st) => {
        let enrolledStudents = 0;
        try {
          const pool = await getDepartmentPool(st.dept_code);
          const [cRows] = await pool.query(
            'SELECT COUNT(*) AS cnt FROM students WHERE class_name = ? AND section = ? AND admission_batch = ?',
            [st.class_name, st.section, st.admission_batch]
          );
          enrolledStudents = cRows[0].cnt;
        } catch (e) {
          enrolledStudents = 0;
        }
        return {
          ...st,
          enrolledStudents,
        };
      })
    );

    res.json({
      success: true,
      data: enriched,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 8. Create academic structure configuration
 */
async function createAcademicStructure(req, res, next) {
  try {
    const {
      dept_code,
      academic_year,
      admission_batch,
      programme_name = 'B.Tech',
      duration_years = 4,
      total_semesters = 8,
      year_of_study = 1,
      semester = 1,
      class_name,
      section = 'A',
      class_advisor_name,
      class_advisor_email,
      max_capacity = 60,
    } = req.body;

    const cleanDept = validateDepartmentCode(dept_code);

    if (!academic_year || !admission_batch || !class_name) {
      return res.status(400).json({
        success: false,
        message: 'Department, academic year, admission batch, and class name are required fields.',
      });
    }

    // Insert into master academic_structures table
    const [result] = await commonPool.query(`
      INSERT INTO academic_structures 
      (dept_code, academic_year, admission_batch, programme_name, duration_years, total_semesters, year_of_study, semester, class_name, section, class_advisor_name, class_advisor_email, max_capacity, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      cleanDept, academic_year.trim(), admission_batch.trim(), programme_name.trim(),
      parseInt(duration_years, 10), parseInt(total_semesters, 10), parseInt(year_of_study, 10),
      parseInt(semester, 10), class_name.trim(), section.trim().toUpperCase(),
      class_advisor_name ? class_advisor_name.trim() : null,
      class_advisor_email ? class_advisor_email.trim() : null,
      parseInt(max_capacity, 10) || 60,
    ]);

    // Also ensure classes & sections exist in department database
    try {
      const deptPool = await getDepartmentPool(cleanDept);
      await deptPool.query(`
        INSERT IGNORE INTO classes (class_name, academic_year, admission_batch, year_of_study, semester, faculty_advisor)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [class_name.trim(), academic_year.trim(), admission_batch.trim(), parseInt(year_of_study, 10), parseInt(semester, 10), class_advisor_name || null]);

      const [cRows] = await deptPool.query(
        'SELECT id FROM classes WHERE class_name = ? AND admission_batch = ? AND semester = ?',
        [class_name.trim(), admission_batch.trim(), parseInt(semester, 10)]
      );
      if (cRows.length > 0) {
        await deptPool.query(`
          INSERT IGNORE INTO sections (class_id, section_name, capacity)
          VALUES (?, ?, ?)
        `, [cRows[0].id, section.trim().toUpperCase(), parseInt(max_capacity, 10) || 60]);
      }
    } catch (deptErr) {
      console.warn('[ACADEMIC] Note updating department schema:', deptErr.message);
    }

    const [newRecord] = await commonPool.query(
      'SELECT * FROM academic_structures WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Academic structure configuration created successfully.',
      data: newRecord[0],
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'This academic configuration (department, year, batch, semester, class, section) already exists.',
      });
    }
    next(err);
  }
}

/**
 * 9. Update academic structure
 */
async function updateAcademicStructure(req, res, next) {
  try {
    const { id } = req.params;
    const {
      class_advisor_name,
      class_advisor_email,
      max_capacity,
      is_active,
    } = req.body;

    await commonPool.query(`
      UPDATE academic_structures
      SET class_advisor_name = COALESCE(?, class_advisor_name),
          class_advisor_email = COALESCE(?, class_advisor_email),
          max_capacity = COALESCE(?, max_capacity),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `, [
      class_advisor_name !== undefined ? class_advisor_name : null,
      class_advisor_email !== undefined ? class_advisor_email : null,
      max_capacity ? parseInt(max_capacity, 10) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      id,
    ]);

    const [updated] = await commonPool.query(
      'SELECT * FROM academic_structures WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Academic structure updated successfully.',
      data: updated[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 10. Delete academic structure
 */
async function deleteAcademicStructure(req, res, next) {
  try {
    const { id } = req.params;
    await commonPool.query('DELETE FROM academic_structures WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Academic structure configuration deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 11. Download sample template for CSV, XLSX, or JSON
 */
async function downloadTemplate(req, res, next) {
  try {
    const { dataType = 'STUDENT_MASTER', format = 'CSV', department = 'CSE' } = req.query;
    const cleanFormat = format.toUpperCase();
    const cleanType = dataType.toUpperCase();
    const cleanDept = department.toUpperCase();

    const template = generateTemplate(cleanType, cleanFormat, cleanDept);

    res.setHeader('Content-Type', template.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${template.filename}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    return res.send(template.data);
  } catch (err) {
    next(err);
  }
}

/**
 * 12. Preview and validate bulk file upload
 */
async function previewAndValidateImport(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please upload a .csv, .xlsx, or .json file.' });
    }

    const {
      department,
      data_type = 'STUDENT_MASTER',
      academic_year,
      admission_batch,
      year_of_study,
      semester,
      class_name,
      section,
    } = req.body;

    if (!department) {
      return res.status(400).json({ success: false, message: 'Target department is required.' });
    }

    const cleanDept = validateDepartmentCode(department);
    const cleanType = data_type.toUpperCase();

    // Parse uploaded file
    const parsedFile = parseUploadedFile(req.file.buffer, req.file.originalname);

    // Validate parsed rows
    const validationResult = await validateImportBatch(
      cleanDept,
      cleanType,
      parsedFile.rawRows,
      {},
      {
        academic_year,
        admission_batch,
        year_of_study,
        semester,
        class_name,
        section,
      }
    );

    res.json({
      success: true,
      fileInfo: {
        fileName: req.file.originalname,
        fileFormat: parsedFile.format,
        fileSizeBytes: req.file.size,
        totalRows: parsedFile.totalRows,
      },
      summary: validationResult.summary,
      columnMapping: validationResult.columnMapping,
      recordsPreview: validationResult.records.slice(0, 50), // First 50 rows for snappy preview
      allRecords: validationResult.records,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 13. Confirm and commit import into isolated department database
 */
async function confirmImport(req, res, next) {
  try {
    const {
      department,
      data_type = 'STUDENT_MASTER',
      import_mode = 'UPSERT',
      records,
      metadata = {},
    } = req.body;

    if (!department) {
      return res.status(400).json({ success: false, message: 'Target department is required.' });
    }
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Records array is required and must not be empty.' });
    }

    const cleanDept = validateDepartmentCode(department);
    const cleanType = data_type.toUpperCase();

    const outcome = await executeImport(
      cleanDept,
      cleanType,
      records,
      import_mode,
      req.user,
      metadata
    );

    res.json({
      success: true,
      message: `Successfully imported ${outcome.importedRows} records into isolated ${cleanDept} database.`,
      data: outcome,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 14. Get import history
 */
async function getImportHistory(req, res, next) {
  try {
    const { department, status, limit = 50 } = req.query;

    let sql = 'SELECT * FROM import_jobs WHERE 1=1';
    const params = [];

    if (department) {
      sql += ' AND dept_code = ?';
      params.push(department.toUpperCase());
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status.toUpperCase());
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const [rows] = await commonPool.query(sql, params);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 15. Download Error Report CSV for an import job
 */
async function downloadErrorReport(req, res, next) {
  try {
    const { jobId } = req.params;

    const [rows] = await commonPool.query(
      'SELECT * FROM import_jobs WHERE id = ? OR job_uuid = ?',
      [jobId, jobId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Import job not found.' });
    }

    const job = rows[0];
    let rejectedRecords = [];

    if (job.error_report_json) {
      try {
        rejectedRecords = JSON.parse(job.error_report_json);
      } catch (e) {}
    }

    if (rejectedRecords.length === 0) {
      return res.status(404).json({ success: false, message: 'No rejected records found for this job.' });
    }

    const report = generateErrorReportCsv(rejectedRecords, job.file_name);

    res.setHeader('Content-Type', report.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    return res.send(report.data);
  } catch (err) {
    next(err);
  }
}

/**
 * 16. Comprehensive Database Status for all department tenants
 */
async function getDatabaseStatus(req, res, next) {
  try {
    const statusData = await getAllDepartmentDatabaseStatus();
    res.json({
      success: true,
      data: statusData,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 17. Persistent Backend Draft Management for Multi-step Wizards
 */
let draftTableEnsured = false;
async function ensureDraftTableExists() {
  if (draftTableEnsured) return;
  try {
    await commonPool.query(`
      CREATE TABLE IF NOT EXISTS admin_wizard_drafts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        wizard_type VARCHAR(50) NOT NULL,
        draft_data JSON NOT NULL,
        step INT DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_wizard (user_id, wizard_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    draftTableEnsured = true;
  } catch (err) {
    console.warn('[DRAFT TABLE] Warning verifying draft table:', err.message);
  }
}

async function getWizardDraft(req, res, next) {
  try {
    const { wizardType } = req.params;
    const userId = req.user?.id || 1;
    await ensureDraftTableExists();
    const [rows] = await commonPool.query(
      'SELECT draft_data, step, updated_at FROM admin_wizard_drafts WHERE user_id = ? AND wizard_type = ?',
      [userId, wizardType.toUpperCase()]
    );
    if (rows.length === 0) {
      return res.json({ success: true, data: null });
    }
    const raw = rows[0].draft_data;
    const draftData = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return res.json({
      success: true,
      data: {
        draftData,
        step: rows[0].step,
        updatedAt: rows[0].updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function saveWizardDraft(req, res, next) {
  try {
    const { wizardType } = req.params;
    const { draftData, step = 1 } = req.body;
    const userId = req.user?.id || 1;
    await ensureDraftTableExists();
    await commonPool.query(`
      INSERT INTO admin_wizard_drafts (user_id, wizard_type, draft_data, step, updated_at)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE draft_data = VALUES(draft_data), step = VALUES(step), updated_at = NOW()
    `, [userId, wizardType.toUpperCase(), JSON.stringify(draftData || {}), parseInt(step, 10) || 1]);

    return res.json({ success: true, message: 'Draft saved successfully.' });
  } catch (err) {
    next(err);
  }
}

async function clearWizardDraft(req, res, next) {
  try {
    const { wizardType } = req.params;
    const userId = req.user?.id || 1;
    await ensureDraftTableExists();
    await commonPool.query(
      'DELETE FROM admin_wizard_drafts WHERE user_id = ? AND wizard_type = ?',
      [userId, wizardType.toUpperCase()]
    );
    return res.json({ success: true, message: 'Draft cleared successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDepartments,
  getDepartmentByCode,
  createDepartment,
  updateDepartment,
  provisionDepartmentDb,
  verifyDepartmentDb,
  getAcademicStructures,
  createAcademicStructure,
  updateAcademicStructure,
  deleteAcademicStructure,
  downloadTemplate,
  previewAndValidateImport,
  confirmImport,
  getImportHistory,
  downloadErrorReport,
  getDatabaseStatus,
  getWizardDraft,
  saveWizardDraft,
  clearWizardDraft,
};
