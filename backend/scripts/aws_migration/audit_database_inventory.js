const mysql = require('../../node_modules/mysql2/promise');
const fs = require('fs');

async function audit() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
  });

  const targetDatabases = [
    'campuscorp_platform',
    'lms',
    'lms_cse',
    'lms_ece',
    'lms_eee',
    'lms_mech',
    'lms_civil',
    'lms_it',
    'campuscorp_dept_aids',
    'campuscorp_dept_robotics',
    'campuscorp_college_abc',
    'campuscorp_college_amr',
    'campuscorp_college_cit',
    'campuscorp_college_kct',
    'campuscorp_college_psg',
    'campuscorp_college_xyz'
  ];

  const auditReport = {
    timestamp: new Date().toISOString(),
    mysqlVersion: '',
    databases: {},
    summary: {
      totalDatabases: targetDatabases.length,
      totalTables: 0,
      totalRows: 0,
      totalViews: 0,
      totalProcedures: 0,
      totalTriggers: 0,
      totalForeignKeys: 0,
    }
  };

  const [verRows] = await connection.query('SELECT VERSION() as ver');
  auditReport.mysqlVersion = verRows[0].ver;

  for (const dbName of targetDatabases) {
    const dbData = {
      name: dbName,
      tables: {},
      views: [],
      procedures: [],
      triggers: [],
      events: [],
      foreignKeys: [],
      totalRows: 0,
    };

    // Tables and Views
    const [tables] = await connection.query(
      `SELECT TABLE_NAME, TABLE_TYPE, ENGINE, TABLE_COLLATION, TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ?`,
      [dbName]
    );

    for (const t of tables) {
      if (t.TABLE_TYPE === 'VIEW') {
        dbData.views.push(t.TABLE_NAME);
        auditReport.summary.totalViews++;
      } else {
        // Get exact row count with SELECT COUNT(*)
        let exactCount = 0;
        try {
          const [cntRows] = await connection.query(`SELECT COUNT(*) as cnt FROM \`${dbName}\`.\`${t.TABLE_NAME}\``);
          exactCount = Number(cntRows[0].cnt);
        } catch (e) {
          exactCount = Number(t.TABLE_ROWS || 0);
        }

        dbData.tables[t.TABLE_NAME] = {
          engine: t.ENGINE,
          collation: t.TABLE_COLLATION,
          rowCount: exactCount,
          dataLength: Number(t.DATA_LENGTH),
          indexLength: Number(t.INDEX_LENGTH),
        };
        dbData.totalRows += exactCount;
        auditReport.summary.totalRows += exactCount;
        auditReport.summary.totalTables++;
      }
    }

    // Foreign Keys
    const [fkRows] = await connection.query(
      `SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
      [dbName]
    );
    dbData.foreignKeys = fkRows;
    auditReport.summary.totalForeignKeys += fkRows.length;

    // Stored Procedures
    const [procRows] = await connection.query(
      `SELECT ROUTINE_NAME, ROUTINE_TYPE, DTD_IDENTIFIER
       FROM information_schema.ROUTINES
       WHERE ROUTINE_SCHEMA = ?`,
      [dbName]
    );
    dbData.procedures = procRows;
    auditReport.summary.totalProcedures += procRows.length;

    // Triggers
    const [trigRows] = await connection.query(
      `SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE, ACTION_TIMING
       FROM information_schema.TRIGGERS
       WHERE TRIGGER_SCHEMA = ?`,
      [dbName]
    );
    dbData.triggers = trigRows;
    auditReport.summary.totalTriggers += trigRows.length;

    // Events
    const [eventRows] = await connection.query(
      `SELECT EVENT_NAME, STATUS, INTERVAL_VALUE, INTERVAL_FIELD
       FROM information_schema.EVENTS
       WHERE EVENT_SCHEMA = ?`,
      [dbName]
    );
    dbData.events = eventRows;

    auditReport.databases[dbName] = dbData;
  }

  await connection.end();

  fs.writeFileSync('d:/INNOVO/audit_database_inventory.json', JSON.stringify(auditReport, null, 2));
  console.log('AUDIT COMPLETED. Summary:', JSON.stringify(auditReport.summary, null, 2));
}

audit().catch(console.error);
