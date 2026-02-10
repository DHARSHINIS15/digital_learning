const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/:courseId', enrollmentController.enroll);
router.get('/my', enrollmentController.myEnrollments);

module.exports = router;
