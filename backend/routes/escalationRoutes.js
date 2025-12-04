const express = require('express');
const router = express.Router();
const {
    escalateToCities,
    escalateToState,
    escalateToStates,
    escalateToCentral
} = require('../controllers/escalationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// City Admin escalation routes
router.post(
    '/:id/escalate-to-cities',
    protect,
    authorize('city_admin'),
    escalateToCities
);

router.post(
    '/:id/escalate-to-state',
    protect,
    authorize('city_admin'),
    escalateToState
);

// State Admin escalation routes
router.post(
    '/:id/escalate-to-states',
    protect,
    authorize('state_admin'),
    escalateToStates
);

// Both City and State Admin can escalate to central
router.post(
    '/:id/escalate-to-central',
    protect,
    authorize('city_admin', 'state_admin'),
    escalateToCentral
);

module.exports = router;
