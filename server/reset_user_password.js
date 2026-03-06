const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const resetPassword = async (email, newPassword) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User ${email} not found`);
            mongoose.connection.close();
            return;
        }

        console.log(`User found: ${user.name}`);
        user.password = newPassword;
        await user.save();
        console.log('Password updated successfully');

        // Verify match
        const isMatch = await user.matchPassword(newPassword);
        console.log(`Verification - password match: ${isMatch}`);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

// Usage: node reset_user_password.js <email> <password>
const email = process.argv[2] || 'bhupendrayadav2024@gmail.com'; // Default from previous context if any
const password = process.argv[3] || 'password123';

resetPassword(email, password);
