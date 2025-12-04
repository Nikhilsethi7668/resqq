const express = require('express');
const router = express.Router();
const { getAlerts, acknowledgeAlert, updatePostStatus, broadcastAlert } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/alerts', protect, authorize('city_admin', 'state_admin', 'central_admin'), getAlerts);
router.post('/alerts/:id/acknowledge', protect, authorize('city_admin', 'state_admin', 'central_admin'), acknowledgeAlert);
router.post('/posts/:id/status', protect, authorize('city_admin', 'state_admin', 'central_admin'), updatePostStatus);
router.post('/broadcast', protect, authorize('city_admin', 'state_admin', 'central_admin'), broadcastAlert);

module.exports = router;
