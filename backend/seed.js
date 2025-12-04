const mongoose = require('mongoose');
const dotenv = require('dotenv');
const News = require('./models/News');
const User = require('./models/User');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find an admin user to be the author
        let admin = await User.findOne({ role: 'central_admin' });
        if (!admin) {
            console.log('No central admin found. Creating one...');
            // Create a dummy admin if none exists (password hashing omitted for simplicity in seed, 
            // but in real app we'd use the auth controller logic or manually hash)
            // For now, let's assume the user creates one via UI or we skip author validation if strict
            // Actually, let's just create a dummy ID if we can't find one, or fail.
            // Better: Create a mock admin if needed.
            admin = await User.create({
                name: 'System Admin',
                email: 'admin@resqq.com',
                password: 'password123',
                phone: '0000000000',
                role: 'central_admin',
                city: 'Delhi',
                state: 'Delhi',
                aadhar: '000000000000'
            });
        }

        const newsData = [
            {
                title: 'City-wide Safety Drill Scheduled',
                content: 'The annual safety drill will take place this Sunday at 10 AM. All citizens are advised to participate.',
                category: 'general',
                authorId: admin._id
            },
            {
                title: 'New Emergency Response Vehicles Deployed',
                content: 'We have added 50 new ambulances to the fleet to reduce response time in critical zones.',
                category: 'general',
                authorId: admin._id
            },
            {
                title: 'ResQ Connect Saves Family from Fire',
                content: 'Thanks to a quick SOS report via ResQ Connect, fire fighters arrived within 5 minutes and saved a family of four in Mumbai. The alert was routed instantly to the nearest station.',
                category: 'success_story',
                image: 'https://images.unsplash.com/photo-1599233066973-7c93627e9e48?auto=format&fit=crop&w=800',
                authorId: admin._id
            },
            {
                title: 'Lost Hiker Found using Geolocation',
                content: 'A hiker lost in the Western Ghats was located using the precise location tracking of the ResQ app. The rescue team was dispatched immediately and found the hiker within 2 hours.',
                category: 'success_story',
                image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800',
                authorId: admin._id
            }
        ];

        await News.deleteMany({}); // Clear existing news
        await News.insertMany(newsData);

        console.log('Data Seeded Successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
