const express = require('express');
const router = express.Router();
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5002';

// @desc    Get ML service health status
// @route   GET /api/ml/health
// @access  Public
router.get('/health', async (req, res) => {
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/health`);
        res.json(response.data);
    } catch (err) {
        res.status(503).json({
            message: 'ML service unavailable',
            error: err.message
        });
    }
});

// @desc    Get prediction statistics
// @route   GET /api/ml/stats
// @access  Private (Admin)
router.get('/stats', async (req, res) => {
    try {
        const days = req.query.days || 7;
        const response = await axios.get(`${ML_SERVICE_URL}/stats?days=${days}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to fetch statistics',
            error: err.message
        });
    }
});

// @desc    Get recent predictions
// @route   GET /api/ml/recent
// @access  Private (Admin)
router.get('/recent', async (req, res) => {
    try {
        const limit = req.query.limit || 50;
        const response = await axios.get(`${ML_SERVICE_URL}/recent?limit=${limit}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to fetch recent predictions',
            error: err.message
        });
    }
});

// @desc    Get hourly statistics
// @route   GET /api/ml/hourly
// @access  Private (Admin)
router.get('/hourly', async (req, res) => {
    try {
        const hours = req.query.hours || 24;
        const response = await axios.get(`${ML_SERVICE_URL}/hourly?hours=${hours}`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to fetch hourly statistics',
            error: err.message
        });
    }
});

module.exports = router;
