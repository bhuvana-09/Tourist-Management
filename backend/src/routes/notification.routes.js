const express = require('express');
const router = express.Router();
const { getMyNotifications, markRead, markAllRead } = require('../controllers/notification.controller');
const authenticate = require('../middlewares/authenticate');

router.use(authenticate);

router.get('/me', getMyNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

module.exports = router;
