const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { queryCommon } = require('../config/db');

/**
 * Helper to resolve studentId, userId, and role from authenticated request
 */
async function resolveStudentContext(req) {
  const userId = req.user?.id;
  const userRole = req.user?.role_name || req.user?.roleName || 'STUDENT';
  const deptCode = req.user?.department_code || null;
  let studentId = req.user?.student_id || null;

  if (userRole === 'STUDENT' && !studentId && userId) {
    const rows = await queryCommon(
      'SELECT id, department_code AS department, register_number FROM students_master WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (rows.length > 0) {
      studentId = rows[0].id;
    } else {
      // Fallback demo student id 1
      studentId = 1;
    }
  }

  return { userId, userRole, studentId, deptCode };
}

/**
 * Helper to verify faculty permission for a course
 */
async function verifyCourseOwnership(courseId, user) {
  const courses = await queryCommon('SELECT * FROM lms_courses WHERE id = ?', [courseId]);
  if (courses.length === 0) {
    const err = new Error('Course not found.');
    err.status = 404;
    throw err;
  }
  const course = courses[0];
  const role = user.role_name || user.roleName;

  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return course;
  }

  const userDept = user.department_code;
  const isInstructor = course.instructor_id === user.id;
  const isDeptCoordinator = role === 'FACULTY_COORDINATOR' && course.department_code === userDept;

  if (!isInstructor && !isDeptCoordinator) {
    const err = new Error('Forbidden. You do not have permission to manage this course.');
    err.status = 403;
    throw err;
  }

  return course;
}

/**
 * 1. LMS Dashboard (Real DB Metrics for Faculty and Students)
 * GET /api/v1/lms/dashboard
 */
async function getDashboard(req, res, next) {
  try {
    const { userId, userRole, studentId, deptCode } = await resolveStudentContext(req);

    if (userRole === 'STUDENT') {
      const sId = studentId || 1;
      const enrollments = await queryCommon(`
        SELECT e.*, c.title, c.course_code, c.category, c.level, c.thumbnail_url,
               u.first_name AS instructor_first, u.last_name AS instructor_last
        FROM lms_course_enrollments e
        JOIN lms_courses c ON c.id = e.course_id
        JOIN users u ON u.id = c.instructor_id
        WHERE e.student_id = ?
        ORDER BY e.enrolled_at DESC
      `, [sId]);

      const pendingQuizzes = await queryCommon(`
        SELECT q.id, q.title, q.due_date, q.time_limit_minutes, c.title as course_title,
               (SELECT COUNT(*) FROM lms_quiz_attempts qa WHERE qa.quiz_id = q.id AND qa.student_id = ?) as attempt_count
        FROM lms_quizzes q
        JOIN lms_courses c ON c.id = q.course_id
        JOIN lms_course_enrollments e ON e.course_id = c.id AND e.student_id = ?
        WHERE q.is_published = 1 AND (q.due_date IS NULL OR q.due_date >= NOW())
        ORDER BY q.due_date ASC LIMIT 5
      `, [sId, sId]);

      const pendingAssignments = await queryCommon(`
        SELECT a.id, a.title, a.due_date, a.max_marks, c.title as course_title,
               s.status as submission_status, s.grade, s.is_late
        FROM lms_assignments a
        JOIN lms_courses c ON c.id = a.course_id
        JOIN lms_course_enrollments e ON e.course_id = c.id AND e.student_id = ?
        LEFT JOIN lms_assignment_submissions s ON s.assignment_id = a.id AND s.student_id = ?
        WHERE a.is_published = 1 AND (s.id IS NULL OR s.status = 'RESUBMISSION_REQUESTED')
        ORDER BY a.due_date ASC LIMIT 5
      `, [sId, sId]);

      const upcomingLive = await queryCommon(`
        SELECT lc.*, c.title as course_title, u.first_name as instructor_first, u.last_name as instructor_last
        FROM lms_live_classes lc
        JOIN lms_courses c ON c.id = lc.course_id
        JOIN lms_course_enrollments e ON e.course_id = c.id AND e.student_id = ?
        JOIN users u ON u.id = lc.instructor_id
        WHERE lc.start_time >= NOW() AND lc.status != 'CANCELLED'
        ORDER BY lc.start_time ASC LIMIT 5
      `, [sId]);

      const certificates = await queryCommon(
        'SELECT COUNT(*) as count FROM lms_certificates WHERE student_id = ?',
        [sId]
      );

      const attendanceStats = await queryCommon(`
        SELECT 
          COUNT(*) as total_recorded,
          SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as attended_count
        FROM lms_live_attendance
        WHERE student_id = ?
      `, [sId]);

      const totalEnrolled = enrollments.length;
      const completedCount = enrollments.filter(e => e.status === 'COMPLETED').length;
      const inProgressCount = enrollments.filter(e => e.status === 'IN_PROGRESS').length;
      const avgProgress = totalEnrolled > 0
        ? Math.round(enrollments.reduce((acc, e) => acc + Number(e.progress_percentage || 0), 0) / totalEnrolled)
        : 0;
      
      const attendancePct = (attendanceStats[0]?.total_recorded > 0)
        ? Math.round((attendanceStats[0].attended_count / attendanceStats[0].total_recorded) * 100)
        : 100;

      return res.json({
        success: true,
        role: 'STUDENT',
        data: {
          metrics: {
            totalEnrolled,
            completedCount,
            inProgressCount,
            avgProgress,
            certificatesCount: certificates[0]?.count || 0,
            attendancePercentage: attendancePct,
          },
          enrollments,
          pendingQuizzes,
          pendingAssignments,
          upcomingLive,
        },
      });
    }

    // Faculty / Coordinator / Admin Dashboard
    const isSuperOrAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
    let courseWhere = 'WHERE 1=1';
    const params = [];
    if (!isSuperOrAdmin) {
      if (deptCode) {
        courseWhere += ' AND (c.department_code = ? OR c.instructor_id = ? OR c.department_code IS NULL)';
        params.push(deptCode, userId);
      } else {
        courseWhere += ' AND c.instructor_id = ?';
        params.push(userId);
      }
    }

    const courses = await queryCommon(`
      SELECT c.*, 
             COUNT(DISTINCT e.student_id) as student_count,
             COUNT(DISTINCT m.id) as module_count,
             COUNT(DISTINCT r.id) as resource_count,
             ROUND(AVG(COALESCE(e.progress_percentage, 0)), 1) as avg_course_progress
      FROM lms_courses c
      LEFT JOIN lms_course_enrollments e ON e.course_id = c.id
      LEFT JOIN lms_modules m ON m.course_id = c.id
      LEFT JOIN lms_course_resources r ON r.course_id = c.id
      ${courseWhere}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, params);

    const courseIds = courses.map(c => c.id);
    let pendingGrading = [];
    let recentActivity = [];
    let activeAssessments = 0;
    let publishedResourcesCount = 0;

    if (courseIds.length > 0) {
      const placeholders = courseIds.map(() => '?').join(',');
      const pgRows = await queryCommon(`
        SELECT s.*, a.title as assignment_title, a.max_marks, c.title as course_title, c.course_code,
               sm.register_number, u.first_name, u.last_name
        FROM lms_assignment_submissions s
        JOIN lms_assignments a ON a.id = s.assignment_id
        JOIN lms_courses c ON c.id = a.course_id
        JOIN students_master sm ON sm.id = s.student_id
        JOIN users u ON u.id = sm.user_id
        WHERE s.status IN ('SUBMITTED', 'AWAITING_GRADING') AND a.course_id IN (${placeholders})
        ORDER BY s.submitted_at ASC LIMIT 10
      `, courseIds);
      pendingGrading = pgRows;

      const resCount = await queryCommon(`
        SELECT COUNT(*) as count FROM lms_course_resources 
        WHERE is_published = 1 AND course_id IN (${placeholders})
      `, courseIds);
      publishedResourcesCount = resCount[0]?.count || 0;

      const quizCount = await queryCommon(`
        SELECT COUNT(*) as count FROM lms_quizzes 
        WHERE is_published = 1 AND course_id IN (${placeholders})
      `, courseIds);
      const assignCount = await queryCommon(`
        SELECT COUNT(*) as count FROM lms_assignments 
        WHERE is_published = 1 AND course_id IN (${placeholders})
      `, courseIds);
      activeAssessments = (quizCount[0]?.count || 0) + (assignCount[0]?.count || 0);

      const recentSubmissions = await queryCommon(`
        SELECT s.id, s.submitted_at as timestamp, 'ASSIGNMENT_SUBMISSION' as type,
               CONCAT(u.first_name, ' ', u.last_name) as student_name,
               a.title as assessment_title, c.course_code
        FROM lms_assignment_submissions s
        JOIN lms_assignments a ON a.id = s.assignment_id
        JOIN lms_courses c ON c.id = a.course_id
        JOIN students_master sm ON sm.id = s.student_id
        JOIN users u ON u.id = sm.user_id
        WHERE a.course_id IN (${placeholders})
        ORDER BY s.submitted_at DESC LIMIT 6
      `, courseIds);
      recentActivity = recentSubmissions;
    }

    const recentLive = await queryCommon(`
      SELECT lc.*, c.title as course_title, c.course_code
      FROM lms_live_classes lc
      JOIN lms_courses c ON c.id = lc.course_id
      ${courseWhere}
      ORDER BY lc.start_time ASC LIMIT 5
    `, params);

    const totalStudents = courses.reduce((acc, c) => acc + Number(c.student_count || 0), 0);

    return res.json({
      success: true,
      role: userRole,
      data: {
        metrics: {
          totalCourses: courses.length,
          totalStudents,
          pendingGradingCount: pendingGrading.length,
          publishedCourses: courses.filter(c => c.status === 'PUBLISHED').length,
          publishedResourcesCount,
          activeAssessments,
        },
        courses,
        pendingGrading,
        upcomingLive: recentLive,
        recentActivity,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 2. Get Courses
 * GET /api/v1/lms/courses
 */
async function getCourses(req, res, next) {
  try {
    const { userRole, studentId, deptCode, userId } = await resolveStudentContext(req);
    const { category, search, department } = req.query;

    let sql = `
      SELECT c.*, 
             u.first_name as instructor_first, u.last_name as instructor_last,
             COUNT(DISTINCT m.id) as module_count,
             COUNT(DISTINCT l.id) as lesson_count,
             COUNT(DISTINCT r.id) as resource_count,
             COUNT(DISTINCT e.student_id) as enrolled_count
      FROM lms_courses c
      JOIN users u ON u.id = c.instructor_id
      LEFT JOIN lms_modules m ON m.course_id = c.id
      LEFT JOIN lms_lessons l ON l.course_id = c.id
      LEFT JOIN lms_course_resources r ON r.course_id = c.id
      LEFT JOIN lms_course_enrollments e ON e.course_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (userRole === 'STUDENT') {
      sql += ' AND c.status = "PUBLISHED"';
      if (studentId) {
        // Only return courses the student is enrolled in or that belong to their department / general
        sql += ' AND (c.id IN (SELECT course_id FROM lms_course_enrollments WHERE student_id = ?) OR c.department_code = ? OR c.department_code IS NULL)';
        params.push(studentId, deptCode || 'CSE');
      }
    } else if (userRole === 'FACULTY_COORDINATOR' && deptCode) {
      sql += ' AND (c.department_code = ? OR c.instructor_id = ? OR c.department_code IS NULL)';
      params.push(deptCode, userId);
    }

    if (category && category !== 'All Categories') {
      sql += ' AND c.category = ?';
      params.push(category);
    }

    if (department) {
      sql += ' AND c.department_code = ?';
      params.push(department);
    }

    if (search && search.trim()) {
      sql += ' AND (c.title LIKE ? OR c.description LIKE ? OR c.course_code LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' GROUP BY c.id ORDER BY c.created_at DESC';

    const courses = await queryCommon(sql, params);

    // If student, attach enrollment status & progress
    if (userRole === 'STUDENT' && studentId) {
      const enrollments = await queryCommon(
        'SELECT course_id, status, progress_percentage, certificate_issued FROM lms_course_enrollments WHERE student_id = ?',
        [studentId]
      );
      const enrMap = new Map();
      enrollments.forEach(e => enrMap.set(e.course_id, e));

      courses.forEach(c => {
        const enr = enrMap.get(c.id);
        c.isEnrolled = Boolean(enr);
        c.enrollmentStatus = enr?.status || 'NOT_ENROLLED';
        c.progressPercentage = Number(enr?.progress_percentage || 0);
        c.certificateIssued = Boolean(enr?.certificate_issued);
      });
    }

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 3. Get Course by ID with Full Hierarchy (Modules, Lessons, Resources, Quizzes, Assignments)
 * GET /api/v1/lms/courses/:id
 */
async function getCourseById(req, res, next) {
  try {
    const { id } = req.params;
    const { userRole, studentId, deptCode } = await resolveStudentContext(req);

    const courses = await queryCommon(`
      SELECT c.*, u.first_name as instructor_first, u.last_name as instructor_last, u.email as instructor_email
      FROM lms_courses c
      JOIN users u ON u.id = c.instructor_id
      WHERE c.id = ?
    `, [id]);

    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const course = courses[0];

    // For students, verify authorization: Course must be PUBLISHED
    if (userRole === 'STUDENT' && course.status !== 'PUBLISHED') {
      return res.status(403).json({ success: false, message: 'This course is currently in draft or archived status.' });
    }

    // Modules
    const modules = await queryCommon(
      'SELECT * FROM lms_modules WHERE course_id = ? ORDER BY order_index ASC',
      [id]
    );

    // Lessons (published only for students)
    const lessonWhere = userRole === 'STUDENT' ? 'AND is_published = 1' : '';
    const lessons = await queryCommon(
      `SELECT * FROM lms_lessons WHERE course_id = ? ${lessonWhere} ORDER BY order_index ASC`,
      [id]
    );

    // If student, get completed lessons & enrollment
    let completedLessonIds = new Set();
    let studentEnrollment = null;
    if (studentId) {
      const progressRows = await queryCommon(
        'SELECT lesson_id FROM lms_lesson_progress WHERE course_id = ? AND student_id = ? AND is_completed = 1',
        [id, studentId]
      );
      progressRows.forEach(r => completedLessonIds.add(r.lesson_id));

      const enr = await queryCommon(
        'SELECT * FROM lms_course_enrollments WHERE course_id = ? AND student_id = ?',
        [id, studentId]
      );
      studentEnrollment = enr[0] || null;
    }

    // Resources (published only for students)
    const resourceWhere = userRole === 'STUDENT' ? 'AND is_published = 1' : '';
    const resources = await queryCommon(
      `SELECT * FROM lms_course_resources WHERE course_id = ? ${resourceWhere} ORDER BY created_at DESC`,
      [id]
    );

    // Quizzes
    const quizWhere = userRole === 'STUDENT' ? 'AND is_published = 1' : '';
    const quizzes = await queryCommon(
      `SELECT id, title, description, time_limit_minutes, max_attempts, passing_score, due_date, is_published FROM lms_quizzes WHERE course_id = ? ${quizWhere}`,
      [id]
    );

    // Assignments
    const assignWhere = userRole === 'STUDENT' ? 'AND is_published = 1' : '';
    const assignments = await queryCommon(
      `SELECT id, title, description, instructions, max_marks, due_date, allowed_file_types, is_published FROM lms_assignments WHERE course_id = ? ${assignWhere}`,
      [id]
    );

    // Structure modules with lessons
    const modulesWithLessons = modules.map(m => {
      const modLessons = lessons.filter(l => l.module_id === m.id).map(l => ({
        ...l,
        isCompleted: completedLessonIds.has(l.id),
      }));
      return {
        ...m,
        lessons: modLessons,
      };
    });

    res.json({
      success: true,
      data: {
        ...course,
        modules: modulesWithLessons,
        resources,
        quizzes,
        assignments,
        isEnrolled: Boolean(studentEnrollment),
        enrollment: studentEnrollment,
        progressPercentage: Number(studentEnrollment?.progress_percentage || 0),
        certificateIssued: Boolean(studentEnrollment?.certificate_issued),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create New Course (Faculty / Coordinator / Admin)
 * POST /api/v1/lms/courses
 */
async function createCourse(req, res, next) {
  try {
    const { title, course_code, description, category, level, duration_hours, passing_percentage, department_code, status } = req.body;
    const instructorId = req.user?.id || 4;

    if (!title || !course_code) {
      return res.status(400).json({ success: false, message: 'Course title and course code are required.' });
    }

    const existing = await queryCommon('SELECT id FROM lms_courses WHERE course_code = ?', [course_code]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: `Course code "${course_code}" is already in use.` });
    }

    const result = await queryCommon(`
      INSERT INTO lms_courses (
        course_code, title, description, category, department_code, instructor_id,
        level, duration_hours, passing_percentage, status, certificate_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      course_code.toUpperCase().trim(),
      title.trim(),
      description || '',
      category || 'Core Engineering',
      department_code || req.user?.department_code || null,
      instructorId,
      level || 'BEGINNER',
      duration_hours || 20,
      passing_percentage || 60,
      status || 'PUBLISHED',
    ]);

    // Create a default initial module for the course
    await queryCommon(`
      INSERT INTO lms_modules (course_id, title, description, order_index)
      VALUES (?, 'Module 1: Foundations & Architecture', 'Core principles and foundations', 1)
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Course created successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update Course (Faculty / Coordinator / Admin)
 * PUT /api/v1/lms/courses/:id
 */
async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    await verifyCourseOwnership(id, req.user);

    const { title, description, category, level, duration_hours, passing_percentage, status, department_code } = req.body;

    await queryCommon(`
      UPDATE lms_courses
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          level = COALESCE(?, level),
          duration_hours = COALESCE(?, duration_hours),
          passing_percentage = COALESCE(?, passing_percentage),
          status = COALESCE(?, status),
          department_code = COALESCE(?, department_code)
      WHERE id = ?
    `, [title, description, category, level, duration_hours, passing_percentage, status, department_code, id]);

    res.json({
      success: true,
      message: 'Course updated successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Enrolled Students for a Course
 * GET /api/v1/lms/courses/:id/students
 */
async function getCourseStudents(req, res, next) {
  try {
    const { id } = req.params;
    await verifyCourseOwnership(id, req.user);

    const students = await queryCommon(`
      SELECT e.id as enrollment_id, e.enrolled_at, e.status as enrollment_status, e.progress_percentage,
             e.completed_at, e.certificate_issued, e.certificate_id,
             sm.id as student_id, sm.register_number, sm.roll_number, sm.department_code, sm.batch,
             u.first_name, u.last_name, u.email
      FROM lms_course_enrollments e
      JOIN students_master sm ON sm.id = e.student_id
      JOIN users u ON u.id = sm.user_id
      WHERE e.course_id = ?
      ORDER BY sm.register_number ASC
    `, [id]);

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Enroll in Course (Student)
 * POST /api/v1/lms/courses/:id/enroll
 */
async function enrollCourse(req, res, next) {
  try {
    const { id } = req.params;
    const { studentId } = await resolveStudentContext(req);

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID required for enrollment.' });
    }

    const courses = await queryCommon('SELECT * FROM lms_courses WHERE id = ?', [id]);
    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    const course = courses[0];
    if (course.status !== 'PUBLISHED') {
      return res.status(400).json({ success: false, message: 'Cannot enroll in an unpublished course.' });
    }

    await queryCommon(`
      INSERT INTO lms_course_enrollments (course_id, student_id, status, progress_percentage)
      VALUES (?, ?, 'IN_PROGRESS', 0.00)
      ON DUPLICATE KEY UPDATE status = 'IN_PROGRESS'
    `, [id, studentId]);

    res.json({
      success: true,
      message: `Enrolled in "${course.title}" successfully.`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create Module
 * POST /api/v1/lms/courses/:courseId/modules
 */
async function createModule(req, res, next) {
  try {
    const { courseId } = req.params;
    await verifyCourseOwnership(courseId, req.user);
    const { title, description, orderIndex } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Module title is required.' });
    }

    const result = await queryCommon(`
      INSERT INTO lms_modules (course_id, title, description, order_index)
      VALUES (?, ?, ?, ?)
    `, [courseId, title.trim(), description || '', orderIndex || 1]);

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Module created successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create Lesson
 * POST /api/v1/lms/modules/:moduleId/lessons
 */
async function createLesson(req, res, next) {
  try {
    const { moduleId } = req.params;
    const { courseId, title, content, lessonType, resourceUrl, durationMinutes, orderIndex, isPublished } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ success: false, message: 'courseId and title are required.' });
    }

    await verifyCourseOwnership(courseId, req.user);

    const result = await queryCommon(`
      INSERT INTO lms_lessons (
        module_id, course_id, title, content, lesson_type, resource_url, duration_minutes, order_index, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      moduleId,
      courseId,
      title.trim(),
      content || '',
      lessonType || 'DOCUMENT',
      resourceUrl || null,
      durationMinutes || 15,
      orderIndex || 1,
      isPublished !== false ? 1 : 0,
    ]);

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Lesson added successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Complete Lesson & Update Student Course Progress
 * POST /api/v1/lms/lessons/:id/complete
 */
async function completeLesson(req, res, next) {
  try {
    const { id } = req.params;
    const { studentId } = await resolveStudentContext(req);

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID required.' });
    }

    const lessons = await queryCommon('SELECT * FROM lms_lessons WHERE id = ?', [id]);
    if (lessons.length === 0) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' });
    }
    const lesson = lessons[0];
    const courseId = lesson.course_id;

    // Record lesson progress
    await queryCommon(`
      INSERT INTO lms_lesson_progress (lesson_id, course_id, student_id, is_completed, completed_at)
      VALUES (?, ?, ?, 1, NOW())
      ON DUPLICATE KEY UPDATE is_completed = 1, completed_at = NOW()
    `, [id, courseId, studentId]);

    // Calculate updated course progress percentage
    const totalLessonsRows = await queryCommon(
      'SELECT COUNT(*) as total FROM lms_lessons WHERE course_id = ? AND is_published = 1',
      [courseId]
    );
    const totalLessons = totalLessonsRows[0]?.total || 1;

    const completedRows = await queryCommon(
      'SELECT COUNT(*) as completed FROM lms_lesson_progress WHERE course_id = ? AND student_id = ? AND is_completed = 1',
      [courseId, studentId]
    );
    const completedCount = completedRows[0]?.completed || 1;

    const progress = Math.min(100, Math.round((completedCount / totalLessons) * 100));
    const isFullyCompleted = progress >= 100;

    // Update enrollment status
    await queryCommon(`
      INSERT INTO lms_course_enrollments (course_id, student_id, status, progress_percentage, completed_at)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        progress_percentage = VALUES(progress_percentage),
        status = CASE WHEN VALUES(progress_percentage) >= 100 THEN 'COMPLETED' ELSE 'IN_PROGRESS' END,
        completed_at = CASE WHEN VALUES(progress_percentage) >= 100 AND completed_at IS NULL THEN NOW() ELSE completed_at END
    `, [courseId, studentId, isFullyCompleted ? 'COMPLETED' : 'IN_PROGRESS', progress, isFullyCompleted ? new Date() : null]);

    // If 100% completed, auto-issue certificate if not yet issued
    if (isFullyCompleted) {
      const existingCert = await queryCommon(
        'SELECT id FROM lms_certificates WHERE course_id = ? AND student_id = ?',
        [courseId, studentId]
      );
      if (existingCert.length === 0) {
        const certId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const verificationHash = crypto.createHash('sha256').update(`${certId}-${studentId}-${courseId}`).digest('hex');
        
        await queryCommon(`
          INSERT INTO lms_certificates (id, student_id, course_id, issue_date, grade_achieved, verification_hash, is_approved, approved_by)
          VALUES (?, ?, ?, CURDATE(), 'A+', ?, 1, 4)
        `, [certId, studentId, courseId, verificationHash]);

        await queryCommon(`
          UPDATE lms_course_enrollments
          SET certificate_issued = 1, certificate_id = ?
          WHERE course_id = ? AND student_id = ?
        `, [certId, courseId, studentId]);

        // Send badge notification
        await queryCommon(`
          INSERT INTO lms_notifications (user_id, type, title, message, link_url)
          SELECT user_id, 'BADGE_EARNED', 'Course Completed & Certificate Issued!', 'Congratulations on completing the course curriculum. Your verified credential is now available.', '/lms/certificates'
          FROM students_master WHERE id = ?
        `, [studentId]);
      }
    }

    res.json({
      success: true,
      message: 'Lesson marked as completed.',
      progressPercentage: progress,
      isFullyCompleted,
      completedLessons: completedCount,
      totalLessons,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 4. Course Materials & Resources
 * GET /api/v1/lms/resources
 */
async function getResources(req, res, next) {
  try {
    const { userRole, studentId } = await resolveStudentContext(req);
    const { courseId } = req.query;

    let sql = `
      SELECT r.*, c.title as course_title, c.course_code,
             u.first_name as uploader_first, u.last_name as uploader_last
      FROM lms_course_resources r
      JOIN lms_courses c ON c.id = r.course_id
      JOIN users u ON u.id = r.uploaded_by
      WHERE 1=1
    `;
    const params = [];

    if (userRole === 'STUDENT') {
      sql += ' AND r.is_published = 1';
      if (studentId) {
        sql += ' AND r.course_id IN (SELECT course_id FROM lms_course_enrollments WHERE student_id = ?)';
        params.push(studentId);
      }
    }

    if (courseId) {
      sql += ' AND r.course_id = ?';
      params.push(courseId);
    }

    sql += ' ORDER BY r.created_at DESC';

    const resources = await queryCommon(sql, params);

    res.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Upload Learning Resource (Faculty)
 * POST /api/v1/lms/resources
 */
async function uploadResource(req, res, next) {
  try {
    const { courseId, title, moduleId, fileType, externalUrl, description, targetSection, isPublished } = req.body;
    const instructorId = req.user?.id || 4;

    if (!courseId || !title) {
      return res.status(400).json({ success: false, message: 'courseId and title are required.' });
    }

    await verifyCourseOwnership(courseId, req.user);

    let fileUrl = externalUrl || req.body.fileUrl || '';
    let fileTypeVal = fileType || req.body.file_type || 'LINK';
    let fileSizeKb = 0;

    if (req.file) {
      fileUrl = `/uploads/lms/materials/${req.file.filename}`;
      const ext = path.extname(req.file.originalname).replace('.', '').toUpperCase();
      fileTypeVal = ext || 'DOC';
      fileSizeKb = Math.round(req.file.size / 1024);
    } else if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'Please provide either an uploaded file or an external URL/link.' });
    }

    const result = await queryCommon(`
      INSERT INTO lms_course_resources (
        course_id, module_id, title, file_type, file_url, file_size_kb, uploaded_by, is_published, description, target_section
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      courseId,
      moduleId || null,
      title.trim(),
      fileTypeVal,
      fileUrl,
      fileSizeKb,
      instructorId,
      isPublished !== 'false' && isPublished !== false ? 1 : 0,
      description || null,
      targetSection || 'ALL',
    ]);

    // Notify enrolled students
    await queryCommon(`
      INSERT INTO lms_notifications (user_id, type, title, message, link_url)
      SELECT sm.user_id, 'COURSE_UPDATE', 'New Learning Resource Published', ?, '/lms/materials'
      FROM lms_course_enrollments e
      JOIN students_master sm ON sm.id = e.student_id
      WHERE e.course_id = ?
    `, [`A new resource "${title}" has been published to your course repository.`, courseId]);

    res.status(201).json({
      success: true,
      id: result.insertId,
      fileUrl,
      message: 'Learning resource published successfully to course catalog.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete Learning Resource (Faculty)
 * DELETE /api/v1/lms/resources/:id
 */
async function deleteResource(req, res, next) {
  try {
    const { id } = req.params;
    const rows = await queryCommon('SELECT * FROM lms_course_resources WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }
    const resource = rows[0];
    await verifyCourseOwnership(resource.course_id, req.user);

    // Delete record
    await queryCommon('DELETE FROM lms_course_resources WHERE id = ?', [id]);

    // If local file, delete file from disk
    if (resource.file_url && resource.file_url.startsWith('/uploads/lms/materials/')) {
      const filePath = path.join(__dirname, '../../', resource.file_url);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      }
    }

    res.json({
      success: true,
      message: 'Resource removed successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 5. Get Quizzes
 * GET /api/v1/lms/quizzes
 */
async function getQuizzes(req, res, next) {
  try {
    const { userRole, studentId, deptCode, userId } = await resolveStudentContext(req);
    const { courseId } = req.query;

    let sql = `
      SELECT q.*, c.title as course_title, c.course_code,
             COUNT(DISTINCT qq.id) as question_count,
             COALESCE(SUM(qq.marks), 0) as total_marks,
             (SELECT COUNT(*) FROM lms_quiz_attempts qa WHERE qa.quiz_id = q.id) as total_submissions
      FROM lms_quizzes q
      JOIN lms_courses c ON c.id = q.course_id
      LEFT JOIN lms_quiz_questions qq ON qq.quiz_id = q.id
      WHERE 1=1
    `;
    const params = [];

    if (userRole === 'STUDENT') {
      sql += ' AND q.is_published = 1';
      if (studentId) {
        sql += ' AND q.course_id IN (SELECT course_id FROM lms_course_enrollments WHERE student_id = ?)';
        params.push(studentId);
      }
    } else if (userRole === 'FACULTY_COORDINATOR' && deptCode) {
      sql += ' AND (c.department_code = ? OR c.instructor_id = ? OR c.department_code IS NULL)';
      params.push(deptCode, userId);
    }

    if (courseId) {
      sql += ' AND q.course_id = ?';
      params.push(courseId);
    }

    sql += ' GROUP BY q.id ORDER BY q.due_date ASC, q.created_at DESC';

    const quizzes = await queryCommon(sql, params);

    // If student, attach student's attempts
    if (userRole === 'STUDENT' && studentId) {
      const quizIds = quizzes.map(q => q.id);
      if (quizIds.length > 0) {
        const placeholders = quizIds.map(() => '?').join(',');
        const attempts = await queryCommon(`
          SELECT quiz_id, MAX(score) as best_score, MAX(percentage) as best_percentage,
                 MAX(passed) as has_passed, COUNT(*) as attempts_count
          FROM lms_quiz_attempts
          WHERE student_id = ? AND quiz_id IN (${placeholders})
          GROUP BY quiz_id
        `, [studentId, ...quizIds]);

        const attemptMap = new Map();
        attempts.forEach(a => attemptMap.set(a.quiz_id, a));

        quizzes.forEach(q => {
          const att = attemptMap.get(q.id);
          q.attemptsTaken = att?.attempts_count || 0;
          q.bestScore = att?.best_score || null;
          q.bestPercentage = att?.best_percentage || null;
          q.hasPassed = Boolean(att?.has_passed);
        });
      }
    }

    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 6. Get Quiz by ID (Student receives questions WITHOUT correct_answer!)
 * GET /api/v1/lms/quizzes/:id
 */
async function getQuizById(req, res, next) {
  try {
    const { id } = req.params;
    const { userRole, studentId } = await resolveStudentContext(req);

    const quizzes = await queryCommon(`
      SELECT q.*, c.title as course_title, c.course_code
      FROM lms_quizzes q
      JOIN lms_courses c ON c.id = q.course_id
      WHERE q.id = ?
    `, [id]);

    if (quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    const quiz = quizzes[0];

    // For student: check authorization
    if (userRole === 'STUDENT') {
      if (!quiz.is_published) {
        return res.status(403).json({ success: false, message: 'This assessment is not currently published.' });
      }
    }

    // Query questions
    const rawQuestions = await queryCommon(
      'SELECT * FROM lms_quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC',
      [id]
    );

    const questions = rawQuestions.map(q => {
      const parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []);
      const item = {
        id: q.id,
        questionText: q.question_text,
        questionType: q.question_type,
        options: parsedOptions,
        marks: q.marks,
        orderIndex: q.order_index,
      };

      // ONLY Faculty / Admin get to see correct_answer in quiz builder mode!
      if (userRole !== 'STUDENT') {
        item.correctAnswer = q.correct_answer;
        item.explanation = q.explanation;
      }
      return item;
    });

    let previousAttempts = [];
    if (studentId) {
      previousAttempts = await queryCommon(
        'SELECT * FROM lms_quiz_attempts WHERE quiz_id = ? AND student_id = ? ORDER BY attempt_number DESC',
        [id, studentId]
      );
    }

    res.json({
      success: true,
      data: {
        ...quiz,
        questions,
        previousAttempts,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create Quiz with Questions & Answer Keys (Faculty)
 * POST /api/v1/lms/quizzes
 */
async function createQuiz(req, res, next) {
  try {
    const { courseId, title, description, instructions, timeLimitMinutes, maxAttempts, passingScore, dueDate, startDate, isPublished, questions } = req.body;
    const instructorId = req.user?.id || 4;

    if (!courseId || !title) {
      return res.status(400).json({ success: false, message: 'courseId and title are required.' });
    }

    await verifyCourseOwnership(courseId, req.user);

    // Insert Quiz Header
    const quizResult = await queryCommon(`
      INSERT INTO lms_quizzes (
        course_id, title, description, instructions, time_limit_minutes, max_attempts, passing_score, due_date, start_date, is_published, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      courseId,
      title.trim(),
      description || '',
      instructions || 'Choose the best answer for each question.',
      timeLimitMinutes || 30,
      maxAttempts || 3,
      passingScore || 70,
      dueDate || null,
      startDate || null,
      isPublished !== false ? 1 : 0,
      instructorId,
    ]);

    const quizId = quizResult.insertId;

    // Insert Questions if provided
    if (Array.isArray(questions) && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const optionsJson = JSON.stringify(q.options || []);
        await queryCommon(`
          INSERT INTO lms_quiz_questions (
            quiz_id, question_text, question_type, options, correct_answer, marks, explanation, order_index
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          quizId,
          q.questionText || `Question ${i + 1}`,
          q.questionType || 'MCQ',
          optionsJson,
          q.correctAnswer || 'Option A',
          q.marks || 1,
          q.explanation || null,
          i + 1,
        ]);
      }
    } else {
      // Create a default question so quiz is not empty
      await queryCommon(`
        INSERT INTO lms_quiz_questions (quiz_id, question_text, question_type, options, correct_answer, marks, explanation, order_index)
        VALUES (?, 'What is the main advantage of database indexing?', 'MCQ', ?, 'Accelerates search queries', 1, 'Indexes allow fast binary search without full table scans.', 1)
      `, [quizId, JSON.stringify(['Accelerates search queries', 'Saves disk storage', 'Prevents duplicate keys only', 'Encrypts column data'])]);
    }

    // Notify students if published
    if (isPublished !== false) {
      await queryCommon(`
        INSERT INTO lms_notifications (user_id, type, title, message, link_url)
        SELECT sm.user_id, 'QUIZ_RELEASED', 'New Quiz Assessment Available', ?, '/lms/quizzes'
        FROM lms_course_enrollments e
        JOIN students_master sm ON sm.id = e.student_id
        WHERE e.course_id = ?
      `, [`A new quiz "${title}" has been published. Check Quizzes & Tests to attempt.`, courseId]);
    }

    res.status(201).json({
      success: true,
      id: quizId,
      message: 'Quiz assessment created and configured successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update Quiz (Faculty)
 * PUT /api/v1/lms/quizzes/:id
 */
async function updateQuiz(req, res, next) {
  try {
    const { id } = req.params;
    const quizzes = await queryCommon('SELECT * FROM lms_quizzes WHERE id = ?', [id]);
    if (quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }
    await verifyCourseOwnership(quizzes[0].course_id, req.user);

    const { title, description, instructions, timeLimitMinutes, maxAttempts, passingScore, dueDate, isPublished } = req.body;

    await queryCommon(`
      UPDATE lms_quizzes
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          instructions = COALESCE(?, instructions),
          time_limit_minutes = COALESCE(?, time_limit_minutes),
          max_attempts = COALESCE(?, max_attempts),
          passing_score = COALESCE(?, passing_score),
          due_date = COALESCE(?, due_date),
          is_published = COALESCE(?, is_published)
      WHERE id = ?
    `, [title, description, instructions, timeLimitMinutes, maxAttempts, passingScore, dueDate, isPublished, id]);

    res.json({
      success: true,
      message: 'Quiz assessment updated successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete Quiz (Faculty)
 * DELETE /api/v1/lms/quizzes/:id
 */
async function deleteQuiz(req, res, next) {
  try {
    const { id } = req.params;
    const quizzes = await queryCommon('SELECT * FROM lms_quizzes WHERE id = ?', [id]);
    if (quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }
    await verifyCourseOwnership(quizzes[0].course_id, req.user);

    await queryCommon('DELETE FROM lms_quizzes WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Quiz deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Quiz Attempts for Faculty Review
 * GET /api/v1/lms/quizzes/:id/attempts
 */
async function getQuizAttempts(req, res, next) {
  try {
    const { id } = req.params;
    const quizzes = await queryCommon('SELECT * FROM lms_quizzes WHERE id = ?', [id]);
    if (quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }
    await verifyCourseOwnership(quizzes[0].course_id, req.user);

    const attempts = await queryCommon(`
      SELECT qa.*, sm.register_number, sm.roll_number, sm.department_code,
             u.first_name, u.last_name, u.email
      FROM lms_quiz_attempts qa
      JOIN students_master sm ON sm.id = qa.student_id
      JOIN users u ON u.id = sm.user_id
      WHERE qa.quiz_id = ?
      ORDER BY qa.completed_at DESC
    `, [id]);

    res.json({
      success: true,
      count: attempts.length,
      data: attempts,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 7. Submit Quiz Attempt (Evaluated securely server-side)
 * POST /api/v1/lms/quizzes/:id/submit
 */
async function submitQuizAttempt(req, res, next) {
  try {
    const { id } = req.params;
    const { answers } = req.body; // { [questionId]: selectedOption }
    const { studentId } = await resolveStudentContext(req);

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID required.' });
    }

    const quizzes = await queryCommon('SELECT * FROM lms_quizzes WHERE id = ?', [id]);
    if (quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }
    const quiz = quizzes[0];

    if (!quiz.is_published) {
      return res.status(403).json({ success: false, message: 'This assessment is closed or not published.' });
    }

    // Check expiration: If deadline passed, reject unless open
    if (quiz.due_date && new Date(quiz.due_date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This quiz assessment has expired and is no longer accepting new attempts.',
      });
    }

    // Check attempts limit
    const pastAttempts = await queryCommon(
      'SELECT COUNT(*) as count FROM lms_quiz_attempts WHERE quiz_id = ? AND student_id = ?',
      [id, studentId]
    );
    const attemptNumber = (pastAttempts[0]?.count || 0) + 1;
    if (attemptNumber > quiz.max_attempts) {
      return res.status(400).json({
        success: false,
        message: `Maximum allowed attempts (${quiz.max_attempts}) reached for this assessment.`,
      });
    }

    // Evaluate answers server-side
    const questions = await queryCommon(
      'SELECT id, correct_answer, marks, explanation FROM lms_quiz_questions WHERE quiz_id = ?',
      [id]
    );
    let earnedMarks = 0;
    let totalMarks = 0;
    const review = [];

    for (const q of questions) {
      totalMarks += Number(q.marks || 1);
      const studentAns = answers ? answers[q.id] : null;
      const isCorrect = studentAns && studentAns.toString().trim().toLowerCase() === q.correct_answer.toString().trim().toLowerCase();

      if (isCorrect) {
        earnedMarks += Number(q.marks || 1);
      }

      review.push({
        questionId: q.id,
        studentAnswer: studentAns,
        isCorrect,
        correctAnswer: quiz.results_released ? q.correct_answer : null,
        explanation: quiz.results_released ? q.explanation : null,
        marksAwarded: isCorrect ? q.marks : 0,
      });
    }

    const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
    const passed = percentage >= quiz.passing_score;

    // Persist attempt into lms_quiz_attempts
    await queryCommon(`
      INSERT INTO lms_quiz_attempts (quiz_id, student_id, attempt_number, score, max_score, percentage, passed, answers, evaluation_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'AUTO_GRADED')
    `, [id, studentId, attemptNumber, earnedMarks, totalMarks, percentage, passed ? 1 : 0, JSON.stringify(answers || {})]);

    // Send notification
    await queryCommon(`
      INSERT INTO lms_notifications (user_id, type, title, message, link_url)
      SELECT user_id, 'GRADE_POSTED', 'Quiz Assessment Evaluated', ?, '/lms/quizzes'
      FROM students_master WHERE id = ?
    `, [`You scored ${percentage}% (${earnedMarks}/${totalMarks}) on ${quiz.title}.`, studentId]);

    res.json({
      success: true,
      score: earnedMarks,
      maxScore: totalMarks,
      percentage,
      passed,
      attemptNumber,
      review,
      message: passed
        ? `Congratulations! You passed with ${percentage}%.`
        : `You scored ${percentage}%. Passing requirement is ${quiz.passing_score}%.`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 8. Get Assignments
 * GET /api/v1/lms/assignments
 */
async function getAssignments(req, res, next) {
  try {
    const { userRole, studentId, deptCode, userId } = await resolveStudentContext(req);
    const { courseId } = req.query;

    let sql = `
      SELECT a.*, c.title as course_title, c.course_code,
             COUNT(DISTINCT s.id) as submission_count,
             SUM(CASE WHEN s.status IN ('SUBMITTED', 'AWAITING_GRADING') THEN 1 ELSE 0 END) as pending_grading_count
      FROM lms_assignments a
      JOIN lms_courses c ON c.id = a.course_id
      LEFT JOIN lms_assignment_submissions s ON s.assignment_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (userRole === 'STUDENT') {
      sql += ' AND a.is_published = 1';
      if (studentId) {
        sql += ' AND a.course_id IN (SELECT course_id FROM lms_course_enrollments WHERE student_id = ?)';
        params.push(studentId);
      }
    } else if (userRole === 'FACULTY_COORDINATOR' && deptCode) {
      sql += ' AND (c.department_code = ? OR c.instructor_id = ? OR c.department_code IS NULL)';
      params.push(deptCode, userId);
    }

    if (courseId) {
      sql += ' AND a.course_id = ?';
      params.push(courseId);
    }

    sql += ' GROUP BY a.id ORDER BY a.due_date ASC, a.created_at DESC';

    const assignments = await queryCommon(sql, params);

    // If student, attach student's submission status
    if (userRole === 'STUDENT' && studentId) {
      const assignIds = assignments.map(a => a.id);
      if (assignIds.length > 0) {
        const placeholders = assignIds.map(() => '?').join(',');
        const submissions = await queryCommon(`
          SELECT * FROM lms_assignment_submissions
          WHERE student_id = ? AND assignment_id IN (${placeholders})
        `, [studentId, ...assignIds]);

        const subMap = new Map();
        submissions.forEach(s => subMap.set(s.assignment_id, s));

        assignments.forEach(a => {
          const sub = subMap.get(a.id);
          a.hasSubmitted = Boolean(sub);
          a.submission = sub || null;
        });
      }
    }

    res.json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create Assignment (Faculty)
 * POST /api/v1/lms/assignments
 */
async function createAssignment(req, res, next) {
  try {
    const { courseId, title, description, instructions, maxMarks, dueDate, startDate, allowedFileTypes, allowLateSubmissions, allowResubmissions, isPublished } = req.body;
    const instructorId = req.user?.id || 4;

    if (!courseId || !title || !dueDate) {
      return res.status(400).json({ success: false, message: 'courseId, title, and dueDate are required.' });
    }

    await verifyCourseOwnership(courseId, req.user);

    const result = await queryCommon(`
      INSERT INTO lms_assignments (
        course_id, title, description, instructions, max_marks, due_date, start_date, allowed_file_types,
        allow_late_submissions, allow_resubmissions, is_published, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      courseId,
      title.trim(),
      description || '',
      instructions || 'Follow instructions and upload deliverables.',
      maxMarks || 100,
      dueDate,
      startDate || null,
      allowedFileTypes || 'pdf,zip,doc,docx,py,js,java,cpp',
      allowLateSubmissions !== false ? 1 : 0,
      allowResubmissions !== false ? 1 : 0,
      isPublished !== false ? 1 : 0,
      instructorId,
    ]);

    // Notify enrolled students
    if (isPublished !== false) {
      await queryCommon(`
        INSERT INTO lms_notifications (user_id, type, title, message, link_url)
        SELECT sm.user_id, 'ASSIGNMENT_DUE', 'New Course Assignment Posted', ?, '/lms/assignments'
        FROM lms_course_enrollments e
        JOIN students_master sm ON sm.id = e.student_id
        WHERE e.course_id = ?
      `, [`Assignment "${title}" has been posted. Due: ${new Date(dueDate).toLocaleDateString()}.`, courseId]);
    }

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Assignment created and posted to course repository.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update Assignment (Faculty)
 * PUT /api/v1/lms/assignments/:id
 */
async function updateAssignment(req, res, next) {
  try {
    const { id } = req.params;
    const assignments = await queryCommon('SELECT * FROM lms_assignments WHERE id = ?', [id]);
    if (assignments.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }
    await verifyCourseOwnership(assignments[0].course_id, req.user);

    const { title, description, instructions, maxMarks, dueDate, isPublished } = req.body;

    await queryCommon(`
      UPDATE lms_assignments
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          instructions = COALESCE(?, instructions),
          max_marks = COALESCE(?, max_marks),
          due_date = COALESCE(?, due_date),
          is_published = COALESCE(?, is_published)
      WHERE id = ?
    `, [title, description, instructions, maxMarks, dueDate, isPublished, id]);

    res.json({
      success: true,
      message: 'Assignment updated successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 9. Submit Assignment (Student)
 * POST /api/v1/lms/assignments/:id/submit
 */
async function submitAssignment(req, res, next) {
  try {
    const { id } = req.params;
    const { submissionText, githubUrl, fileName } = req.body;
    const { studentId } = await resolveStudentContext(req);

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID required.' });
    }

    const assignments = await queryCommon('SELECT * FROM lms_assignments WHERE id = ?', [id]);
    if (assignments.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }
    const assignment = assignments[0];

    // Check if assignment is published
    if (!assignment.is_published) {
      return res.status(403).json({ success: false, message: 'This assignment is not accepting submissions.' });
    }

    // Check deadline policy
    const isPastDue = assignment.due_date && new Date(assignment.due_date) < new Date();
    if (isPastDue && !assignment.allow_late_submissions) {
      return res.status(400).json({
        success: false,
        message: 'The submission deadline has passed, and late submissions are not allowed for this assignment.',
      });
    }

    // Check if student has already submitted
    const existingSubmissions = await queryCommon(
      'SELECT id, status FROM lms_assignment_submissions WHERE assignment_id = ? AND student_id = ?',
      [id, studentId]
    );

    if (existingSubmissions.length > 0 && !assignment.allow_resubmissions && existingSubmissions[0].status !== 'RESUBMISSION_REQUESTED') {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment, and resubmissions are disabled.',
      });
    }

    let fileUrl = req.body.fileUrl || null;
    let finalFileName = fileName || 'submission_file';

    // If file was uploaded via multipart/form-data
    if (req.file) {
      fileUrl = `/uploads/lms/assignments/${req.file.filename}`;
      finalFileName = req.file.originalname;
    }

    await queryCommon(`
      INSERT INTO lms_assignment_submissions (
        assignment_id, student_id, submission_text, github_url, file_name, file_url, status, submitted_at, is_late
      ) VALUES (?, ?, ?, ?, ?, ?, 'SUBMITTED', NOW(), ?)
      ON DUPLICATE KEY UPDATE
        submission_text = VALUES(submission_text),
        github_url = VALUES(github_url),
        file_name = VALUES(file_name),
        file_url = VALUES(file_url),
        status = 'SUBMITTED',
        submitted_at = NOW(),
        is_late = VALUES(is_late)
    `, [
      id,
      studentId,
      submissionText || '',
      githubUrl || null,
      finalFileName,
      fileUrl,
      isPastDue ? 1 : 0,
    ]);

    // Notify instructor
    await queryCommon(`
      INSERT INTO lms_notifications (user_id, type, title, message, link_url)
      SELECT c.instructor_id, 'GRADE_POSTED', 'New Assignment Submission', ?, '/lms/manage-assignments'
      FROM lms_assignments a
      JOIN lms_courses c ON c.id = a.course_id
      WHERE a.id = ?
    `, [`A student submitted work for "${assignment.title}". Ready for evaluation in Grading Queue.`, id]);

    res.json({
      success: true,
      isLate: isPastDue,
      fileUrl,
      message: isPastDue
        ? 'Assignment submitted late. Marked as Late Submission for faculty evaluation.'
        : 'Assignment submitted successfully for faculty review.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 10. Grading Queue (Faculty / Coordinator / Admin)
 * GET /api/v1/lms/grading/queue
 */
async function getGradingQueue(req, res, next) {
  try {
    const { userId, userRole, deptCode } = await resolveStudentContext(req);
    const { courseId, status } = req.query;

    const isSuperOrAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
    let courseFilter = '1=1';
    const params = [];

    if (!isSuperOrAdmin) {
      if (deptCode) {
        courseFilter = '(c.department_code = ? OR c.instructor_id = ? OR c.department_code IS NULL)';
        params.push(deptCode, userId);
      } else {
        courseFilter = 'c.instructor_id = ?';
        params.push(userId);
      }
    }

    let statusFilter = '';
    if (status && status !== 'ALL') {
      statusFilter = 'AND s.status = ?';
      params.push(status);
    }

    if (courseId) {
      courseFilter += ' AND c.id = ?';
      params.push(courseId);
    }

    const submissions = await queryCommon(`
      SELECT s.*, 
             a.title as assignment_title, a.max_marks, a.due_date,
             c.title as course_title, c.course_code, c.id as course_id,
             sm.register_number, sm.roll_number, sm.department_code as student_dept,
             u.first_name, u.last_name, u.email
      FROM lms_assignment_submissions s
      JOIN lms_assignments a ON a.id = s.assignment_id
      JOIN lms_courses c ON c.id = a.course_id
      JOIN students_master sm ON sm.id = s.student_id
      JOIN users u ON u.id = sm.user_id
      WHERE ${courseFilter} ${statusFilter}
      ORDER BY s.submitted_at DESC
    `, params);

    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 11. Grade Submission (Faculty)
 * POST /api/v1/lms/submissions/:id/grade
 */
async function gradeAssignment(req, res, next) {
  try {
    const { id } = req.params;
    const { grade, feedback, releaseResults } = req.body;
    const instructorId = req.user?.id || 4;

    const subRows = await queryCommon(`
      SELECT s.*, a.course_id, a.title as assignment_title, a.max_marks
      FROM lms_assignment_submissions s
      JOIN lms_assignments a ON a.id = s.assignment_id
      WHERE s.id = ?
    `, [id]);

    if (subRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }
    const sub = subRows[0];
    await verifyCourseOwnership(sub.course_id, req.user);

    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > Number(sub.max_marks)) {
      return res.status(400).json({
        success: false,
        message: `Grade must be a number between 0 and maximum marks (${sub.max_marks}).`,
      });
    }

    const isReleased = Boolean(releaseResults || req.body.status === 'RESULTS_RELEASED');
    const finalStatus = isReleased ? 'RESULTS_RELEASED' : 'GRADED';

    await queryCommon(`
      UPDATE lms_assignment_submissions
      SET grade = ?, feedback = ?, status = ?, graded_by = ?, graded_at = NOW()
      WHERE id = ?
    `, [numericGrade, feedback || '', finalStatus, instructorId, id]);

    // If released, notify student immediately
    if (isReleased) {
      await queryCommon(`
        INSERT INTO lms_notifications (user_id, type, title, message, link_url)
        SELECT user_id, 'GRADE_POSTED', 'Assignment Results Released', ?, '/lms/assignments'
        FROM students_master WHERE id = ?
      `, [`Your submission for "${sub.assignment_title}" has been graded: ${numericGrade}/${sub.max_marks}.`, sub.student_id]);
    }

    res.json({
      success: true,
      status: finalStatus,
      message: releaseResults
        ? 'Submission graded and results released to student!'
        : 'Grade saved as draft (Graded status). Click "Release Results" when ready.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Release Assignment Results to Student
 * POST /api/v1/lms/submissions/:id/release
 */
async function releaseAssignmentResult(req, res, next) {
  try {
    const { id } = req.params;
    const subRows = await queryCommon(`
      SELECT s.*, a.course_id, a.title as assignment_title, a.max_marks
      FROM lms_assignment_submissions s
      JOIN lms_assignments a ON a.id = s.assignment_id
      WHERE s.id = ?
    `, [id]);

    if (subRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }
    const sub = subRows[0];
    await verifyCourseOwnership(sub.course_id, req.user);

    await queryCommon(`
      UPDATE lms_assignment_submissions
      SET status = 'RESULTS_RELEASED'
      WHERE id = ?
    `, [id]);

    await queryCommon(`
      INSERT INTO lms_notifications (user_id, type, title, message, link_url)
      SELECT user_id, 'GRADE_POSTED', 'Assignment Results Released', ?, '/lms/assignments'
      FROM students_master WHERE id = ?
    `, [`Your evaluated marks for "${sub.assignment_title}" are now released.`, sub.student_id]);

    res.json({
      success: true,
      message: 'Results released to student.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 12. Student Progress Matrix (Real Database Aggregation)
 * GET /api/v1/lms/progress
 */
async function getStudentProgress(req, res, next) {
  try {
    const { userRole, studentId, deptCode, userId } = await resolveStudentContext(req);
    const { courseId } = req.query;

    if (userRole === 'STUDENT') {
      const sId = studentId || 1;
      const courses = await queryCommon(`
        SELECT c.id, c.title, c.course_code, c.category, c.level, c.duration_hours,
               e.progress_percentage, e.status as enrollment_status, e.certificate_issued, e.certificate_id,
               (SELECT COUNT(*) FROM lms_lessons l WHERE l.course_id = c.id AND l.is_published = 1) as total_lessons,
               (SELECT COUNT(*) FROM lms_lesson_progress lp WHERE lp.course_id = c.id AND lp.student_id = ? AND lp.is_completed = 1) as completed_lessons,
               (SELECT ROUND(AVG(percentage), 1) FROM lms_quiz_attempts qa JOIN lms_quizzes q ON q.id = qa.quiz_id WHERE q.course_id = c.id AND qa.student_id = ?) as avg_quiz_score,
               (SELECT ROUND(AVG(grade), 1) FROM lms_assignment_submissions s JOIN lms_assignments a ON a.id = s.assignment_id WHERE a.course_id = c.id AND s.student_id = ? AND s.grade IS NOT NULL) as avg_assignment_grade
        FROM lms_course_enrollments e
        JOIN lms_courses c ON c.id = e.course_id
        WHERE e.student_id = ?
      `, [sId, sId, sId, sId]);

      const attendance = await queryCommon(`
        SELECT la.status, lc.title as class_title, lc.start_time, c.course_code
        FROM lms_live_attendance la
        JOIN lms_live_classes lc ON lc.id = la.live_class_id
        JOIN lms_courses c ON c.id = lc.course_id
        WHERE la.student_id = ?
        ORDER BY lc.start_time DESC
      `, [sId]);

      return res.json({
        success: true,
        data: {
          courses,
          attendance,
        },
      });
    }

    // Faculty progress matrix
    const isSuperOrAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
    let filter = '1=1';
    const params = [];

    if (!isSuperOrAdmin) {
      if (deptCode) {
        filter = '(c.department_code = ? OR c.instructor_id = ? OR c.department_code IS NULL)';
        params.push(deptCode, userId);
      } else {
        filter = 'c.instructor_id = ?';
        params.push(userId);
      }
    }

    if (courseId) {
      filter += ' AND c.id = ?';
      params.push(courseId);
    }

    const students = await queryCommon(`
      SELECT 
        sm.id as student_id, sm.register_number, sm.roll_number, sm.department_code as student_dept,
        u.first_name, u.last_name, u.email,
        c.id as course_id, c.title as course_title, c.course_code,
        e.progress_percentage, e.status as enrollment_status, e.certificate_issued, e.enrolled_at,
        (SELECT COUNT(*) FROM lms_lessons l WHERE l.course_id = c.id AND l.is_published = 1) as total_lessons,
        (SELECT COUNT(*) FROM lms_lesson_progress lp WHERE lp.course_id = c.id AND lp.student_id = sm.id AND lp.is_completed = 1) as completed_lessons,
        (SELECT COUNT(*) FROM lms_quiz_attempts qa JOIN lms_quizzes q ON q.id = qa.quiz_id WHERE q.course_id = c.id AND qa.student_id = sm.id) as quiz_attempts_taken,
        (SELECT ROUND(AVG(qa.percentage), 1) FROM lms_quiz_attempts qa JOIN lms_quizzes q ON q.id = qa.quiz_id WHERE q.course_id = c.id AND qa.student_id = sm.id) as avg_quiz_score,
        (SELECT COUNT(*) FROM lms_assignment_submissions s JOIN lms_assignments a ON a.id = s.assignment_id WHERE a.course_id = c.id AND s.student_id = sm.id) as assignments_submitted,
        (SELECT ROUND(AVG(s.grade), 1) FROM lms_assignment_submissions s JOIN lms_assignments a ON a.id = s.assignment_id WHERE a.course_id = c.id AND s.student_id = sm.id AND s.grade IS NOT NULL) as avg_assignment_grade,
        (SELECT COUNT(*) FROM lms_live_attendance la JOIN lms_live_classes lc ON lc.id = la.live_class_id WHERE lc.course_id = c.id AND la.student_id = sm.id AND la.status = 'PRESENT') as sessions_attended,
        (SELECT COUNT(*) FROM lms_live_attendance la JOIN lms_live_classes lc ON lc.id = la.live_class_id WHERE lc.course_id = c.id AND la.student_id = sm.id) as total_sessions
      FROM lms_course_enrollments e
      JOIN lms_courses c ON c.id = e.course_id
      JOIN students_master sm ON sm.id = e.student_id
      JOIN users u ON u.id = sm.user_id
      WHERE ${filter}
      ORDER BY c.course_code ASC, sm.register_number ASC
    `, params);

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 13. Live Classes
 * GET /api/v1/lms/live-classes
 */
async function getLiveClasses(req, res, next) {
  try {
    const { studentId, userRole, deptCode, userId } = await resolveStudentContext(req);
    const { courseId } = req.query;

    let sql = `
      SELECT lc.*, c.title as course_title, c.course_code,
             u.first_name as instructor_first, u.last_name as instructor_last,
             (SELECT COUNT(*) FROM lms_live_attendance la WHERE la.live_class_id = lc.id) as attendance_count
      FROM lms_live_classes lc
      JOIN lms_courses c ON c.id = lc.course_id
      JOIN users u ON u.id = lc.instructor_id
      WHERE lc.status != 'CANCELLED'
    `;
    const params = [];

    if (userRole === 'STUDENT' && studentId) {
      sql += ' AND lc.course_id IN (SELECT course_id FROM lms_course_enrollments WHERE student_id = ?)';
      params.push(studentId);
    } else if (userRole === 'FACULTY_COORDINATOR' && deptCode) {
      sql += ' AND (c.department_code = ? OR c.instructor_id = ? OR c.department_code IS NULL)';
      params.push(deptCode, userId);
    }

    if (courseId) {
      sql += ' AND lc.course_id = ?';
      params.push(courseId);
    }

    sql += ' ORDER BY lc.start_time ASC';

    const classes = await queryCommon(sql, params);

    // If student, attach their attendance status
    if (userRole === 'STUDENT' && studentId && classes.length > 0) {
      const classIds = classes.map(c => c.id);
      const placeholders = classIds.map(() => '?').join(',');
      const attendances = await queryCommon(`
        SELECT live_class_id, status FROM lms_live_attendance
        WHERE student_id = ? AND live_class_id IN (${placeholders})
      `, [studentId, ...classIds]);

      const attMap = new Map();
      attendances.forEach(a => attMap.set(a.live_class_id, a.status));

      classes.forEach(c => {
        c.myAttendance = attMap.get(c.id) || 'NOT_MARKED';
      });
    }

    res.json({
      success: true,
      data: classes,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Schedule Live Class (Faculty)
 * POST /api/v1/lms/live-classes
 */
async function scheduleLiveClass(req, res, next) {
  try {
    const { courseId, title, startTime, durationMinutes, meetingLink } = req.body;
    const instructorId = req.user?.id || 4;

    if (!courseId || !title || !startTime) {
      return res.status(400).json({ success: false, message: 'courseId, title, and startTime are required.' });
    }

    await verifyCourseOwnership(courseId, req.user);

    const result = await queryCommon(`
      INSERT INTO lms_live_classes (course_id, title, instructor_id, start_time, duration_minutes, meeting_link, platform, status)
      VALUES (?, ?, ?, ?, ?, ?, 'CampusCorp Video / Meet', 'SCHEDULED')
    `, [courseId, title.trim(), instructorId, startTime, durationMinutes || 60, meetingLink || 'https://meet.google.com/campuscorp-live']);

    // Notify enrolled students
    await queryCommon(`
      INSERT INTO lms_notifications (user_id, type, title, message, link_url)
      SELECT sm.user_id, 'LIVE_CLASS', 'Live Masterclass Scheduled', ?, '/lms/live-classes'
      FROM lms_course_enrollments e
      JOIN students_master sm ON sm.id = e.student_id
      WHERE e.course_id = ?
    `, [`"${title}" is scheduled for ${new Date(startTime).toLocaleString()}.`, courseId]);

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Live session scheduled successfully and posted to student calendars.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Attendance for Live Session (Faculty)
 * GET /api/v1/lms/live-classes/:id/attendance
 */
async function getLiveClassAttendance(req, res, next) {
  try {
    const { id } = req.params;
    const classes = await queryCommon('SELECT * FROM lms_live_classes WHERE id = ?', [id]);
    if (classes.length === 0) {
      return res.status(404).json({ success: false, message: 'Live class session not found.' });
    }
    const liveClass = classes[0];
    await verifyCourseOwnership(liveClass.course_id, req.user);

    const roster = await queryCommon(`
      SELECT sm.id as student_id, sm.register_number, sm.roll_number, sm.department_code,
             u.first_name, u.last_name, u.email,
             la.status as attendance_status, la.marked_at, la.notes
      FROM lms_course_enrollments e
      JOIN students_master sm ON sm.id = e.student_id
      JOIN users u ON u.id = sm.user_id
      LEFT JOIN lms_live_attendance la ON la.student_id = sm.id AND la.live_class_id = ?
      WHERE e.course_id = ?
      ORDER BY sm.register_number ASC
    `, [id, liveClass.course_id]);

    res.json({
      success: true,
      liveClass,
      count: roster.length,
      data: roster,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Record Live Session Attendance (Faculty)
 * POST /api/v1/lms/live-classes/:id/attendance
 */
async function recordLiveClassAttendance(req, res, next) {
  try {
    const { id } = req.params;
    const { attendanceRecords } = req.body; // Array of { studentId, status, notes }
    const markerId = req.user?.id || 4;

    const classes = await queryCommon('SELECT * FROM lms_live_classes WHERE id = ?', [id]);
    if (classes.length === 0) {
      return res.status(404).json({ success: false, message: 'Live class session not found.' });
    }
    await verifyCourseOwnership(classes[0].course_id, req.user);

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({ success: false, message: 'attendanceRecords array is required.' });
    }

    for (const record of attendanceRecords) {
      await queryCommon(`
        INSERT INTO lms_live_attendance (live_class_id, student_id, status, marked_by, marked_at, notes)
        VALUES (?, ?, ?, ?, NOW(), ?)
        ON DUPLICATE KEY UPDATE
          status = VALUES(status),
          marked_by = VALUES(marked_by),
          marked_at = NOW(),
          notes = VALUES(notes)
      `, [id, record.studentId, record.status || 'PRESENT', markerId, record.notes || null]);
    }

    res.json({
      success: true,
      message: `Recorded attendance for ${attendanceRecords.length} student(s) successfully.`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 14. Learning Paths
 * GET /api/v1/lms/learning-paths
 */
async function getLearningPaths(req, res, next) {
  try {
    const { studentId } = await resolveStudentContext(req);

    const paths = await queryCommon('SELECT * FROM lms_learning_paths ORDER BY created_at DESC');

    // Parse JSON milestones and course IDs
    for (const p of paths) {
      p.courseIds = typeof p.course_ids === 'string' ? JSON.parse(p.course_ids) : (p.course_ids || []);
      p.milestones = typeof p.milestones === 'string' ? JSON.parse(p.milestones) : (p.milestones || []);

      // If student, check enrollment
      if (studentId) {
        const enr = await queryCommon(
          'SELECT * FROM lms_learning_path_enrollments WHERE path_id = ? AND student_id = ?',
          [p.id, studentId]
        );
        p.isEnrolled = enr.length > 0;
        p.progressPercentage = enr.length > 0 ? Number(enr[0].progress_percentage) : 0;
        p.completedMilestones = enr.length > 0
          ? (typeof enr[0].completed_milestones === 'string' ? JSON.parse(enr[0].completed_milestones) : (enr[0].completed_milestones || []))
          : [];
      }
    }

    res.json({
      success: true,
      data: paths,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create Learning Path (Faculty)
 * POST /api/v1/lms/learning-paths
 */
async function createLearningPath(req, res, next) {
  try {
    const { title, description, targetRoleId, departmentCode, estimatedWeeks, courseIds, milestones } = req.body;
    const instructorId = req.user?.id || 4;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Learning path title is required.' });
    }

    const result = await queryCommon(`
      INSERT INTO lms_learning_paths (
        title, description, target_role_id, department_code, estimated_weeks, course_ids, milestones, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title.trim(),
      description || '',
      targetRoleId || null,
      departmentCode || req.user?.department_code || null,
      estimatedWeeks || 8,
      JSON.stringify(courseIds || [1]),
      JSON.stringify(milestones || ['Core Foundations', 'API Architecture', 'Production Capstone']),
      instructorId,
    ]);

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Learning path curriculum created successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Assign Learning Path to Students (Faculty)
 * POST /api/v1/lms/learning-paths/:id/assign
 */
async function assignLearningPath(req, res, next) {
  try {
    const { id } = req.params;
    const { departmentCode } = req.body;

    const paths = await queryCommon('SELECT * FROM lms_learning_paths WHERE id = ?', [id]);
    if (paths.length === 0) {
      return res.status(404).json({ success: false, message: 'Learning path not found.' });
    }
    const pathItem = paths[0];

    const dept = departmentCode || pathItem.department_code || req.user?.department_code;
    let studentSql = 'SELECT id FROM students_master';
    const params = [];
    if (dept && dept !== 'ALL') {
      studentSql += ' WHERE department_code = ?';
      params.push(dept);
    }
    const students = await queryCommon(studentSql, params);

    for (const s of students) {
      await queryCommon(`
        INSERT INTO lms_learning_path_enrollments (path_id, student_id, progress_percentage, status)
        VALUES (?, ?, 10.00, 'IN_PROGRESS')
        ON DUPLICATE KEY UPDATE status = 'IN_PROGRESS'
      `, [id, s.id]);
    }

    res.json({
      success: true,
      message: `Assigned "${pathItem.title}" to ${students.length} student(s) in ${dept || 'all departments'}.`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 15. Discussions
 * GET /api/v1/lms/discussions
 */
async function getDiscussions(req, res, next) {
  try {
    const { courseId } = req.query;

    let sql = `
      SELECT d.*, c.title as course_title, c.course_code, u.first_name, u.last_name, r.role_name,
             COUNT(rep.id) as reply_count
      FROM lms_discussions d
      JOIN lms_courses c ON c.id = d.course_id
      JOIN users u ON u.id = d.user_id
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN lms_discussion_replies rep ON rep.discussion_id = d.id
      WHERE 1=1
    `;
    const params = [];
    if (courseId) {
      sql += ' AND d.course_id = ?';
      params.push(courseId);
    }
    sql += ' GROUP BY d.id ORDER BY d.is_pinned DESC, d.created_at DESC';

    const discussions = await queryCommon(sql, params);

    for (const d of discussions) {
      d.replies = await queryCommon(`
        SELECT rep.*, u.first_name, u.last_name, r.role_name
        FROM lms_discussion_replies rep
        JOIN users u ON u.id = rep.user_id
        JOIN roles r ON r.id = u.role_id
        WHERE rep.discussion_id = ?
        ORDER BY rep.created_at ASC
      `, [d.id]);
    }

    res.json({
      success: true,
      data: discussions,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create Discussion / Ask Question
 * POST /api/v1/lms/discussions
 */
async function createDiscussion(req, res, next) {
  try {
    const { courseId, title, message } = req.body;
    const userId = req.user?.id || 8;

    if (!courseId || !title || !message) {
      return res.status(400).json({ success: false, message: 'courseId, title, and message are required.' });
    }

    const result = await queryCommon(`
      INSERT INTO lms_discussions (course_id, user_id, title, message)
      VALUES (?, ?, ?, ?)
    `, [courseId, userId, title.trim(), message.trim()]);

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Discussion topic posted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Post Discussion Reply
 * POST /api/v1/lms/discussions/:id/reply
 */
async function replyDiscussion(req, res, next) {
  try {
    const { id } = req.params;
    const { replyText } = req.body;
    const userId = req.user?.id || 4;
    const isFaculty = req.user?.role_name === 'FACULTY_COORDINATOR' || req.user?.role_name === 'SUPER_ADMIN' || req.user?.roleName === 'FACULTY_COORDINATOR';

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ success: false, message: 'replyText cannot be empty.' });
    }

    await queryCommon(`
      INSERT INTO lms_discussion_replies (discussion_id, user_id, reply_text, is_faculty_answer)
      VALUES (?, ?, ?, ?)
    `, [id, userId, replyText.trim(), isFaculty ? 1 : 0]);

    res.json({
      success: true,
      message: 'Reply posted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Resolve Discussion
 * PUT /api/v1/lms/discussions/:id/resolve
 */
async function resolveDiscussion(req, res, next) {
  try {
    const { id } = req.params;
    await queryCommon('UPDATE lms_discussions SET is_resolved = 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Discussion marked as resolved.' });
  } catch (err) {
    next(err);
  }
}

/**
 * 16. Student Notes & Bookmarks (Strictly Isolated per Student)
 * GET /api/v1/lms/notes
 */
async function getNotes(req, res, next) {
  try {
    const { studentId } = await resolveStudentContext(req);

    if (!studentId) {
      return res.json({ success: true, data: [] });
    }

    const notes = await queryCommon(`
      SELECT n.*, c.title as course_title, c.course_code
      FROM lms_student_notes n
      JOIN lms_courses c ON c.id = n.course_id
      WHERE n.student_id = ?
      ORDER BY n.is_bookmarked DESC, n.updated_at DESC
    `, [studentId]);

    res.json({
      success: true,
      data: notes,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Save Student Note
 * POST /api/v1/lms/notes
 */
async function saveNote(req, res, next) {
  try {
    const { studentId } = await resolveStudentContext(req);
    const { courseId, lessonId, title, noteContent, isBookmarked } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student identification required.' });
    }

    if (!courseId || !title || !noteContent) {
      return res.status(400).json({ success: false, message: 'courseId, title, and noteContent are required.' });
    }

    const result = await queryCommon(`
      INSERT INTO lms_student_notes (student_id, course_id, lesson_id, title, note_content, is_bookmarked)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [studentId, courseId, lessonId || null, title.trim(), noteContent.trim(), isBookmarked ? 1 : 0]);

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Personal note saved securely.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete Student Note
 * DELETE /api/v1/lms/notes/:id
 */
async function deleteNote(req, res, next) {
  try {
    const { id } = req.params;
    const { studentId } = await resolveStudentContext(req);

    await queryCommon('DELETE FROM lms_student_notes WHERE id = ? AND student_id = ?', [id, studentId]);

    res.json({
      success: true,
      message: 'Note deleted.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 17. Certificates
 * GET /api/v1/lms/certificates
 */
async function getCertificates(req, res, next) {
  try {
    const { studentId, userRole } = await resolveStudentContext(req);

    let sql = `
      SELECT cert.*, c.title as course_title, c.course_code, c.duration_hours,
             sm.register_number, u.first_name, u.last_name
      FROM lms_certificates cert
      JOIN lms_courses c ON c.id = cert.course_id
      JOIN students_master sm ON sm.id = cert.student_id
      JOIN users u ON u.id = sm.user_id
    `;
    const params = [];

    if (userRole === 'STUDENT' && studentId) {
      sql += ' WHERE cert.student_id = ?';
      params.push(studentId);
    }

    sql += ' ORDER BY cert.issue_date DESC';

    const certificates = await queryCommon(sql, params);

    res.json({
      success: true,
      data: certificates,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Issue Course Certificate (Faculty)
 * POST /api/v1/lms/certificates/issue
 */
async function issueCertificate(req, res, next) {
  try {
    const { courseId, studentId, gradeAchieved } = req.body;
    const instructorId = req.user?.id || 4;

    if (!courseId || !studentId) {
      return res.status(400).json({ success: false, message: 'courseId and studentId are required.' });
    }

    await verifyCourseOwnership(courseId, req.user);

    const certId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const verificationHash = crypto.createHash('sha256').update(`${certId}-${studentId}-${courseId}`).digest('hex');

    await queryCommon(`
      INSERT INTO lms_certificates (id, student_id, course_id, issue_date, grade_achieved, verification_hash, is_approved, approved_by)
      VALUES (?, ?, ?, CURDATE(), ?, ?, 1, ?)
      ON DUPLICATE KEY UPDATE grade_achieved = VALUES(grade_achieved)
    `, [certId, studentId, courseId, gradeAchieved || 'A+', verificationHash, instructorId]);

    await queryCommon(`
      UPDATE lms_course_enrollments
      SET certificate_issued = 1, certificate_id = ?
      WHERE course_id = ? AND student_id = ?
    `, [certId, courseId, studentId]);

    res.json({
      success: true,
      certificateId: certId,
      message: 'Certificate issued successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 18. LMS Notifications
 * GET /api/v1/lms/notifications
 */
async function getNotifications(req, res, next) {
  try {
    const userId = req.user?.id || 8;

    // Check user notification preferences
    const prefRows = await queryCommon(
      `SELECT notifications_enabled, lms_alerts_enabled FROM user_preferences WHERE user_id = ?`,
      [userId]
    );
    if (prefRows.length > 0) {
      const { notifications_enabled, lms_alerts_enabled } = prefRows[0];
      if (!notifications_enabled || !lms_alerts_enabled) {
        return res.json({
          success: true,
          data: [],
          muted: true,
          message: 'LMS notifications are muted according to your settings.',
        });
      }
    }

    const notifications = await queryCommon(`
      SELECT * FROM lms_notifications
      WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 20
    `, [userId]);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 19. Student Portfolio Projects
 * GET /api/v1/lms/portfolio
 */
async function getPortfolio(req, res, next) {
  try {
    const { studentId } = await resolveStudentContext(req);

    const projects = await queryCommon(`
      SELECT p.*, c.title as course_title
      FROM lms_student_portfolio_projects p
      LEFT JOIN lms_courses c ON c.id = p.course_id
      WHERE p.student_id = ?
      ORDER BY p.is_featured DESC, p.created_at DESC
    `, [studentId]);

    const formatted = projects.map(p => ({
      ...p,
      technologies: typeof p.technologies === 'string' ? JSON.parse(p.technologies) : (p.technologies || []),
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 20. Help & Support Tickets
 * GET /api/v1/lms/support
 */
async function getSupportTickets(req, res, next) {
  try {
    const { studentId, userRole } = await resolveStudentContext(req);

    let sql = `
      SELECT t.*, c.title as course_title,
             sm.register_number, u.first_name, u.last_name
      FROM lms_support_tickets t
      LEFT JOIN lms_courses c ON c.id = t.course_id
      JOIN students_master sm ON sm.id = t.student_id
      JOIN users u ON u.id = sm.user_id
    `;
    const params = [];

    if (userRole === 'STUDENT' && studentId) {
      sql += ' WHERE t.student_id = ?';
      params.push(studentId);
    }

    sql += ' ORDER BY t.created_at DESC';

    const tickets = await queryCommon(sql, params);

    res.json({
      success: true,
      data: tickets,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/lms/support
 */
async function createSupportTicket(req, res, next) {
  try {
    const { studentId } = await resolveStudentContext(req);
    const { courseId, category, subject, description, priority } = req.body;

    const result = await queryCommon(`
      INSERT INTO lms_support_tickets (student_id, course_id, category, subject, description, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, 'OPEN')
    `, [studentId, courseId || null, category || 'OTHER', subject, description, priority || 'MEDIUM']);

    res.json({
      success: true,
      id: result.insertId,
      message: 'Support ticket submitted. Academic support team has been notified.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 21. Announcements
 * GET /api/v1/lms/announcements
 */
async function getAnnouncements(req, res, next) {
  try {
    const announcements = await queryCommon(`
      SELECT a.*, c.title as course_title, c.course_code, u.first_name, u.last_name, r.role_name
      FROM lms_announcements a
      LEFT JOIN lms_courses c ON c.id = a.course_id
      JOIN users u ON u.id = a.author_id
      JOIN roles r ON r.id = u.role_id
      ORDER BY a.created_at DESC LIMIT 15
    `);

    res.json({
      success: true,
      data: announcements,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create Announcement (Faculty)
 * POST /api/v1/lms/announcements
 */
async function createAnnouncement(req, res, next) {
  try {
    const { courseId, title, content, priority } = req.body;
    const authorId = req.user?.id || 4;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'title and content are required.' });
    }

    if (courseId) {
      await verifyCourseOwnership(courseId, req.user);
    }

    const result = await queryCommon(`
      INSERT INTO lms_announcements (course_id, department_code, title, content, author_id, priority)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [courseId || null, req.user?.department_code || null, title.trim(), content.trim(), authorId, priority || 'NORMAL']);

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Announcement posted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 22. Reports & Analytics (Faculty / Coordinator / Admin)
 * GET /api/v1/lms/reports
 */
async function getReports(req, res, next) {
  try {
    const overview = await queryCommon(`
      SELECT 
        (SELECT COUNT(*) FROM lms_courses WHERE status = 'PUBLISHED') as active_courses,
        (SELECT COUNT(*) FROM lms_course_enrollments) as total_enrollments,
        (SELECT COUNT(*) FROM lms_course_enrollments WHERE status = 'COMPLETED') as completed_enrollments,
        (SELECT COUNT(*) FROM lms_certificates) as issued_certificates,
        (SELECT ROUND(AVG(percentage), 1) FROM lms_quiz_attempts) as avg_quiz_score,
        (SELECT ROUND(AVG(grade), 1) FROM lms_assignment_submissions WHERE grade IS NOT NULL) as avg_assignment_grade,
        (SELECT COUNT(*) FROM lms_live_attendance WHERE status = 'PRESENT') as total_live_attendees
    `);

    const courseBreakdown = await queryCommon(`
      SELECT c.title, c.course_code, c.category, c.department_code,
             COUNT(e.student_id) as total_enrolled,
             SUM(CASE WHEN e.status = 'COMPLETED' THEN 1 ELSE 0 END) as completions,
             ROUND(AVG(e.progress_percentage), 1) as avg_progress,
             (SELECT COUNT(*) FROM lms_course_resources r WHERE r.course_id = c.id AND r.is_published = 1) as resource_count,
             (SELECT COUNT(*) FROM lms_quizzes q WHERE q.course_id = c.id AND q.is_published = 1) as quiz_count,
             (SELECT COUNT(*) FROM lms_assignments a WHERE a.course_id = c.id AND a.is_published = 1) as assignment_count
      FROM lms_courses c
      LEFT JOIN lms_course_enrollments e ON e.course_id = c.id
      GROUP BY c.id
      ORDER BY total_enrolled DESC
    `);

    res.json({
      success: true,
      data: {
        summary: overview[0] || {},
        courses: courseBreakdown,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  getCourseStudents,
  enrollCourse,
  createModule,
  createLesson,
  completeLesson,
  getResources,
  uploadResource,
  deleteResource,
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizAttempts,
  submitQuizAttempt,
  getAssignments,
  createAssignment,
  updateAssignment,
  submitAssignment,
  getGradingQueue,
  gradeAssignment,
  releaseAssignmentResult,
  getStudentProgress,
  getLiveClasses,
  scheduleLiveClass,
  getLiveClassAttendance,
  recordLiveClassAttendance,
  getLearningPaths,
  createLearningPath,
  assignLearningPath,
  getDiscussions,
  createDiscussion,
  replyDiscussion,
  resolveDiscussion,
  getNotes,
  saveNote,
  deleteNote,
  getCertificates,
  issueCertificate,
  getNotifications,
  getPortfolio,
  getSupportTickets,
  createSupportTicket,
  getAnnouncements,
  createAnnouncement,
  getReports,
};
