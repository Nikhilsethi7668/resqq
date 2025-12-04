// Fix central admin isActive status
const mongoose = require('mongoose');
require('dotenv').config();

async function fixCentralAdmin() {
    try {
        console.log('🔧 Fixing Central Admin Account...\n');

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        // Update the central admin account
        const result = await User.updateOne(
            { email: 'nikhilsethin494@gmail.com' },
            {
                $set: {
                    isActive: true,
                    role: 'central_admin'  // Ensure role is correct too
                }
            }
        );

        if (result.modifiedCount > 0) {
            console.log('✅ Central admin account updated!');

            // Verify the fix
            const admin = await User.findOne({ email: 'nikhilsethin494@gmail.com' });
            console.log('\n📋 Updated Account Details:');
            console.log(`   Email: ${admin.email}`);
            console.log(`   Role: ${admin.role}`);
            console.log(`   isActive: ${admin.isActive}`);
            console.log(`   Name: ${admin.name}`);

            console.log('\n✅ FIXED! You can now:');
            console.log('   1. Login to admin dashboard');
            console.log('   2. Receive email alerts');
            console.log('   3. See red blinking alerts');
        } else {
            console.log('⚠️  No changes made (account might already be correct)');
        }

        await mongoose.disconnect();
        console.log('\n✅ Done!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
    process.exit(0);
}

fixCentralAdmin();
