const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const testRegister = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const testEmail = `test_${Date.now()}@example.com`;
        const testUser = {
            name: 'Test Assistant',
            email: testEmail,
            password: 'password123',
            role: 'patient'
        };

        console.log('Attempting to register user:', testUser);

        const newUser = new User(testUser);
        await newUser.save();

        console.log('User registered successfully');
        
        const foundUser = await User.findOne({ email: testEmail });
        console.log('Found user in DB:', foundUser.email, 'Role:', foundUser.role);
        
        // Clean up
        await User.deleteOne({ email: testEmail });
        console.log('Cleaned up test user');

    } catch (error) {
        console.error('Registration failed with error:', error);
    } finally {
        await mongoose.connection.close();
    }
};

testRegister();
