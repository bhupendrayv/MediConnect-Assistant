const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const SiteSettings = require('./models/SiteSettings');

const updateSettings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        let settings = await SiteSettings.findOne();
        if (settings) {
            settings.email = 'medi.connectofficial2026@gmail.com';
            await settings.save();
            console.log('Updated existing SiteSettings email to: medi.connectofficial2026@gmail.com');
        } else {
            settings = new SiteSettings({
                email: 'medi.connectofficial2026@gmail.com',
                emergencyContact: '+91 9942199618', // Keep what was there or use default
                address: '123, Health Street, Medical District, City - 400001'
            });
            await settings.save();
            console.log('Created new SiteSettings with email: medi.connectofficial2026@gmail.com');
        }

        console.log('Final SiteSettings:', settings);
        mongoose.connection.close();
    } catch (error) {
        console.error('Error updating settings:', error);
        process.exit(1);
    }
};

updateSettings();
