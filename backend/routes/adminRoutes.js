const express = require('express');
const router = express.Router();
const {
    getAlerts,
    acknowledgeAlert,
    updatePostStatus,
    broadcastAlert,
    createAdmin,
    getAdmins,
    getAdminDetails,
    deactivateAdmin,
    updateAdmin,
    getCompletedPosts
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Alert Management Routes
router.get('/alerts', protect, authorize('city_admin', 'state_admin', 'central_admin'), getAlerts);
router.post('/alerts/:id/acknowledge', protect, authorize('city_admin', 'state_admin', 'central_admin'), acknowledgeAlert);
router.post('/posts/:id/status', protect, authorize('city_admin', 'state_admin', 'central_admin'), updatePostStatus);
router.post('/broadcast', protect, authorize('city_admin', 'state_admin', 'central_admin'), broadcastAlert);

// Admin Management Routes
router.post('/users/create', protect, authorize('central_admin', 'state_admin'), createAdmin);
router.get('/users', protect, authorize('central_admin', 'state_admin'), getAdmins);
router.get('/users/:id', protect, authorize('central_admin', 'state_admin'), getAdminDetails);
router.delete('/users/:id', protect, authorize('central_admin', 'state_admin'), deactivateAdmin);
router.put('/users/:id', protect, authorize('central_admin', 'state_admin'), updateAdmin);

// Completed Posts for News Admin
router.get('/completed-posts', protect, authorize('central_admin', 'news_admin', 'state_admin', 'city_admin'), getCompletedPosts);

module.exports = router;

