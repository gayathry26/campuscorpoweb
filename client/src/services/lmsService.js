import apiClient from '../api/client';

/**
 * CampusCorp Master LMS Service
 * Communicates with backend REST API and MySQL database
 */
export const lmsService = {
  // 1. Dashboard
  async getDashboard() {
    const res = await apiClient.get('/lms/dashboard');
    return res.data?.data;
  },

  // 2. Courses
  async getCourses(params = {}) {
    const res = await apiClient.get('/lms/courses', { params });
    return res.data?.data || [];
  },

  async getCourseById(id) {
    const res = await apiClient.get(`/lms/courses/${id}`);
    return res.data?.data;
  },

  async createCourse(data) {
    const res = await apiClient.post('/lms/courses', data);
    return res.data;
  },

  async updateCourse(id, data) {
    const res = await apiClient.put(`/lms/courses/${id}`, data);
    return res.data;
  },

  async getCourseStudents(courseId) {
    const res = await apiClient.get(`/lms/courses/${courseId}/students`);
    return res.data?.data || [];
  },

  async enrollCourse(courseId) {
    const res = await apiClient.post(`/lms/courses/${courseId}/enroll`);
    return res.data;
  },

  // 3. Modules & Lessons
  async createModule(courseId, data) {
    const res = await apiClient.post(`/lms/courses/${courseId}/modules`, data);
    return res.data;
  },

  async createLesson(moduleId, data) {
    const res = await apiClient.post(`/lms/modules/${moduleId}/lessons`, data);
    return res.data;
  },

  async completeLesson(lessonId) {
    const res = await apiClient.post(`/lms/lessons/${lessonId}/complete`);
    return res.data;
  },

  // 4. Resources / Materials
  async getResources(params = {}) {
    const res = await apiClient.get('/lms/resources', { params });
    return res.data?.data || [];
  },

  async uploadResource(formDataOrData) {
    const isFormData = formDataOrData instanceof FormData;
    const res = await apiClient.post('/lms/resources', formDataOrData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  async deleteResource(id) {
    const res = await apiClient.delete(`/lms/resources/${id}`);
    return res.data;
  },

  // 5. Quizzes
  async getQuizzes(params = {}) {
    const res = await apiClient.get('/lms/quizzes', { params });
    return res.data?.data || [];
  },

  async getQuizById(id) {
    const res = await apiClient.get(`/lms/quizzes/${id}`);
    return res.data?.data;
  },

  async createQuiz(data) {
    const res = await apiClient.post('/lms/quizzes', data);
    return res.data;
  },

  async updateQuiz(id, data) {
    const res = await apiClient.put(`/lms/quizzes/${id}`, data);
    return res.data;
  },

  async deleteQuiz(id) {
    const res = await apiClient.delete(`/lms/quizzes/${id}`);
    return res.data;
  },

  async getQuizAttempts(quizId) {
    const res = await apiClient.get(`/lms/quizzes/${quizId}/attempts`);
    return res.data?.data || [];
  },

  async submitQuiz(quizId, answers) {
    const res = await apiClient.post(`/lms/quizzes/${quizId}/submit`, { answers });
    return res.data;
  },

  // 5b. CodeSprint & Programming Assessments
  async getCodingAssessments() {
    const res = await apiClient.get('/assessment/list');
    return res.data?.data || [];
  },

  async getCodingAssessmentById(id) {
    const res = await apiClient.get(`/assessment/${id}`);
    return res.data;
  },

  async createCodingAssessment(data) {
    const res = await apiClient.post('/assessment/create', data);
    return res.data;
  },

  async getCodingSubmissions(assessmentId) {
    const res = await apiClient.get(`/assessment/${assessmentId}/submissions`);
    return res.data?.data || [];
  },

  async getMyCodingSubmissions() {
    const res = await apiClient.get('/assessment/student/my-submissions');
    return res.data?.data || [];
  },

  // 6. Assignments
  async getAssignments(params = {}) {
    const res = await apiClient.get('/lms/assignments', { params });
    return res.data?.data || [];
  },

  async createAssignment(data) {
    const res = await apiClient.post('/lms/assignments', data);
    return res.data;
  },

  async updateAssignment(id, data) {
    const res = await apiClient.put(`/lms/assignments/${id}`, data);
    return res.data;
  },

  async submitAssignment(assignmentId, payload) {
    const isFormData = payload instanceof FormData;
    const res = await apiClient.post(`/lms/assignments/${assignmentId}/submit`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  // 7. Grading Queue
  async getGradingQueue(params = {}) {
    const res = await apiClient.get('/lms/grading/queue', { params });
    return res.data?.data || [];
  },

  async gradeAssignment(submissionId, payload) {
    const res = await apiClient.post(`/lms/submissions/${submissionId}/grade`, payload);
    return res.data;
  },

  async releaseAssignmentResult(submissionId) {
    const res = await apiClient.post(`/lms/submissions/${submissionId}/release`);
    return res.data;
  },

  // 8. Student Progress Matrix
  async getStudentProgress(params = {}) {
    const res = await apiClient.get('/lms/progress', { params });
    return res.data?.data;
  },

  // 9. Learning Paths
  async getLearningPaths() {
    const res = await apiClient.get('/lms/learning-paths');
    return res.data?.data || [];
  },

  async createLearningPath(data) {
    const res = await apiClient.post('/lms/learning-paths', data);
    return res.data;
  },

  async assignLearningPath(pathId, data) {
    const res = await apiClient.post(`/lms/learning-paths/${pathId}/assign`, data);
    return res.data;
  },

  // 10. Live Classes & Attendance
  async getLiveClasses(params = {}) {
    const res = await apiClient.get('/lms/live-classes', { params });
    return res.data?.data || [];
  },

  async scheduleLiveClass(payload) {
    const res = await apiClient.post('/lms/live-classes', payload);
    return res.data;
  },

  async getLiveClassAttendance(classId) {
    const res = await apiClient.get(`/lms/live-classes/${classId}/attendance`);
    return res.data;
  },

  async recordLiveClassAttendance(classId, attendanceRecords) {
    const res = await apiClient.post(`/lms/live-classes/${classId}/attendance`, { attendanceRecords });
    return res.data;
  },

  // 11. Discussions
  async getDiscussions(courseId) {
    const res = await apiClient.get('/lms/discussions', { params: { courseId } });
    return res.data?.data || [];
  },

  async createDiscussion(data) {
    const res = await apiClient.post('/lms/discussions', data);
    return res.data;
  },

  async replyDiscussion(discussionId, replyText) {
    const res = await apiClient.post(`/lms/discussions/${discussionId}/reply`, { replyText });
    return res.data;
  },

  async resolveDiscussion(discussionId) {
    const res = await apiClient.put(`/lms/discussions/${discussionId}/resolve`);
    return res.data;
  },

  // 12. Notes & Bookmarks
  async getNotes() {
    const res = await apiClient.get('/lms/notes');
    return res.data?.data || [];
  },

  async saveNote(payload) {
    const res = await apiClient.post('/lms/notes', payload);
    return res.data;
  },

  async deleteNote(id) {
    const res = await apiClient.delete(`/lms/notes/${id}`);
    return res.data;
  },

  // 13. Certificates
  async getCertificates() {
    const res = await apiClient.get('/lms/certificates');
    return res.data?.data || [];
  },

  async issueCertificate(data) {
    const res = await apiClient.post('/lms/certificates/issue', data);
    return res.data;
  },

  // 14. Notifications, Portfolio, Support
  async getNotifications() {
    const res = await apiClient.get('/lms/notifications');
    return res.data?.data || [];
  },

  async getPortfolio() {
    const res = await apiClient.get('/lms/portfolio');
    return res.data?.data || [];
  },

  async addPortfolio(data) {
    const res = await apiClient.post('/lms/portfolio', data);
    return res.data;
  },

  async getSupportTickets() {
    const res = await apiClient.get('/lms/support');
    return res.data?.data || [];
  },

  async createSupportTicket(payload) {
    const res = await apiClient.post('/lms/support', payload);
    return res.data;
  },

  // 15. Announcements
  async getAnnouncements() {
    const res = await apiClient.get('/lms/announcements');
    return res.data?.data || [];
  },

  async createAnnouncement(data) {
    const res = await apiClient.post('/lms/announcements', data);
    return res.data;
  },

  // 16. Reports
  async getReports() {
    const res = await apiClient.get('/lms/reports');
    return res.data?.data;
  },

  // 17. Class Advisor Hub
  async getClassAdvisorOverview() {
    const res = await apiClient.get('/lms/advisor/class-overview');
    return res.data;
  },

  async postAdvisorAnnouncement(data) {
    const res = await apiClient.post('/lms/advisor/announcement', data);
    return res.data;
  },

  // 18. Admin Academic & Faculty Permission Management
  async getAcademicMappings(params = {}) {
    const res = await apiClient.get('/lms/admin/academic-mappings', { params });
    return res.data?.data;
  },

  async assignFacultyToCourse(data) {
    const res = await apiClient.post('/lms/admin/assign-faculty', data);
    return res.data;
  },

  async removeFacultyFromCourse(data) {
    const res = await apiClient.post('/lms/admin/remove-faculty', data);
    return res.data;
  },

  async updateClassAdvisor(data) {
    const res = await apiClient.post('/lms/admin/update-class-advisor', data);
    return res.data;
  },

  async createAdminCourse(data) {
    const res = await apiClient.post('/lms/admin/courses', data);
    return res.data;
  },
};

export default lmsService;
