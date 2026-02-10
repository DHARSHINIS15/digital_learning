const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.use(authenticate);

router.get('/admin', roleCheck('admin'), analyticsController.adminAnalytics);
router.get('/instructor/:id', roleCheck('admin', 'instructor'), analyticsController.instructorAnalytics);
router.get('/student/:id', roleCheck('admin', 'instructor', 'student'), analyticsController.studentAnalytics);

module.exports = router;
