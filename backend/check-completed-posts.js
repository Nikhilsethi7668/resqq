// Script to check and create sample completed posts for testing
const mongoose = require('mongoose');
require('dotenv').config();

async function checkAndCreateCompletedPosts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }));

        // Check for completed posts
        const completedCount = await Post.countDocuments({ status: 'completed' });
        console.log(`📊 Found ${completedCount} completed posts\n`);

        if (completedCount === 0) {
            console.log('⚠️  No completed posts found!');
            console.log('   This is why the News Admin Dashboard shows no data.\n');

            // Check how many posts exist overall
            const totalPosts = await Post.countDocuments({});
            const pendingPosts = await Post.countDocuments({ status: 'pending' });
            const activePosts = await Post.countDocuments({ status: 'active' });

            console.log(`📈 Post Statistics:`);
            console.log(`   Total Posts: ${totalPosts}`);
            console.log(`   Pending: ${pendingPosts}`);
            console.log(`   Active: ${activePosts}`);
            console.log(`   Completed: ${completedCount}\n`);

            if (pendingPosts > 0 || activePosts > 0) {
                console.log('💡 To test the News Admin Dashboard:');
                console.log('   1. Login to admin panel');
                console.log('   2. Go to main dashboard to view alerts');
                console.log('   3. Change status of some posts from "pending" or "active" to "completed"');
                console.log('   4. Then those completed posts will appear in News Admin Dashboard\n');

                // Optionally auto-convert some posts to completed for testing
                console.log('Would you like me to auto-convert some posts to "completed" for testing? (Y/N)');
                console.log('(For now, manually mark some posts as completed from admin dashboard)\n');
            } else {
                console.log('❌ No posts exist at all in the database!');
                console.log('\n💡 To create test data:');
                console.log('   1. Go to user frontend (http://localhost:5174)');
                console.log('   2. Register/login as a user');
                console.log('   3. Create some SOS reports');
                console.log('   4. Go to admin panel and mark them as "completed"');
                console.log('   5. Then they will appear in News Admin Dashboard\n');
            }
        } else {
            console.log('✅ Completed posts exist! They should appear in News Admin Dashboard.');

            // Show sample completed posts
            const samples = await Post.find({ status: 'completed' }).limit(3);
            console.log('\n📋 Sample Completed Posts:');
            samples.forEach((post, i) => {
                console.log(`\n   ${i + 1}. ${post.city}, ${post.state}`);
                console.log(`      Danger Level: ${post.dangerLevel}`);
                console.log(`      Created: ${post.createdAt}`);
                console.log(`      Content: ${post.content.substring(0, 60)}...`);
            });
        }

        await mongoose.disconnect();
        console.log('\n✅ Done!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

checkAndCreateCompletedPosts();
