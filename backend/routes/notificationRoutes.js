const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.post('/', roleCheck('admin', 'instructor'), notificationController.createNotification);
router.put('/:id/read', notificationController.markRead);

module.exports = router;
