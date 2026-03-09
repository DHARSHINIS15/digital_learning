import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');
export const register = (data) => api.post('/auth/register', data);

// Admin
export const createUser = (data) => api.post('/admin/create-user', data);
export const getUsers = () => api.get('/admin/users');
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// Courses
export const getCourses = () => api.get('/courses');
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

// Lessons
export const getLessons = (courseId) => api.get(`/courses/${courseId}/lessons`);
export const createLesson = (courseId, data) => api.post(`/courses/${courseId}/lessons`, data);
export const updateLesson = (id, data) => api.put(`/lessons/${id}`, data);
export const deleteLesson = (id) => api.delete(`/lessons/${id}`);

// Enrollments
export const enroll = (courseId) => api.post(`/enroll/${courseId}`);
export const myEnrollments = () => api.get('/enroll/my');

// Progress
export const updateProgress = (data) => api.post('/progress/update', data);
export const myProgress = () => api.get('/progress/my');
export const getProgressByStudent = (id) => api.get(`/progress/student/${id}`);

// Analytics
export const getAdminAnalytics = () => api.get('/analytics/admin');
export const getInstructorAnalytics = (id) => api.get(`/analytics/instructor/${id}`);
export const getStudentAnalytics = (id) => api.get(`/analytics/student/${id}`);

// Reports
export const getStudentReport = (id) => api.get(`/reports/student/${id}`);
export const getCourseReport = (id) => api.get(`/reports/course/${id}`);
export const downloadReport = (id, type) => api.get(`/reports/download/${id}?type=${type || 'student'}`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const createNotification = (data) => api.post('/notifications', data);
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);

// Quizzes
export const createQuiz = (data) => api.post('/quizzes', data);
export const getQuizzesByCourse = (courseId) => api.get(`/quizzes/course/${courseId}`);
export const getQuizWithQuestions = (quizId) => api.get(`/quizzes/${quizId}`);
export const submitQuizAttempt = (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers });
export const getMyQuizAttempts = () => api.get('/quizzes/my-attempts');
export const getQuizRecommendations = () => api.get('/quizzes/recommendations');
export const getQuizQuestions = (quizId) => api.get(`/quizzes/${quizId}/questions`);
export const addQuizQuestion = (quizId, data) => api.post(`/quizzes/${quizId}/questions`, data);
export const addBatchQuizQuestions = (quizId, questions) => api.post(`/quizzes/${quizId}/questions/batch`, { questions });
export const deleteQuizQuestion = (id) => api.delete(`/quizzes/questions/${id}`);

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Activity (for heatmap)
export const getMyActivity = () => api.get('/activity/me');
export const getActivityByStudent = (id) => api.get(`/activity/student/${id}`);

export default api;
