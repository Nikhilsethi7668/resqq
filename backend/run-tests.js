#!/usr/bin/env node

/**
 * ResQQ Automated E2E Testing Script
 * 
 * This script automates testing of the ResQQ emergency response system.
 * It tests authentication, SOS creation, admin workflows, security, and performance.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001/api';
const FRONTEND_USER_URL = 'http://localhost:5174';
const FRONTEND_ADMIN_URL = 'http://localhost:5173';

// Test results storage
const testResults = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
};

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Helper function to log test results
function logTest(name, status, message = '') {
    const statusSymbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
    const color = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.yellow;

    console.log(`${statusSymbol} ${color}${name}${colors.reset} ${message ? '- ' + message : ''}`);

    testResults.tests.push({ name, status, message });
    if (status === 'PASS') testResults.passed++;
    else if (status === 'FAIL') testResults.failed++;
    else testResults.skipped++;
}

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {}
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            status: error.response?.status
        };
    }
}

// Test user credentials
const testUsers = {
    user1: { email: 'user1@test.com', password: 'password123' },
    user2: { email: 'user2@test.com', password: 'password123' },
    cityAdmin: { email: 'cityadmin.mumbai@test.com', password: 'admin123' },
    stateAdmin: { email: 'stateadmin.mh@test.com', password: 'admin123' },
    centralAdmin: { email: 'centraladmin@test.com', password: 'admin123' }
};

let tokens = {};

// ============================================================================
// AUTHENTICATION TESTS
// ============================================================================

async function testAuthentication() {
    console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.cyan}2️⃣  USER AUTHENTICATION TESTS${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);

    // Test 2.3: Login with valid credentials
    for (const [key, user] of Object.entries(testUsers)) {
        const result = await apiRequest('POST', '/auth/login', user);
        if (result.success && result.data.token) {
            tokens[key] = result.data.token;
            logTest(`Login as ${key}`, 'PASS', `Token received`);
        } else {
            logTest(`Login as ${key}`, 'FAIL', result.error);
        }
    }

    // Test 2.4: Login with invalid credentials
    const invalidLogin = await apiRequest('POST', '/auth/login', {
        email: 'wrong@test.com',
        password: 'wrongpassword'
    });
    if (!invalidLogin.success && invalidLogin.status === 401) {
        logTest('Login with invalid credentials', 'PASS', 'Correctly rejected');
    } else {
        logTest('Login with invalid credentials', 'FAIL', 'Should have been rejected');
    }

    // Test 2.6: Token persistence (verify token works)
    const meResult = await apiRequest('GET', '/auth/me', null, tokens.user1);
    if (meResult.success && meResult.data.email === testUsers.user1.email) {
        logTest('Token verification', 'PASS', 'User data retrieved');
    } else {
        logTest('Token verification', 'FAIL', meResult.error);
    }

    // Test 2.7: Role-based route protection
    const adminOnlyResult = await apiRequest('GET', '/admin/alerts', null, tokens.user1);
    if (!adminOnlyResult.success && adminOnlyResult.status === 403) {
        logTest('Role-based access control', 'PASS', 'User blocked from admin route');
    } else {
        logTest('Role-based access control', 'FAIL', 'User should not access admin routes');
    }
}

// ============================================================================
// SOS POSTING TESTS
// ============================================================================

async function testSOSPosting() {
    console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.cyan}3️⃣  SOS POSTING TESTS${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);

    // Test 3.1: Text-only SOS
    const textSOS = await apiRequest('POST', '/posts', {
        type: 'text',
        textContent: 'Building collapse, people trapped - TEST POST',
        city: 'Mumbai',
        state: 'Maharashtra'
    }, tokens.user1);

    if (textSOS.success && textSOS.data._id) {
        logTest('Create text-only SOS', 'PASS', `Post ID: ${textSOS.data._id}`);
    } else {
        logTest('Create text-only SOS', 'FAIL', textSOS.error);
    }

    // Test 3.7: Manual location selection
    const manualLocationSOS = await apiRequest('POST', '/posts', {
        type: 'text',
        textContent: 'Manual location test',
        city: 'Delhi',
        state: 'Delhi'
    }, tokens.user2);

    if (manualLocationSOS.success) {
        logTest('Manual location selection', 'PASS', 'City and state saved');
    } else {
        logTest('Manual location selection', 'FAIL', manualLocationSOS.error);
    }
}

// ============================================================================
// ML DANGER SCORING TESTS
// ============================================================================

async function testMLScoring() {
    console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.cyan}4️⃣  ML DANGER SCORING TESTS${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);

    const testCases = [
        {
            name: 'High-risk text',
            content: 'People trapped in collapsed building, urgent help needed, dead bodies seen',
            expectedRange: [70, 100]
        },
        {
            name: 'Low-risk text',
            content: 'Minor water logging on street, no injuries',
            expectedRange: [0, 40]
        },
        {
            name: 'Ambiguous text',
            content: 'Something happened, not sure what',
            expectedRange: [30, 60]
        }
    ];

    for (const testCase of testCases) {
        const result = await apiRequest('POST', '/posts', {
            type: 'text',
            textContent: testCase.content,
            city: 'Mumbai',
            state: 'Maharashtra'
        }, tokens.user1);

        if (result.success && result.data.dangerLevel !== undefined) {
            const score = result.data.dangerLevel;
            const inRange = score >= testCase.expectedRange[0] && score <= testCase.expectedRange[1];

            if (inRange) {
                logTest(`ML Scoring: ${testCase.name}`, 'PASS', `Score: ${score}`);
            } else {
                logTest(`ML Scoring: ${testCase.name}`, 'FAIL',
                    `Score ${score} not in expected range [${testCase.expectedRange[0]}-${testCase.expectedRange[1]}]`);
            }
        } else {
            logTest(`ML Scoring: ${testCase.name}`, 'FAIL', result.error);
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// ============================================================================
// ADMIN DASHBOARD TESTS
// ============================================================================

async function testAdminDashboard() {
    console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.cyan}7️⃣  ADMIN DASHBOARD TESTS${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);

    // Test 7.1: View incoming posts list
    const alertsResult = await apiRequest('GET', '/admin/alerts', null, tokens.cityAdmin);
    if (alertsResult.success && Array.isArray(alertsResult.data)) {
        logTest('View admin alerts list', 'PASS', `${alertsResult.data.length} alerts found`);
    } else {
        logTest('View admin alerts list', 'FAIL', alertsResult.error);
    }

    // Test 7.4: Mark as verified (investigating)
    // First, create a high-danger post
    const highDangerPost = await apiRequest('POST', '/posts', {
        type: 'text',
        textContent: 'URGENT: Fire emergency, people trapped - TEST',
        city: 'Mumbai',
        state: 'Maharashtra'
    }, tokens.user1);

    if (highDangerPost.success) {
        // Wait a moment for ML scoring
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update status
        const updateResult = await apiRequest('POST', `/admin/posts/${highDangerPost.data._id}/status`, {
            status: 'investigating'
        }, tokens.cityAdmin);

        if (updateResult.success && updateResult.data.status === 'investigating') {
            logTest('Mark post as investigating', 'PASS', 'Status updated');
        } else {
            logTest('Mark post as investigating', 'FAIL', updateResult.error);
        }

        // Test 7.6: Mark "help_sent"
        const helpSentResult = await apiRequest('POST', `/admin/posts/${highDangerPost.data._id}/status`, {
            status: 'help_sent',
            helpDetails: { situation: 'Fire brigade dispatched' }
        }, tokens.cityAdmin);

        if (helpSentResult.success && helpSentResult.data.status === 'help_sent') {
            logTest('Mark post as help_sent', 'PASS', 'Help details saved');
        } else {
            logTest('Mark post as help_sent', 'FAIL', helpSentResult.error);
        }

        // Test 7.7: Mark resolved (only central admin can do this)
        const resolvedResult = await apiRequest('POST', `/admin/posts/${highDangerPost.data._id}/status`, {
            status: 'completed'
        }, tokens.centralAdmin);

        if (resolvedResult.success && resolvedResult.data.status === 'completed') {
            logTest('Mark post as completed', 'PASS', 'Post resolved');
        } else {
            logTest('Mark post as completed', 'FAIL', resolvedResult.error);
        }
    }
}

// ============================================================================
// SECURITY TESTS
// ============================================================================

async function testSecurity() {
    console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.cyan}🛡️  SECURITY TESTS${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);

    // Test 11.1: SQL Injection attempts
    const sqlInjectionLogin = await apiRequest('POST', '/auth/login', {
        email: "admin' OR '1'='1",
        password: "password"
    });
    if (!sqlInjectionLogin.success) {
        logTest('SQL Injection protection (login)', 'PASS', 'Attack blocked');
    } else {
        logTest('SQL Injection protection (login)', 'FAIL', 'Vulnerable to SQL injection');
    }

    // Test 11.2: XSS via post descriptions
    const xssPost = await apiRequest('POST', '/posts', {
        type: 'text',
        textContent: '<script>alert("XSS")</script>',
        city: 'Mumbai',
        state: 'Maharashtra'
    }, tokens.user1);

    if (xssPost.success) {
        // Check if script tags are escaped
        if (!xssPost.data.content.includes('<script>')) {
            logTest('XSS protection', 'PASS', 'Script tags escaped');
        } else {
            logTest('XSS protection', 'FAIL', 'Script tags not escaped');
        }
    } else {
        logTest('XSS protection', 'SKIP', 'Could not create post');
    }

    // Test 11.6: Unauthorized route access
    const unauthorizedAccess = await apiRequest('GET', '/admin/alerts', null, null);
    if (!unauthorizedAccess.success && unauthorizedAccess.status === 401) {
        logTest('Unauthorized route access protection', 'PASS', 'Access denied without token');
    } else {
        logTest('Unauthorized route access protection', 'FAIL', 'Should require authentication');
    }
}

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

async function testPerformance() {
    console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.cyan}⚙️  PERFORMANCE TESTS${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);

    // Test 12.1: 20 concurrent SOS posts
    console.log('Creating 20 concurrent SOS posts...');
    const startTime = Date.now();

    const promises = [];
    for (let i = 0; i < 20; i++) {
        promises.push(
            apiRequest('POST', '/posts', {
                type: 'text',
                textContent: `Performance test post ${i + 1}`,
                city: 'Mumbai',
                state: 'Maharashtra'
            }, tokens.user1)
        );
    }

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    const successCount = results.filter(r => r.success).length;
    const avgTime = duration / 20;

    if (successCount === 20 && avgTime < 3) {
        logTest('20 concurrent SOS posts', 'PASS',
            `All posts created in ${duration.toFixed(2)}s (avg ${avgTime.toFixed(2)}s per post)`);
    } else if (successCount === 20) {
        logTest('20 concurrent SOS posts', 'FAIL',
            `Posts created but too slow: ${duration.toFixed(2)}s (avg ${avgTime.toFixed(2)}s per post)`);
    } else {
        logTest('20 concurrent SOS posts', 'FAIL',
            `Only ${successCount}/20 posts created`);
    }
}

// ============================================================================
// LOCATION-BASED ROUTING TESTS
// ============================================================================

async function testLocationRouting() {
    console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.cyan}6️⃣  LOCATION-BASED ROUTING TESTS${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);

    // Test 6.4: Admin sees only assigned region posts
    const cityAdminAlerts = await apiRequest('GET', '/admin/alerts', null, tokens.cityAdmin);

    if (cityAdminAlerts.success) {
        // Check if all alerts are for Mumbai
        const allMumbai = cityAdminAlerts.data.every(alert =>
            alert.targetCity === 'Mumbai' || alert.postId?.city === 'Mumbai'
        );

        if (allMumbai || cityAdminAlerts.data.length === 0) {
            logTest('City admin sees only assigned city posts', 'PASS',
                `${cityAdminAlerts.data.length} Mumbai alerts`);
        } else {
            logTest('City admin sees only assigned city posts', 'FAIL',
                'City admin seeing posts from other cities');
        }
    } else {
        logTest('City admin sees only assigned city posts', 'FAIL', cityAdminAlerts.error);
    }

    // Test 6.5: Central admin sees all posts
    const centralAdminAlerts = await apiRequest('GET', '/admin/alerts', null, tokens.centralAdmin);

    if (centralAdminAlerts.success) {
        logTest('Central admin sees all posts', 'PASS',
            `${centralAdminAlerts.data.length} total alerts visible`);
    } else {
        logTest('Central admin sees all posts', 'FAIL', centralAdminAlerts.error);
    }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
    console.log(`\n${colors.blue}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.blue}🧪 ResQQ Automated E2E Testing Suite${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(80)}${colors.reset}\n`);

    console.log(`${colors.yellow}⚠️  Prerequisites:${colors.reset}`);
    console.log(`   - Backend running on http://localhost:5001`);
    console.log(`   - Database seeded with test data (run: node seed-test-data.js)`);
    console.log(`   - User frontend running on http://localhost:5174`);
    console.log(`   - Admin frontend running on http://localhost:5173\n`);

    try {
        await testAuthentication();
        await testSOSPosting();
        await testMLScoring();
        await testLocationRouting();
        await testAdminDashboard();
        await testSecurity();
        await testPerformance();

        // Print summary
        console.log(`\n${colors.blue}${'='.repeat(80)}${colors.reset}`);
        console.log(`${colors.blue}📊 TEST SUMMARY${colors.reset}`);
        console.log(`${colors.blue}${'='.repeat(80)}${colors.reset}\n`);

        console.log(`${colors.green}✅ Passed: ${testResults.passed}${colors.reset}`);
        console.log(`${colors.red}❌ Failed: ${testResults.failed}${colors.reset}`);
        console.log(`${colors.yellow}⏭️  Skipped: ${testResults.skipped}${colors.reset}`);
        console.log(`${colors.cyan}📝 Total: ${testResults.tests.length}${colors.reset}\n`);

        const passRate = ((testResults.passed / testResults.tests.length) * 100).toFixed(2);
        console.log(`${colors.cyan}Pass Rate: ${passRate}%${colors.reset}\n`);

        // Save detailed report
        const reportPath = path.join(__dirname, 'test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
        console.log(`${colors.green}✅ Detailed report saved to: ${reportPath}${colors.reset}\n`);

        // Exit with appropriate code
        process.exit(testResults.failed > 0 ? 1 : 0);

    } catch (error) {
        console.error(`\n${colors.red}❌ Fatal error during testing:${colors.reset}`, error.message);
        process.exit(1);
    }
}

// Run tests
runAllTests();
