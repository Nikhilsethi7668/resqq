const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Post = require('./models/Post');
const Alert = require('./models/Alert');
const News = require('./models/News');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const clearDatabase = async () => {
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Alert.deleteMany({});
    await News.deleteMany({});
    console.log('✅ Database cleared');
};

const createTestUsers = async () => {
    console.log('👥 Creating test users...');

    const testUsers = [
        // Regular Users
        {
            name: 'Test User Mumbai',
            email: 'user1@test.com',
            password: 'password123',
            phone: '+919876543210',
            role: 'user',
            city: 'Mumbai',
            state: 'Maharashtra',
            aadhar: '1234-5678-9012'
        },
        {
            name: 'Test User Delhi',
            email: 'user2@test.com',
            password: 'password123',
            phone: '+919876543211',
            role: 'user',
            city: 'Delhi',
            state: 'Delhi',
            aadhar: '1234-5678-9013'
        },
        {
            name: 'Test User Dehradun',
            email: 'user3@test.com',
            password: 'password123',
            phone: '+919876543212',
            role: 'user',
            city: 'Dehradun',
            state: 'Uttarakhand',
            aadhar: '1234-5678-9014'
        },
        {
            name: 'Test User Pune',
            email: 'user4@test.com',
            password: 'password123',
            phone: '+919876543213',
            role: 'user',
            city: 'Pune',
            state: 'Maharashtra',
            aadhar: '1234-5678-9015'
        },

        // City Admins
        {
            name: 'Mumbai City Admin',
            email: 'cityadmin.mumbai@test.com',
            password: 'admin123',
            phone: '+919876543220',
            role: 'city_admin',
            city: 'Mumbai',
            state: 'Maharashtra',
            aadhar: '2234-5678-9012'
        },
        {
            name: 'Delhi City Admin',
            email: 'cityadmin.delhi@test.com',
            password: 'admin123',
            phone: '+919876543221',
            role: 'city_admin',
            city: 'Delhi',
            state: 'Delhi',
            aadhar: '2234-5678-9013'
        },
        {
            name: 'Dehradun City Admin',
            email: 'cityadmin.dehradun@test.com',
            password: 'admin123',
            phone: '+919876543222',
            role: 'city_admin',
            city: 'Dehradun',
            state: 'Uttarakhand',
            aadhar: '2234-5678-9014'
        },

        // State Admins
        {
            name: 'Maharashtra State Admin',
            email: 'stateadmin.mh@test.com',
            password: 'admin123',
            phone: '+919876543230',
            role: 'state_admin',
            city: 'Mumbai',
            state: 'Maharashtra',
            aadhar: '3234-5678-9012'
        },
        {
            name: 'Uttarakhand State Admin',
            email: 'stateadmin.uk@test.com',
            password: 'admin123',
            phone: '+919876543231',
            role: 'state_admin',
            city: 'Dehradun',
            state: 'Uttarakhand',
            aadhar: '3234-5678-9013'
        },
        {
            name: 'Delhi State Admin',
            email: 'stateadmin.delhi@test.com',
            password: 'admin123',
            phone: '+919876543232',
            role: 'state_admin',
            city: 'Delhi',
            state: 'Delhi',
            aadhar: '3234-5678-9014'
        },

        // Central Admin
        {
            name: "Nikhil Sethi",
            email: "nikhilsethin494@gmail.com",
            password: "password123",
            role: "central_admin",
            city: "Delhi",
            state: "Delhi",
            phone: "+919876543299",
            aadhar: "9999-8888-7777"
        },
        {
            name: 'Central Admin',
            email: 'centraladmin@test.com',
            password: 'admin123',
            phone: '+919876543240',
            role: 'central_admin',
            city: 'New Delhi',
            state: 'Delhi',
            aadhar: '4234-5678-9012'
        },

        // News Admin
        {
            name: 'News Admin',
            email: 'newsadmin@test.com',
            password: 'admin123',
            phone: '+919876543250',
            role: 'news_admin',
            city: 'Mumbai',
            state: 'Maharashtra',
            aadhar: '5234-5678-9012'
        },

        // Responder
        {
            name: 'Responder Mumbai',
            email: 'responder1@test.com',
            password: 'responder123',
            phone: '+919876543260',
            role: 'user', // Using user role for now
            city: 'Mumbai',
            state: 'Maharashtra',
            aadhar: '6234-5678-9012'
        }
    ];

    // Use create instead of insertMany to trigger pre-save hooks
    const createdUsers = [];
    for (const userData of testUsers) {
        const user = await User.create(userData);
        createdUsers.push(user);
    }

    console.log(`✅ Created ${createdUsers.length} test users`);
    return createdUsers;
};

const createTestPosts = async (users) => {
    console.log('📝 Creating test SOS posts...');

    const regularUsers = users.filter(u => u.role === 'user');

    const testPosts = [
        // High danger posts
        {
            userId: regularUsers[0]._id,
            type: 'text',
            content: 'URGENT: Building collapsed! People trapped inside. Need immediate rescue. Multiple casualties suspected.',
            city: 'Mumbai',
            state: 'Maharashtra',
            status: 'pending',
            dangerLevel: 95,
            mlResponse: { danger_score: 95, tags: ['collapse', 'urgent', 'casualties'] }
        },
        {
            userId: regularUsers[1]._id,
            type: 'text',
            content: 'FIRE EMERGENCY: House on fire with children trapped inside. Flames spreading rapidly!',
            city: 'Delhi',
            state: 'Delhi',
            status: 'pending',
            dangerLevel: 90,
            mlResponse: { danger_score: 90, tags: ['fire', 'children', 'urgent'] }
        },
        {
            userId: regularUsers[2]._id,
            type: 'text',
            content: 'Severe flooding. Dead bodies floating. Water level rising. Entire village submerged.',
            city: 'Dehradun',
            state: 'Uttarakhand',
            status: 'pending',
            dangerLevel: 85,
            mlResponse: { danger_score: 85, tags: ['flood', 'casualties', 'urgent'] }
        },

        // Medium danger posts
        {
            userId: regularUsers[0]._id,
            type: 'text',
            content: 'Car accident on highway. Multiple vehicles involved. Injuries reported.',
            city: 'Mumbai',
            state: 'Maharashtra',
            status: 'investigating',
            dangerLevel: 60,
            mlResponse: { danger_score: 60, tags: ['accident', 'injury'] }
        },
        {
            userId: regularUsers[3]._id,
            type: 'text',
            content: 'Gas leak in residential area. Strong smell. People evacuating.',
            city: 'Pune',
            state: 'Maharashtra',
            status: 'investigating',
            dangerLevel: 70,
            mlResponse: { danger_score: 70, tags: ['gas_leak', 'evacuation'] }
        },

        // Low danger posts
        {
            userId: regularUsers[1]._id,
            type: 'text',
            content: 'Minor water logging on street. Traffic slow but moving.',
            city: 'Delhi',
            state: 'Delhi',
            status: 'help_sent',
            dangerLevel: 25,
            mlResponse: { danger_score: 25, tags: ['water_logging', 'low_priority'] },
            helpDetails: {
                situation: 'Municipal team dispatched for drainage clearance',
                timestamp: new Date()
            }
        },
        {
            userId: regularUsers[2]._id,
            type: 'text',
            content: 'Tree fell on road. No injuries. Road partially blocked.',
            city: 'Dehradun',
            state: 'Uttarakhand',
            status: 'completed',
            dangerLevel: 20,
            mlResponse: { danger_score: 20, tags: ['tree_fall', 'low_priority'] },
            helpDetails: {
                situation: 'Forest department removed the tree',
                timestamp: new Date(Date.now() - 3600000) // 1 hour ago
            },
            review: {
                rating: 5,
                comment: 'Quick response! Tree removed within an hour. Thank you!'
            }
        },

        // Ambiguous posts
        {
            userId: regularUsers[0]._id,
            type: 'text',
            content: 'Something happened near the market. Not sure what. Heard loud noise.',
            city: 'Mumbai',
            state: 'Maharashtra',
            status: 'pending',
            dangerLevel: 45,
            mlResponse: { danger_score: 45, tags: ['unclear', 'investigation_needed'] }
        },
        {
            userId: regularUsers[3]._id,
            type: 'text',
            content: 'Need help urgently',
            city: 'Pune',
            state: 'Maharashtra',
            status: 'pending',
            dangerLevel: 40,
            mlResponse: { danger_score: 40, tags: ['vague', 'unclear'] }
        },

        // Completed posts with reviews
        {
            userId: regularUsers[1]._id,
            type: 'text',
            content: 'Medical emergency. Person unconscious. Need ambulance immediately.',
            city: 'Delhi',
            state: 'Delhi',
            status: 'completed',
            dangerLevel: 80,
            mlResponse: { danger_score: 80, tags: ['medical', 'urgent'] },
            helpDetails: {
                situation: 'Ambulance dispatched. Patient taken to AIIMS.',
                timestamp: new Date(Date.now() - 7200000) // 2 hours ago
            },
            review: {
                rating: 5,
                comment: 'Ambulance arrived in 8 minutes. Life saved. Excellent service!'
            }
        }
    ];

    const createdPosts = await Post.insertMany(testPosts);
    console.log(`✅ Created ${createdPosts.length} test posts`);
    return createdPosts;
};

const createTestAlerts = async (posts) => {
    console.log('🚨 Creating test alerts...');

    const highDangerPosts = posts.filter(p => p.dangerLevel > 50 && p.status === 'pending');

    const testAlerts = highDangerPosts.map(post => ({
        postId: post._id,
        targetCity: post.city,
        targetState: post.state,
        targetRole: 'admin',
        isActive: true,
        acknowledgedBy: []
    }));

    const createdAlerts = await Alert.insertMany(testAlerts);
    console.log(`✅ Created ${createdAlerts.length} test alerts`);
    return createdAlerts;
};

const createTestNews = async (users) => {
    console.log('📰 Creating test news articles...');

    const newsAdmin = users.find(u => u.role === 'news_admin');

    const testNews = [
        {
            title: 'Flood Warning: Heavy Rainfall Expected in Uttarakhand',
            content: 'The meteorological department has issued a flood warning for Uttarakhand region. Heavy rainfall is expected over the next 48 hours. Residents are advised to stay alert and avoid low-lying areas.',
            authorId: newsAdmin._id,
            category: 'general'
        },
        {
            title: 'Successful Rescue Operation in Mumbai',
            content: 'Emergency responders successfully rescued 15 people trapped in a collapsed building in Mumbai. The operation lasted 6 hours. All rescued individuals are receiving medical care.',
            authorId: newsAdmin._id,
            category: 'success_story'
        },
        {
            title: 'Fire Safety Awareness Campaign Launched',
            content: 'The fire department has launched a city-wide fire safety awareness campaign. Free fire extinguisher training sessions will be conducted in all residential areas.',
            authorId: newsAdmin._id,
            category: 'general'
        }
    ];

    const createdNews = await News.insertMany(testNews);
    console.log(`✅ Created ${createdNews.length} test news articles`);
    return createdNews;
};

const printTestCredentials = (users) => {
    console.log('\n' + '='.repeat(80));
    console.log('🔑 TEST USER CREDENTIALS');
    console.log('='.repeat(80));

    const roles = ['user', 'city_admin', 'state_admin', 'central_admin', 'news_admin'];

    roles.forEach(role => {
        const roleUsers = users.filter(u => u.role === role);
        if (roleUsers.length > 0) {
            console.log(`\n${role.toUpperCase().replace('_', ' ')}:`);
            roleUsers.forEach(user => {
                console.log(`  📧 ${user.email} | 🔒 password123 (or admin123) | 📍 ${user.city}, ${user.state}`);
            });
        }
    });

    console.log('\n' + '='.repeat(80));
    console.log('💡 QUICK START:');
    console.log('   1. Backend: cd backend && npm run dev');
    console.log('   2. User Frontend: cd frontend/user && npm run dev');
    console.log('   3. Admin Frontend: cd frontend/admin && npm run dev');
    console.log('   4. Login with any credentials above');
    console.log('='.repeat(80) + '\n');
};

const seedDatabase = async () => {
    try {
        await connectDB();
        await clearDatabase();

        const users = await createTestUsers();
        const posts = await createTestPosts(users);
        const alerts = await createTestAlerts(posts);
        await createTestNews(users);

        printTestCredentials(users);

        console.log('\n✅ DATABASE SEEDING COMPLETE!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

seedDatabase();
