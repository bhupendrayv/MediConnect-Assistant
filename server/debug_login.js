const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const diagnose = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'medi.connectofficial2026@gmail.com';
        const rawPassword = '12345678';

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} NOT found.`);
        } else {
            console.log(`\nUser Found:`);
            console.log(`- ID: ${user._id}`);
            console.log(`- Name: ${user.name}`);
            console.log(`- Email: ${user.email}`);
            console.log(`- Role: ${user.role}`);

            const isMatch = await user.matchPassword(rawPassword);
            console.log(`- Password Match ('${rawPassword}'): ${isMatch}`);

            if (!isMatch) {
                console.log(`- Hashed Password in DB: ${user.password}`);

                // Let's also check if the hash might be for '12345678' manually
                const testHash = await bcrypt.compare(rawPassword, user.password);
                console.log(`- Manual bcrypt.compare Match: ${testHash}`);
            }
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error during diagnosis:', error);
    }
};

diagnose();
