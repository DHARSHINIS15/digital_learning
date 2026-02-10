const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.use(authenticate);

router.post('/update', progressController.updateProgress);
router.get('/my', progressController.myProgress);
router.get('/student/:id', roleCheck('admin', 'instructor'), progressController.getProgressByStudent);

module.exports = router;
