const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.use(authenticate);

router.get('/student/:id', roleCheck('admin', 'instructor'), reportController.studentReport);
router.get('/course/:id', roleCheck('admin', 'instructor'), reportController.courseReport);
router.get('/download/:id', roleCheck('admin', 'instructor'), reportController.downloadReport);

module.exports = router;
