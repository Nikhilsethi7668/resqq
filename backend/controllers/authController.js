const User = require('../models/User');
const jwt = require('jsonwebtoken');

const config = require('../config/production');

const generateToken = (id) => {
    return jwt.sign({ id }, config.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, phone, city, state, aadhar } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // SECURITY: Public registration only creates 'user' accounts
    // Admins must be created by authorized admins via /api/admin/users/create
    const user = await User.create({
        name,
        email,
        password,
        phone,
        city,
        state,
        aadhar,
        role: 'user' // Force user role for public registration
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            city: user.city,
            state: user.state,
            token: generateToken(user._id)
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account has been deactivated. Please contact administrator.' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            city: user.city,
            state: user.state,
            token: generateToken(user._id)
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            city: user.city,
            state: user.state
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = { registerUser, loginUser, getMe };
