const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'testuser@example.com';
        const password = 'password123';

        // 1. Cleanup existing test user
        await User.deleteOne({ email });

        // 2. Register user
        const newUser = new User({
            name: 'Test User',
            email,
            password,
            role: 'patient'
        });
        await newUser.save();
        console.log('User registered with password:', password);

        // 3. Find user and check hash
        const foundUser = await User.findOne({ email });
        console.log('Stored hash:', foundUser.password);

        // 4. Test matchPassword
        const isMatch = await foundUser.matchPassword(password);
        console.log('Password match check (correct password):', isMatch);

        const isWrongMatch = await foundUser.matchPassword('wrongpassword');
        console.log('Password match check (wrong password):', isWrongMatch);

        if (isMatch && !isWrongMatch) {
            console.log('SUCCESS: Login logic is working correctly.');
        } else {
            console.log('FAILURE: Login logic is broken.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Test Error:', error);
        process.exit(1);
    }
};

testLogin();
