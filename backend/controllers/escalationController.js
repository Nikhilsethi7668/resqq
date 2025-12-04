const Alert = require('../models/Alert');
const User = require('../models/User');
const Post = require('../models/Post');
const { sendAlertEmail, createAlertEmailHTML } = require('../services/emailService');
const { getCitiesByState, validateState, validateCity } = require('../services/locationService');

// @desc    Escalate alert to all cities in state (City Admin)
// @route   POST /api/admin/alerts/:id/escalate-to-cities
// @access  Private (City Admin)
const escalateToCities = async (req, res) => {
    try {
        const { reason } = req.body;
        const alert = await Alert.findById(req.params.id).populate('postId');

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        // Verify user is city admin
        if (req.user.role !== 'city_admin') {
            return res.status(403).json({ message: 'Only city admins can use this feature' });
        }

        // Get all cities in the state
        const cities = getCitiesByState(req.user.state);

        // Remove current city from list
        const otherCities = cities.filter(city => city.toLowerCase() !== req.user.city.toLowerCase());

        if (otherCities.length === 0) {
            return res.status(400).json({ message: 'No other cities found in your state' });
        }

        // Find all city admins in these cities
        const cityAdmins = await User.find({
            role: 'city_admin',
            state: req.user.state,
            city: { $in: otherCities }
        });

        if (cityAdmins.length === 0) {
            return res.status(400).json({ message: 'No city admins found in other cities' });
        }

        // Create alerts for each city
        const newAlerts = [];
        for (const admin of cityAdmins) {
            const newAlert = await Alert.create({
                postId: alert.postId._id,
                targetRole: 'city_admin',
                targetCity: admin.city,
                targetState: admin.state,
                escalationLevel: 1,
                helpRequested: true
            });
            newAlerts.push(newAlert);
        }

        // Update original alert with escalation history
        alert.helpRequested = true;
        alert.escalationLevel = Math.max(alert.escalationLevel, 1);
        alert.escalationHistory.push({
            level: 'peer_cities',
            requestedBy: req.user._id,
            requestedAt: new Date(),
            targetRegions: otherCities,
            reason: reason || 'Requesting assistance from neighboring cities',
            notifiedAdmins: cityAdmins.map(a => a._id)
        });
        await alert.save();

        // Send email notifications
        const emailHTML = createAlertEmailHTML({
            city: alert.postId.city,
            state: alert.postId.state,
            dangerLevel: alert.postId.dangerLevel,
            postId: alert.postId._id,
            content: alert.postId.content,
            type: alert.postId.type,
            timestamp: new Date().toLocaleString(),
            escalationInfo: {
                from: `${req.user.city} City Admin`,
                reason: reason || 'Requesting assistance from neighboring cities'
            }
        });

        const adminEmails = cityAdmins.map(a => a.email);
        await sendAlertEmail(
            adminEmails,
            `🚨 HELP REQUEST: Emergency in ${alert.postId.city}, ${alert.postId.state}`,
            emailHTML
        );

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            otherCities.forEach(city => {
                io.to(`city_${city}`).emit('help_request', {
                    alert: newAlerts.find(a => a.targetCity === city),
                    post: alert.postId,
                    from: req.user.city,
                    reason
                });
            });
        }

        res.json({
            message: `Help request sent to ${cityAdmins.length} city admins in ${otherCities.length} cities`,
            notifiedCities: otherCities,
            notifiedAdmins: cityAdmins.length
        });

    } catch (err) {
        console.error('Error escalating to cities:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Escalate alert to state admin (City Admin)
// @route   POST /api/admin/alerts/:id/escalate-to-state
// @access  Private (City Admin)
const escalateToState = async (req, res) => {
    try {
        const { reason } = req.body;
        const alert = await Alert.findById(req.params.id).populate('postId');

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        // Verify user is city admin
        if (req.user.role !== 'city_admin') {
            return res.status(403).json({ message: 'Only city admins can use this feature' });
        }

        // Find state admins for this state
        const stateAdmins = await User.find({
            role: 'state_admin',
            state: req.user.state
        });

        if (stateAdmins.length === 0) {
            return res.status(400).json({ message: 'No state admin found for your state' });
        }

        // Create alert for state admin
        const newAlert = await Alert.create({
            postId: alert.postId._id,
            targetRole: 'state_admin',
            targetState: req.user.state,
            escalationLevel: 2,
            helpRequested: true
        });

        // Update original alert
        alert.helpRequested = true;
        alert.escalationLevel = Math.max(alert.escalationLevel, 2);
        alert.escalationHistory.push({
            level: 'state',
            requestedBy: req.user._id,
            requestedAt: new Date(),
            targetRegions: [req.user.state],
            reason: reason || 'Escalating to state level',
            notifiedAdmins: stateAdmins.map(a => a._id)
        });
        await alert.save();

        // Send email notifications
        const emailHTML = createAlertEmailHTML({
            city: alert.postId.city,
            state: alert.postId.state,
            dangerLevel: alert.postId.dangerLevel,
            postId: alert.postId._id,
            content: alert.postId.content,
            type: alert.postId.type,
            timestamp: new Date().toLocaleString(),
            escalationInfo: {
                from: `${req.user.city} City Admin`,
                level: 'State Level',
                reason: reason || 'Escalating to state level'
            }
        });

        const adminEmails = stateAdmins.map(a => a.email);
        await sendAlertEmail(
            adminEmails,
            `🚨 STATE ESCALATION: Emergency in ${alert.postId.city}, ${alert.postId.state}`,
            emailHTML
        );

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(`state_${req.user.state}`).emit('help_request', {
                alert: newAlert,
                post: alert.postId,
                from: req.user.city,
                level: 'state',
                reason
            });
        }

        res.json({
            message: `Help request escalated to ${stateAdmins.length} state admin(s)`,
            notifiedAdmins: stateAdmins.length
        });

    } catch (err) {
        console.error('Error escalating to state:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Escalate alert to other states (State Admin)
// @route   POST /api/admin/alerts/:id/escalate-to-states
// @access  Private (State Admin)
const escalateToStates = async (req, res) => {
    try {
        const { states, reason } = req.body;

        if (!states || !Array.isArray(states) || states.length === 0) {
            return res.status(400).json({ message: 'Please provide at least one state' });
        }

        const alert = await Alert.findById(req.params.id).populate('postId');

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        // Verify user is state admin
        if (req.user.role !== 'state_admin') {
            return res.status(403).json({ message: 'Only state admins can use this feature' });
        }

        // Validate all state names
        for (const stateName of states) {
            if (!validateState(stateName)) {
                return res.status(400).json({ message: `Invalid state name: ${stateName}` });
            }
        }

        // Find state admins for requested states
        const stateAdmins = await User.find({
            role: 'state_admin',
            state: { $in: states }
        });

        if (stateAdmins.length === 0) {
            return res.status(400).json({ message: 'No state admins found for the selected states' });
        }

        // Create alerts for each state
        const newAlerts = [];
        for (const stateName of states) {
            const newAlert = await Alert.create({
                postId: alert.postId._id,
                targetRole: 'state_admin',
                targetState: stateName,
                escalationLevel: 2,
                helpRequested: true
            });
            newAlerts.push(newAlert);
        }

        // Update original alert
        alert.helpRequested = true;
        alert.escalationLevel = Math.max(alert.escalationLevel, 2);
        alert.escalationHistory.push({
            level: 'peer_states',
            requestedBy: req.user._id,
            requestedAt: new Date(),
            targetRegions: states,
            reason: reason || 'Requesting assistance from other states',
            notifiedAdmins: stateAdmins.map(a => a._id)
        });
        await alert.save();

        // Send email notifications
        const emailHTML = createAlertEmailHTML({
            city: alert.postId.city,
            state: alert.postId.state,
            dangerLevel: alert.postId.dangerLevel,
            postId: alert.postId._id,
            content: alert.postId.content,
            type: alert.postId.type,
            timestamp: new Date().toLocaleString(),
            escalationInfo: {
                from: `${req.user.state} State Admin`,
                level: 'Inter-State Cooperation',
                reason: reason || 'Requesting assistance from other states'
            }
        });

        const adminEmails = stateAdmins.map(a => a.email);
        await sendAlertEmail(
            adminEmails,
            `🚨 INTER-STATE HELP REQUEST: Emergency in ${alert.postId.state}`,
            emailHTML
        );

        // Emit socket events
        const io = req.app.get('io');
        if (io) {
            states.forEach(stateName => {
                io.to(`state_${stateName}`).emit('help_request', {
                    alert: newAlerts.find(a => a.targetState === stateName),
                    post: alert.postId,
                    from: req.user.state,
                    level: 'inter_state',
                    reason
                });
            });
        }

        res.json({
            message: `Help request sent to ${stateAdmins.length} state admin(s) in ${states.length} state(s)`,
            notifiedStates: states,
            notifiedAdmins: stateAdmins.length
        });

    } catch (err) {
        console.error('Error escalating to states:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Escalate alert to central admin (City/State Admin)
// @route   POST /api/admin/alerts/:id/escalate-to-central
// @access  Private (City Admin, State Admin)
const escalateToCentral = async (req, res) => {
    try {
        const { reason } = req.body;
        const alert = await Alert.findById(req.params.id).populate('postId');

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        // Verify user is city or state admin
        if (!['city_admin', 'state_admin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Only city or state admins can use this feature' });
        }

        // Find central admins
        const centralAdmins = await User.find({
            role: 'central_admin'
        });

        if (centralAdmins.length === 0) {
            return res.status(400).json({ message: 'No central admin found' });
        }

        // Create alert for central admin
        const newAlert = await Alert.create({
            postId: alert.postId._id,
            targetRole: 'central_admin',
            escalationLevel: 3,
            helpRequested: true
        });

        // Update original alert
        alert.helpRequested = true;
        alert.escalationLevel = 3;
        alert.escalationHistory.push({
            level: 'central',
            requestedBy: req.user._id,
            requestedAt: new Date(),
            targetRegions: ['National'],
            reason: reason || 'Escalating to central/national level',
            notifiedAdmins: centralAdmins.map(a => a._id)
        });
        await alert.save();

        // Send email notifications
        const emailHTML = createAlertEmailHTML({
            city: alert.postId.city,
            state: alert.postId.state,
            dangerLevel: alert.postId.dangerLevel,
            postId: alert.postId._id,
            content: alert.postId.content,
            type: alert.postId.type,
            timestamp: new Date().toLocaleString(),
            escalationInfo: {
                from: `${req.user.role === 'city_admin' ? req.user.city : req.user.state} ${req.user.role === 'city_admin' ? 'City' : 'State'} Admin`,
                level: 'NATIONAL/CENTRAL LEVEL',
                reason: reason || 'Escalating to central/national level'
            }
        });

        const adminEmails = centralAdmins.map(a => a.email);
        await sendAlertEmail(
            adminEmails,
            `🚨 NATIONAL ESCALATION: Critical Emergency in ${alert.postId.city}, ${alert.postId.state}`,
            emailHTML
        );

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to('central_admin').emit('help_request', {
                alert: newAlert,
                post: alert.postId,
                from: req.user.role === 'city_admin' ? req.user.city : req.user.state,
                level: 'central',
                reason
            });
        }

        res.json({
            message: `Help request escalated to ${centralAdmins.length} central admin(s)`,
            notifiedAdmins: centralAdmins.length
        });

    } catch (err) {
        console.error('Error escalating to central:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    escalateToCities,
    escalateToState,
    escalateToStates,
    escalateToCentral
};
