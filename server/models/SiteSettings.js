const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    emergencyContact: {
        type: String,
        default: '+91 1234567890'
    },
    address: {
        type: String,
        default: '123, Health Street, Medical District, City - 400001'
    },
    email: {
        type: String,
        default: 'support@smarthealth.com'
    }
}, { timestamps: true });

// Prevent multiple documents by checking if one exists before creating (handled in controller) or singleton pattern
module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
