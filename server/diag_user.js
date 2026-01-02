const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ name: 'Bhupendra Yadav' });
        if (user) {
            console.log('\nUser Found:');
            console.log(`- ID: ${user._id}`);
            console.log(`- Name: ${user.name}`);
            console.log(`- Role: ${user.role}`);
            console.log(`- isDoctor: ${user.isDoctor}`);
            console.log(`- Status: ${user.status}`);
            console.log(`- unseenNotifications: ${JSON.stringify(user.unseenNotifications, null, 2)}`);
        } else {
            console.log('User Bhupendra Yadav not found');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkUser();
