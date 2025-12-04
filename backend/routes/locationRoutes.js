const express = require('express');
const router = express.Router();
const {
    getAllStates,
    getCitiesByState,
    searchStates,
    searchCities,
    validateState,
    validateCity
} = require('../services/locationService');

// @desc    Get all states
// @route   GET /api/locations/states
// @access  Public
router.get('/states', (req, res) => {
    try {
        const { search } = req.query;

        if (search) {
            const results = searchStates(search);
            return res.json(results);
        }

        const states = getAllStates();
        res.json(states);
    } catch (err) {
        console.error('Error fetching states:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get cities by state
// @route   GET /api/locations/cities
// @access  Public
router.get('/cities', (req, res) => {
    try {
        const { state, search } = req.query;

        if (search) {
            const results = searchCities(search, state);
            return res.json(results);
        }

        if (!state) {
            return res.status(400).json({ message: 'State parameter is required' });
        }

        const cities = getCitiesByState(state);
        res.json(cities);
    } catch (err) {
        console.error('Error fetching cities:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Validate location
// @route   POST /api/locations/validate
// @access  Public
router.post('/validate', (req, res) => {
    try {
        const { state, city } = req.body;

        const result = {
            valid: true,
            errors: []
        };

        if (state && !validateState(state)) {
            result.valid = false;
            result.errors.push(`Invalid state: ${state}`);
        }

        if (city) {
            if (!validateCity(city, state)) {
                result.valid = false;
                result.errors.push(`Invalid city: ${city}${state ? ` in ${state}` : ''}`);
            }
        }

        res.json(result);
    } catch (err) {
        console.error('Error validating location:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
