const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/me', activityController.getMyActivity);
const { roleCheck } = require('../middleware/roleCheck');
router.get('/student/:id', roleCheck('admin', 'instructor'), activityController.getActivityByStudent);

module.exports = router;
