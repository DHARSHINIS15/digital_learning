const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const lessonController = require('../controllers/lessonController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.use(authenticate);

router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);

// Create/update/delete: Admin or Instructor only
router.post('/', roleCheck('admin', 'instructor'), courseController.createCourse);
router.put('/:id', roleCheck('admin', 'instructor'), courseController.updateCourse);
router.delete('/:id', roleCheck('admin', 'instructor'), courseController.deleteCourse);

// Lessons
router.post('/:id/lessons', roleCheck('admin', 'instructor'), lessonController.createLesson);
router.get('/:id/lessons', lessonController.getLessons);

module.exports = router;
