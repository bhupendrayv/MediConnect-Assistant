const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    emergencyContact: {
        type: String,
        default: '+91 1234567890',
        trim: true,
    },
    address: {
        type: String,
        default: '123, Health Street, Medical District, City - 400001',
        trim: true,
    },
    email: {
        type: String,
        default: 'medi.connectofficial2026@gmail.com',
        trim: true,
        lowercase: true,
    }
}, { timestamps: true });

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

module.exports = SiteSettings;
