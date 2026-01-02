const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const fixNotifications = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all users who are NOT doctors
        const users = await User.find({ isDoctor: false });
        let updatedCount = 0;

        for (const user of users) {
            let changed = false;

            // Check unseenNotifications
            if (user.unseenNotifications && user.unseenNotifications.length > 0) {
                user.unseenNotifications = user.unseenNotifications.map(notification => {
                    if (notification.onClickPath === '/doctor-appointments') {
                        notification.onClickPath = '/appointments';
                        changed = true;
                    }
                    return notification;
                });
            }

            // Check seenNotifications
            if (user.seenNotifications && user.seenNotifications.length > 0) {
                user.seenNotifications = user.seenNotifications.map(notification => {
                    if (notification.onClickPath === '/doctor-appointments') {
                        notification.onClickPath = '/appointments';
                        changed = true;
                    }
                    return notification;
                });
            }

            if (changed) {
                // Must mark as modified for array changes to persist in some mongoose versions
                user.markModified('unseenNotifications');
                user.markModified('seenNotifications');
                await user.save();
                updatedCount++;
                console.log(`Updated notifications for user: ${user.name}`);
            }
        }

        console.log(`\nSuccess: Fixed notifications for ${updatedCount} users.`);
        mongoose.connection.close();
    } catch (error) {
        console.error('Error during notification fix:', error);
    }
};

fixNotifications();
