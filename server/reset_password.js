const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'bhupendrayadav2077@gmail.com';
        const newPassword = '12345678';

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} NOT found.`);
        } else {
            console.log(`User Found: ${user.name}. Resetting password...`);
            user.password = newPassword;
            await user.save();
            console.log('Password updated successfully.');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error during password reset:', error);
    }
};

resetPassword();
